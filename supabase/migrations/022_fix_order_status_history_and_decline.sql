-- ============================================================
-- FIX: order_status_history FK constraint + decline_delivery RPC
-- Migration: 022_fix_order_status_history_and_decline.sql
-- ============================================================
-- Fixes:
-- 1. "order_status_history_created_by_fkey" FK violation when drivers update order status
--    The trigger inserts auth.uid() as created_by, but drivers may not have a public.users row
-- 2. Missing decline_delivery RPC function
-- ============================================================

-- ============================================
-- 1. FIX: Drop the FK constraint on order_status_history.created_by
-- ============================================
-- The created_by column references public.users(id), but delivery drivers
-- may not have a corresponding row in public.users (they use the drivers table).
-- When a driver accepts/declines an order, the status change trigger fires
-- and tries to insert auth.uid() as created_by, which violates the FK.

ALTER TABLE public.order_status_history
  DROP CONSTRAINT IF EXISTS order_status_history_created_by_fkey;

-- ============================================
-- 2. FIX: Replace/update the track_order_status trigger function
-- ============================================
-- If a trigger function exists that logs to order_status_history,
-- make it robust by catching FK errors gracefully.

CREATE OR REPLACE FUNCTION public.track_order_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only track if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.order_status_history (order_id, status, created_by, notes, created_at)
    VALUES (
      NEW.id,
      NEW.status,
      auth.uid(),  -- may be NULL for system updates
      format('Status changed from %s to %s', OLD.status, NEW.status),
      NOW()
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN foreign_key_violation THEN
    -- If created_by FK fails (driver not in users table), insert with NULL
    INSERT INTO public.order_status_history (order_id, status, created_by, notes, created_at)
    VALUES (
      NEW.id,
      NEW.status,
      NULL,
      format('Status changed from %s to %s (by driver)', OLD.status, NEW.status),
      NOW()
    );
    RETURN NEW;
END;
$$;

-- Ensure the trigger exists on the orders table
DROP TRIGGER IF EXISTS track_order_status_trigger ON public.orders;
CREATE TRIGGER track_order_status_trigger
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.track_order_status();

-- ============================================
-- 3. CREATE: decline_delivery RPC function
-- ============================================
-- Called by the delivery app when a driver declines an order.
-- Handles delivery_requests update and driver stats.

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
  -- Mark the delivery request as declined
  UPDATE public.delivery_requests
  SET status = 'declined', responded_at = NOW()
  WHERE order_id = p_order_id AND driver_id = p_driver_id AND status = 'pending';

  -- If the order was already assigned to this driver, reset it
  UPDATE public.orders
  SET status = 'ready', driver_id = NULL, updated_at = NOW()
  WHERE id = p_order_id AND driver_id = p_driver_id AND status = 'assigned';

  -- Update driver's current_order_id if it was this order
  UPDATE public.drivers
  SET current_order_id = NULL
  WHERE id = p_driver_id AND current_order_id = p_order_id;

  -- Log the decline event (ignore if order_events table has issues)
  BEGIN
    INSERT INTO public.order_events (order_id, status, actor_type, actor_id, notes)
    VALUES (p_order_id, 'driver_declined', 'driver', p_driver_id,
      COALESCE(p_reason, 'Driver declined the delivery'));
  EXCEPTION WHEN OTHERS THEN
    -- Ignore logging errors
    NULL;
  END;

  RETURN true;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.decline_delivery(UUID, UUID, TEXT) TO authenticated;

-- ============================================
-- 4. ENSURE: pickup_otp column exists on orders
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public'
                 AND table_name = 'orders'
                 AND column_name = 'pickup_otp') THEN
    ALTER TABLE public.orders ADD COLUMN pickup_otp TEXT;
    RAISE NOTICE 'Added pickup_otp column to orders';
  END IF;
END $$;

-- ============================================
-- 5. FUNCTION: Generate Pickup OTP
-- ============================================
CREATE OR REPLACE FUNCTION public.generate_pickup_otp(
  p_order_id UUID,
  p_generated_by UUID DEFAULT NULL
)
RETURNS TABLE(otp_code TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_otp TEXT;
BEGIN
  -- Generate a random 4-digit OTP
  v_otp := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

  -- Store OTP on the order for quick access
  UPDATE public.orders
  SET pickup_otp = v_otp, updated_at = NOW()
  WHERE id = p_order_id;

  -- Try to store in pickup_otps table if it exists
  BEGIN
    -- Delete old unverified OTPs for this order
    DELETE FROM public.pickup_otps
    WHERE order_id = p_order_id AND is_verified = false;

    -- Insert new OTP
    INSERT INTO public.pickup_otps (order_id, otp_code, generated_by, expires_at)
    VALUES (p_order_id, v_otp, p_generated_by, NOW() + INTERVAL '30 minutes');
  EXCEPTION WHEN OTHERS THEN
    -- pickup_otps table may not exist, that's fine
    NULL;
  END;

  RETURN QUERY SELECT v_otp;
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_pickup_otp(UUID, UUID) TO authenticated;

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
  v_order RECORD;
BEGIN
  -- Get order and check OTP
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;

  IF v_order IS NULL THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  -- Verify OTP matches
  IF v_order.pickup_otp IS NULL OR v_order.pickup_otp != p_otp_code THEN
    RETURN false;
  END IF;

  -- OTP matches — update order to picked_up
  UPDATE public.orders
  SET status = 'picked_up',
      updated_at = NOW()
  WHERE id = p_order_id;

  -- Mark in pickup_otps table if it exists
  BEGIN
    UPDATE public.pickup_otps
    SET is_verified = true, verified_at = NOW(), verified_by = p_driver_user_id
    WHERE order_id = p_order_id AND otp_code = p_otp_code AND is_verified = false;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  -- Log event
  BEGIN
    INSERT INTO public.order_events (order_id, status, actor_type, actor_id, notes)
    VALUES (p_order_id, 'picked_up', 'driver', p_driver_user_id,
      'Order picked up after OTP verification');
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  -- Notify customer
  BEGIN
    INSERT INTO public.user_notifications (user_id, type, title, message, data)
    VALUES (
      v_order.customer_id,
      'order_update',
      '🚗 Driver is on the way!',
      format('Order #%s has been picked up. Your driver is heading to you now.', v_order.order_number),
      jsonb_build_object('order_id', p_order_id, 'status', 'picked_up')
    );
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_pickup_otp(UUID, TEXT, UUID) TO authenticated;

-- ============================================
-- 7. ENSURE: Driver users exist in public.users
-- ============================================
-- Insert any driver users missing from public.users table.
-- This prevents future FK issues with any other constraints.

INSERT INTO public.users (id, email, name, phone, role, created_at, updated_at)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', au.raw_user_meta_data->>'full_name', 'Driver'),
  COALESCE(au.phone, au.raw_user_meta_data->>'phone', ''),
  'driver',
  au.created_at,
  NOW()
FROM auth.users au
INNER JOIN public.drivers d ON d.user_id = au.id
LEFT JOIN public.users u ON u.id = au.id
WHERE u.id IS NULL
ON CONFLICT (id) DO NOTHING;
