-- ============================================================
-- SWATO ORDER-TO-DELIVERY PRODUCTION WORKFLOW
-- Migration: 021_order_delivery_workflow.sql
-- ============================================================
-- This migration adds:
-- 1. Pickup OTP table for secure restaurant↔driver verification
-- 2. Delivery assignment queue for nearby driver matching
-- 3. Updated status transitions with new statuses
-- 4. Backend functions for driver detection + assignment
-- 5. Triggers for automatic workflow progression
-- ============================================================

-- ============================================
-- 1. PICKUP OTP TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.pickup_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  otp_code TEXT NOT NULL,
  generated_by UUID, -- restaurant user who generated it
  verified_by UUID, -- driver user who verified it
  is_verified BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint: only one active OTP per order
CREATE UNIQUE INDEX IF NOT EXISTS idx_pickup_otps_active_order
  ON public.pickup_otps(order_id) WHERE is_verified = false;

CREATE INDEX IF NOT EXISTS idx_pickup_otps_order_id ON public.pickup_otps(order_id);

-- ============================================
-- 2. DELIVERY ASSIGNMENT QUEUE
-- ============================================
CREATE TABLE IF NOT EXISTS public.delivery_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, declined, expired, cancelled
  distance_km FLOAT, -- distance from driver to restaurant
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '60 seconds',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.delivery_requests 
  DROP CONSTRAINT IF EXISTS delivery_requests_status_check;
ALTER TABLE public.delivery_requests 
  ADD CONSTRAINT delivery_requests_status_check 
  CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled'));

CREATE INDEX IF NOT EXISTS idx_delivery_requests_order_id ON public.delivery_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_requests_driver_id ON public.delivery_requests(driver_id);
CREATE INDEX IF NOT EXISTS idx_delivery_requests_status ON public.delivery_requests(status);

-- ============================================
-- 3. ADD MISSING COLUMNS TO ORDERS TABLE
-- ============================================
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pickup_otp TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS otp_verified_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS driver_assigned_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS restaurant_lat FLOAT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS restaurant_lng FLOAT;

-- ============================================
-- 4. ADD COLUMNS TO DRIVERS TABLE
-- ============================================
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS current_order_id UUID REFERENCES public.orders(id);
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS last_order_completed_at TIMESTAMPTZ;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS acceptance_rate FLOAT DEFAULT 100.0;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS avg_delivery_time_mins FLOAT;

-- ============================================
-- 5. FUNCTION: Generate Pickup OTP
-- ============================================
CREATE OR REPLACE FUNCTION public.generate_pickup_otp(
  p_order_id UUID,
  p_generated_by UUID DEFAULT NULL
)
RETURNS TABLE(otp_code TEXT, expires_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_otp TEXT;
  v_expires TIMESTAMPTZ;
  v_order_status TEXT;
BEGIN
  -- Validate order exists and is in correct status
  SELECT status INTO v_order_status FROM public.orders WHERE id = p_order_id;
  
  IF v_order_status IS NULL THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  
  IF v_order_status NOT IN ('assigned', 'ready') THEN
    RAISE EXCEPTION 'Order must be in assigned or ready status to generate OTP. Current: %', v_order_status;
  END IF;

  -- Generate 4-digit OTP
  v_otp := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  v_expires := NOW() + INTERVAL '30 minutes';

  -- Delete any existing unverified OTPs for this order
  DELETE FROM public.pickup_otps 
  WHERE order_id = p_order_id AND is_verified = false;

  -- Insert new OTP
  INSERT INTO public.pickup_otps (order_id, otp_code, generated_by, expires_at)
  VALUES (p_order_id, v_otp, p_generated_by, v_expires);

  -- Store OTP on order for quick access
  UPDATE public.orders SET pickup_otp = v_otp WHERE id = p_order_id;

  RETURN QUERY SELECT v_otp, v_expires;
END;
$$;

-- ============================================
-- 6. FUNCTION: Verify Pickup OTP
-- ============================================
CREATE OR REPLACE FUNCTION public.verify_pickup_otp(
  p_order_id UUID,
  p_otp_code TEXT,
  p_driver_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_otp_record RECORD;
  v_order RECORD;
BEGIN
  -- Get the active OTP
  SELECT * INTO v_otp_record 
  FROM public.pickup_otps 
  WHERE order_id = p_order_id 
    AND is_verified = false 
  ORDER BY created_at DESC 
  LIMIT 1;

  IF v_otp_record IS NULL THEN
    RAISE EXCEPTION 'No active OTP found for this order';
  END IF;

  -- Check expiry
  IF v_otp_record.expires_at < NOW() THEN
    RAISE EXCEPTION 'OTP has expired. Please request a new one.';
  END IF;

  -- Check max attempts
  IF v_otp_record.attempts >= v_otp_record.max_attempts THEN
    RAISE EXCEPTION 'Maximum OTP attempts exceeded. Please request a new OTP.';
  END IF;

  -- Increment attempt count
  UPDATE public.pickup_otps 
  SET attempts = attempts + 1 
  WHERE id = v_otp_record.id;

  -- Verify OTP
  IF v_otp_record.otp_code != p_otp_code THEN
    RETURN false;
  END IF;

  -- OTP is correct - mark as verified
  UPDATE public.pickup_otps 
  SET is_verified = true, 
      verified_at = NOW(),
      verified_by = p_driver_user_id
  WHERE id = v_otp_record.id;

  -- Update order: move to picked_up status
  UPDATE public.orders 
  SET status = 'picked_up',
      otp_verified_at = NOW(),
      picked_up_at = NOW(),
      updated_at = NOW()
  WHERE id = p_order_id 
    AND status = 'assigned';

  -- Get order details
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;

  -- Log the pickup event
  INSERT INTO public.order_events (order_id, status, actor_type, actor_id, notes)
  VALUES (p_order_id, 'picked_up', 'driver', p_driver_user_id, 'OTP verified, order picked up');

  -- Notify customer
  INSERT INTO public.user_notifications (user_id, type, title, message, data)
  VALUES (
    v_order.customer_id,
    'order_update',
    'Order Picked Up! 🏍️',
    'Your order has been picked up and is on its way!',
    jsonb_build_object('order_id', p_order_id, 'status', 'picked_up')
  );

  RETURN true;
END;
$$;

-- ============================================
-- 7. FUNCTION: Find Nearby Drivers
-- ============================================
CREATE OR REPLACE FUNCTION public.find_nearby_drivers(
  p_restaurant_lat FLOAT,
  p_restaurant_lng FLOAT,
  p_radius_km FLOAT DEFAULT 5.0,
  p_order_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
  driver_id UUID,
  driver_user_id UUID,
  driver_name TEXT,
  distance_km FLOAT,
  rating FLOAT,
  total_deliveries INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id AS driver_id,
    d.user_id AS driver_user_id,
    u.name AS driver_name,
    -- Haversine formula for distance in km
    (6371 * acos(
      LEAST(1.0, GREATEST(-1.0,
        cos(radians(p_restaurant_lat)) * cos(radians(d.current_lat)) *
        cos(radians(d.current_lng) - radians(p_restaurant_lng)) +
        sin(radians(p_restaurant_lat)) * sin(radians(d.current_lat))
      ))
    ))::FLOAT AS distance_km,
    COALESCE(d.rating, 0)::FLOAT AS rating,
    COALESCE(d.total_deliveries, 0)::INTEGER AS total_deliveries
  FROM public.drivers d
  JOIN public.users u ON u.id = d.user_id
  WHERE d.is_online = true
    AND d.is_verified = true
    AND d.current_order_id IS NULL -- not on an active delivery
    AND d.current_lat IS NOT NULL
    AND d.current_lng IS NOT NULL
    -- Filter by rough bounding box first (performance optimization)
    AND d.current_lat BETWEEN (p_restaurant_lat - (p_radius_km / 111.0)) 
                          AND (p_restaurant_lat + (p_radius_km / 111.0))
    AND d.current_lng BETWEEN (p_restaurant_lng - (p_radius_km / (111.0 * cos(radians(p_restaurant_lat))))) 
                          AND (p_restaurant_lng + (p_radius_km / (111.0 * cos(radians(p_restaurant_lat)))))
    -- Exclude drivers who already declined this order
    AND (p_order_id IS NULL OR d.id NOT IN (
      SELECT dr.driver_id FROM public.delivery_requests dr 
      WHERE dr.order_id = p_order_id AND dr.status = 'declined'
    ))
  -- Apply exact Haversine filter
  HAVING (6371 * acos(
    LEAST(1.0, GREATEST(-1.0,
      cos(radians(p_restaurant_lat)) * cos(radians(d.current_lat)) *
      cos(radians(d.current_lng) - radians(p_restaurant_lng)) +
      sin(radians(p_restaurant_lat)) * sin(radians(d.current_lat))
    ))
  )) <= p_radius_km
  ORDER BY distance_km ASC, rating DESC
  LIMIT p_limit;
END;
$$;

-- ============================================
-- 8. FUNCTION: Request Delivery From Nearby Drivers
-- ============================================
CREATE OR REPLACE FUNCTION public.request_delivery_assignment(
  p_order_id UUID
)
RETURNS INTEGER -- returns count of drivers notified
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
  v_restaurant RECORD;
  v_driver RECORD;
  v_count INTEGER := 0;
BEGIN
  -- Get order details
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
  
  IF v_order IS NULL THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF v_order.status != 'ready' THEN
    RAISE EXCEPTION 'Order must be in ready status. Current: %', v_order.status;
  END IF;

  IF v_order.driver_id IS NOT NULL THEN
    RAISE EXCEPTION 'Order already has a driver assigned';
  END IF;

  -- Get restaurant location
  SELECT * INTO v_restaurant FROM public.restaurants WHERE id = v_order.restaurant_id;

  IF v_restaurant IS NULL THEN
    RAISE EXCEPTION 'Restaurant not found';
  END IF;

  -- Store restaurant location on order for tracking
  UPDATE public.orders 
  SET restaurant_lat = v_restaurant.latitude,
      restaurant_lng = v_restaurant.longitude
  WHERE id = p_order_id;

  -- Cancel any existing pending delivery requests for this order
  UPDATE public.delivery_requests
  SET status = 'cancelled'
  WHERE order_id = p_order_id AND status = 'pending';

  -- Find nearby drivers and create delivery requests
  FOR v_driver IN 
    SELECT * FROM public.find_nearby_drivers(
      COALESCE(v_restaurant.latitude, v_restaurant.lat, 0),
      COALESCE(v_restaurant.longitude, v_restaurant.lng, 0),
      5.0, -- 5km radius
      p_order_id,
      10 -- max 10 drivers
    )
  LOOP
    -- Create delivery request
    INSERT INTO public.delivery_requests (order_id, driver_id, distance_km, expires_at)
    VALUES (p_order_id, v_driver.driver_id, v_driver.distance_km, NOW() + INTERVAL '60 seconds');

    -- Notify the driver
    INSERT INTO public.user_notifications (user_id, type, title, message, data)
    VALUES (
      v_driver.driver_user_id,
      'delivery_request',
      'New Delivery Request! 🚀',
      format('New order from %s (%.1f km away) - ₹%.0f', 
        v_restaurant.name, v_driver.distance_km, v_order.total),
      jsonb_build_object(
        'order_id', p_order_id,
        'restaurant_name', v_restaurant.name,
        'restaurant_address', v_restaurant.address,
        'restaurant_lat', COALESCE(v_restaurant.latitude, v_restaurant.lat),
        'restaurant_lng', COALESCE(v_restaurant.longitude, v_restaurant.lng),
        'delivery_address', v_order.delivery_address,
        'delivery_lat', v_order.delivery_lat,
        'delivery_lng', v_order.delivery_lng,
        'total', v_order.total,
        'delivery_fee', v_order.delivery_fee,
        'distance_km', v_driver.distance_km
      )
    );

    v_count := v_count + 1;
  END LOOP;

  -- If no drivers found, create a notification for admin
  IF v_count = 0 THEN
    INSERT INTO public.user_notifications (user_id, type, title, message, data)
    SELECT 
      u.id, 
      'system_alert',
      'No Drivers Available ⚠️',
      format('Order %s has no available delivery partners within 5km', v_order.order_number),
      jsonb_build_object('order_id', p_order_id, 'order_number', v_order.order_number)
    FROM public.users u WHERE u.role = 'admin'
    LIMIT 1;
  END IF;

  RETURN v_count;
END;
$$;

-- ============================================
-- 9. FUNCTION: Accept Delivery (Driver)
-- ============================================
CREATE OR REPLACE FUNCTION public.accept_delivery(
  p_order_id UUID,
  p_driver_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
  v_driver RECORD;
  v_request RECORD;
BEGIN
  -- Lock the order row to prevent race conditions
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;

  IF v_order IS NULL THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  -- Check order is still available
  IF v_order.driver_id IS NOT NULL THEN
    RAISE EXCEPTION 'Order already assigned to another driver';
  END IF;

  IF v_order.status NOT IN ('ready') THEN
    RAISE EXCEPTION 'Order is not available for pickup. Status: %', v_order.status;
  END IF;

  -- Get driver details
  SELECT * INTO v_driver FROM public.drivers WHERE id = p_driver_id;

  IF v_driver IS NULL THEN
    RAISE EXCEPTION 'Driver not found';
  END IF;

  IF NOT v_driver.is_online THEN
    RAISE EXCEPTION 'Driver must be online to accept deliveries';
  END IF;

  IF NOT v_driver.is_verified THEN
    RAISE EXCEPTION 'Driver must be verified to accept deliveries';
  END IF;

  IF v_driver.current_order_id IS NOT NULL THEN
    RAISE EXCEPTION 'Driver already has an active delivery';
  END IF;

  -- Assign the driver to the order
  UPDATE public.orders 
  SET driver_id = p_driver_id,
      status = 'assigned',
      assigned_at = NOW(),
      driver_assigned_at = NOW(),
      updated_at = NOW()
  WHERE id = p_order_id;

  -- Update driver status
  UPDATE public.drivers 
  SET current_order_id = p_order_id
  WHERE id = p_driver_id;

  -- Mark this driver's request as accepted
  UPDATE public.delivery_requests 
  SET status = 'accepted', responded_at = NOW()
  WHERE order_id = p_order_id AND driver_id = p_driver_id AND status = 'pending';

  -- Cancel all other pending requests for this order
  UPDATE public.delivery_requests 
  SET status = 'cancelled', responded_at = NOW()
  WHERE order_id = p_order_id AND driver_id != p_driver_id AND status = 'pending';

  -- Log the assignment event
  INSERT INTO public.order_events (order_id, status, actor_type, actor_id, notes)
  VALUES (p_order_id, 'assigned', 'driver', v_driver.user_id, 
    format('Driver %s accepted the delivery', (SELECT name FROM public.users WHERE id = v_driver.user_id)));

  -- Notify restaurant
  INSERT INTO public.user_notifications (user_id, type, title, message, data)
  SELECT 
    r.owner_id,
    'driver_assigned',
    'Driver Assigned! 🚴',
    format('Driver %s is on the way to pick up order %s', 
      (SELECT name FROM public.users WHERE id = v_driver.user_id), v_order.order_number),
    jsonb_build_object(
      'order_id', p_order_id, 
      'driver_name', (SELECT name FROM public.users WHERE id = v_driver.user_id),
      'driver_phone', (SELECT phone FROM public.users WHERE id = v_driver.user_id)
    )
  FROM public.restaurants r WHERE r.id = v_order.restaurant_id;

  -- Notify customer
  INSERT INTO public.user_notifications (user_id, type, title, message, data)
  VALUES (
    v_order.customer_id,
    'order_update',
    'Driver Assigned! 🚴',
    format('Your order has been assigned to a delivery partner. They are heading to the restaurant.'),
    jsonb_build_object(
      'order_id', p_order_id, 
      'status', 'assigned',
      'driver_name', (SELECT name FROM public.users WHERE id = v_driver.user_id)
    )
  );

  -- Generate OTP for pickup
  PERFORM public.generate_pickup_otp(p_order_id, v_driver.user_id);

  RETURN true;
END;
$$;

-- ============================================
-- 10. FUNCTION: Decline Delivery (Driver)
-- ============================================
CREATE OR REPLACE FUNCTION public.decline_delivery(
  p_order_id UUID,
  p_driver_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mark the request as declined
  UPDATE public.delivery_requests 
  SET status = 'declined', responded_at = NOW()
  WHERE order_id = p_order_id AND driver_id = p_driver_id AND status = 'pending';

  -- Update driver acceptance rate
  UPDATE public.drivers 
  SET acceptance_rate = GREATEST(0, 
    COALESCE(acceptance_rate, 100) - 2 -- decrease by 2% per decline
  )
  WHERE id = p_driver_id;

  -- Check if there are other pending requests
  IF NOT EXISTS (
    SELECT 1 FROM public.delivery_requests 
    WHERE order_id = p_order_id AND status = 'pending'
  ) THEN
    -- No more pending requests - try finding new drivers
    PERFORM public.request_delivery_assignment(p_order_id);
  END IF;

  RETURN true;
END;
$$;

-- ============================================
-- 11. FUNCTION: Complete Delivery
-- ============================================
CREATE OR REPLACE FUNCTION public.complete_delivery(
  p_order_id UUID,
  p_driver_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
  v_driver RECORD;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;

  IF v_order IS NULL THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF v_order.status != 'picked_up' THEN
    RAISE EXCEPTION 'Order must be in picked_up status. Current: %', v_order.status;
  END IF;

  -- Update order to delivered
  UPDATE public.orders 
  SET status = 'delivered',
      delivered_at = NOW(),
      actual_delivery_time = NOW(),
      updated_at = NOW()
  WHERE id = p_order_id;

  -- Get driver record
  SELECT * INTO v_driver FROM public.drivers WHERE id = v_order.driver_id;

  -- Free up the driver
  UPDATE public.drivers 
  SET current_order_id = NULL,
      last_order_completed_at = NOW(),
      total_deliveries = COALESCE(total_deliveries, 0) + 1,
      total_earnings = COALESCE(total_earnings, 0) + COALESCE(v_order.delivery_fee, 0)
  WHERE id = v_order.driver_id;

  -- Log event
  INSERT INTO public.order_events (order_id, status, actor_type, actor_id, notes)
  VALUES (p_order_id, 'delivered', 'driver', p_driver_user_id, 'Order delivered successfully');

  -- Notify customer
  INSERT INTO public.user_notifications (user_id, type, title, message, data)
  VALUES (
    v_order.customer_id,
    'order_update',
    'Order Delivered! 🎉',
    'Your order has been delivered. Enjoy your meal!',
    jsonb_build_object('order_id', p_order_id, 'status', 'delivered')
  );

  -- Notify restaurant
  INSERT INTO public.user_notifications (user_id, type, title, message, data)
  SELECT 
    r.owner_id,
    'order_update',
    'Order Delivered ✅',
    format('Order %s has been delivered successfully', v_order.order_number),
    jsonb_build_object('order_id', p_order_id, 'status', 'delivered')
  FROM public.restaurants r WHERE r.id = v_order.restaurant_id;

  RETURN true;
END;
$$;

-- ============================================
-- 12. TRIGGER: Auto-request drivers when order is READY
-- ============================================
CREATE OR REPLACE FUNCTION public.auto_request_drivers_on_ready()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- When order moves to 'ready' and has no driver
  IF NEW.status = 'ready' AND OLD.status != 'ready' AND NEW.driver_id IS NULL THEN
    -- Fire the driver request asynchronously via pg_notify
    PERFORM pg_notify('order_ready', json_build_object(
      'order_id', NEW.id,
      'restaurant_id', NEW.restaurant_id
    )::TEXT);
    
    -- Also directly call the assignment function
    BEGIN
      PERFORM public.request_delivery_assignment(NEW.id);
    EXCEPTION WHEN OTHERS THEN
      -- Log error but don't fail the status update
      RAISE WARNING 'Failed to auto-request drivers: %', SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auto_request_drivers_trigger ON public.orders;
CREATE TRIGGER auto_request_drivers_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  WHEN (NEW.status = 'ready' AND OLD.status != 'ready')
  EXECUTE FUNCTION public.auto_request_drivers_on_ready();

-- ============================================
-- 13. TRIGGER: Expire stale delivery requests
-- ============================================
CREATE OR REPLACE FUNCTION public.expire_delivery_requests()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only expire if it's a pending request
  IF NEW.status = 'pending' AND NEW.expires_at < NOW() THEN
    NEW.status := 'expired';
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================
-- 14. RLS POLICIES
-- ============================================

-- Pickup OTPs
ALTER TABLE public.pickup_otps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Restaurant can manage OTPs" ON public.pickup_otps;
CREATE POLICY "Restaurant can manage OTPs" ON public.pickup_otps
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o 
      JOIN public.restaurants r ON r.id = o.restaurant_id 
      WHERE o.id = pickup_otps.order_id AND r.owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.drivers d ON d.id = o.driver_id
      WHERE o.id = pickup_otps.order_id AND d.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Delivery Requests
ALTER TABLE public.delivery_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Drivers can view own requests" ON public.delivery_requests;
CREATE POLICY "Drivers can view own requests" ON public.delivery_requests
  FOR SELECT TO authenticated
  USING (
    driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Drivers can update own requests" ON public.delivery_requests;
CREATE POLICY "Drivers can update own requests" ON public.delivery_requests
  FOR UPDATE TO authenticated
  USING (
    driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "System can manage delivery requests" ON public.delivery_requests;
CREATE POLICY "System can manage delivery requests" ON public.delivery_requests
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 15. ADD TO REALTIME PUBLICATION
-- ============================================
DO $$
BEGIN
  -- Add tables to realtime if not already there
  ALTER PUBLICATION supabase_realtime ADD TABLE public.pickup_otps;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pickup_otps may already be in publication: %', SQLERRM;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_requests;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'delivery_requests may already be in publication: %', SQLERRM;
END $$;

-- ============================================
-- DONE!
-- ============================================
-- Status flow enforced end-to-end:
-- placed → confirmed → preparing → ready → assigned → picked_up → delivered
--
-- Automatic workflow:
-- 1. User places order → status = 'pending'/'placed'
-- 2. Restaurant accepts → 'confirmed'
-- 3. Restaurant starts → 'preparing'
-- 4. Restaurant marks ready → 'ready'
-- 5. TRIGGER auto-finds nearby drivers → sends delivery_requests
-- 6. Driver accepts → 'assigned' + OTP generated
-- 7. Driver arrives, enters OTP → 'picked_up'
-- 8. Driver delivers → 'delivered'
-- ============================================