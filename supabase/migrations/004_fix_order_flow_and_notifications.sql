-- ============================================
-- SWATO Database - Fix Order Flow & Add Notifications
-- ============================================
-- This migration fixes:
-- 1. Missing columns causing order insert failures
-- 2. Overly strict restaurant validation trigger
-- 3. Missing RLS policies for drivers reading order_items
-- 4. Automated notification triggers for real-time order flow
-- 5. Order event logging on status changes
-- Created: February 2026

-- ============================================
-- 1. ADD MISSING COLUMNS TO ORDERS TABLE
-- ============================================
DO $$
BEGIN
  -- Add special_instructions (JSONB array for delivery instructions like "leave at door")
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public'
                 AND table_name = 'orders'
                 AND column_name = 'special_instructions') THEN
    ALTER TABLE public.orders ADD COLUMN special_instructions JSONB DEFAULT '[]';
    RAISE NOTICE 'Added special_instructions column to orders';
  END IF;

  -- Add delivery_tip
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public'
                 AND table_name = 'orders'
                 AND column_name = 'delivery_tip') THEN
    ALTER TABLE public.orders ADD COLUMN delivery_tip DECIMAL(10, 2) DEFAULT 0;
    RAISE NOTICE 'Added delivery_tip column to orders';
  END IF;

  -- Add preparation_started_at for partner app tracking
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public'
                 AND table_name = 'orders'
                 AND column_name = 'preparation_started_at') THEN
    ALTER TABLE public.orders ADD COLUMN preparation_started_at TIMESTAMPTZ;
    RAISE NOTICE 'Added preparation_started_at column to orders';
  END IF;

  -- Add platform_fee
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public'
                 AND table_name = 'orders'
                 AND column_name = 'platform_fee') THEN
    ALTER TABLE public.orders ADD COLUMN platform_fee DECIMAL(10, 2) DEFAULT 0;
    RAISE NOTICE 'Added platform_fee column to orders';
  END IF;
END $$;

-- ============================================
-- 2. ADD MISSING COLUMNS TO ORDER_ITEMS TABLE
-- ============================================
DO $$
BEGIN
  -- Add variant_name for selected variant
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public'
                 AND table_name = 'order_items'
                 AND column_name = 'variant_name') THEN
    ALTER TABLE public.order_items ADD COLUMN variant_name TEXT;
    RAISE NOTICE 'Added variant_name column to order_items';
  END IF;

  -- Add variant_price
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public'
                 AND table_name = 'order_items'
                 AND column_name = 'variant_price') THEN
    ALTER TABLE public.order_items ADD COLUMN variant_price DECIMAL(10, 2);
    RAISE NOTICE 'Added variant_price column to order_items';
  END IF;

  -- Add addons (JSONB array of selected add-ons)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public'
                 AND table_name = 'order_items'
                 AND column_name = 'addons') THEN
    ALTER TABLE public.order_items ADD COLUMN addons JSONB DEFAULT '[]';
    RAISE NOTICE 'Added addons column to order_items';
  END IF;

  -- Add subtotal if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public'
                 AND table_name = 'order_items'
                 AND column_name = 'subtotal') THEN
    ALTER TABLE public.order_items ADD COLUMN subtotal DECIMAL(10, 2);
    RAISE NOTICE 'Added subtotal column to order_items';
  END IF;
END $$;

-- ============================================
-- 3. FIX RESTAURANT VALIDATION TRIGGER
-- ============================================
-- The existing trigger is too strict - it blocks orders from restaurants 
-- that aren't marked as 'approved'. Replace with a more lenient version
-- that only checks is_active and is_online.

CREATE OR REPLACE FUNCTION public.validate_order_restaurant()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_restaurant_name TEXT;
    v_is_online BOOLEAN;
    v_is_active BOOLEAN;
BEGIN
    -- Get restaurant details
    SELECT
        name,
        COALESCE(is_online, true),
        is_active
    INTO
        v_restaurant_name,
        v_is_online,
        v_is_active
    FROM public.restaurants
    WHERE id = NEW.restaurant_id;

    -- Check if restaurant exists
    IF v_restaurant_name IS NULL THEN
        RAISE EXCEPTION 'Restaurant not found: %', NEW.restaurant_id;
    END IF;

    -- Check if restaurant is active
    IF NOT v_is_active THEN
        RAISE EXCEPTION 'Restaurant "%" is not currently active', v_restaurant_name;
    END IF;

    -- Check if restaurant is online (soft check - allow if is_online is NULL)
    IF v_is_online = false THEN
        RAISE EXCEPTION 'Restaurant "%" is currently offline and not accepting orders', v_restaurant_name;
    END IF;

    RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS validate_order_restaurant_trigger ON public.orders;
CREATE TRIGGER validate_order_restaurant_trigger
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_order_restaurant();

-- ============================================
-- 4. ADD MISSING RLS POLICIES
-- ============================================

-- Drivers can read order_items for their assigned orders
DROP POLICY IF EXISTS "Drivers can read their order items" ON public.order_items;
CREATE POLICY "Drivers can read their order items"
  ON public.order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.driver_id IN (
        SELECT id FROM public.drivers WHERE user_id = auth.uid()
      )
    )
  );

-- Customers can also update their own orders (for cancellation)
DROP POLICY IF EXISTS "Customers can update their own orders" ON public.orders;
CREATE POLICY "Customers can update their own orders"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

-- Drivers can read orders that are ready (for browsing available deliveries)
DROP POLICY IF EXISTS "Drivers can read ready orders" ON public.orders;
CREATE POLICY "Drivers can read ready orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    status = 'ready' AND driver_id IS NULL
    AND EXISTS (SELECT 1 FROM public.drivers WHERE user_id = auth.uid())
  );

-- Drivers can update ready orders (to assign themselves)
DROP POLICY IF EXISTS "Drivers can accept ready orders" ON public.orders;
CREATE POLICY "Drivers can accept ready orders"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (
    (status = 'ready' AND driver_id IS NULL)
    OR driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
  );

-- ============================================
-- 5. ORDER STATUS CHANGE NOTIFICATION FUNCTION
-- ============================================
-- This function runs on every order status change and:
-- 1. Logs the event in order_events
-- 2. Creates notifications for relevant parties

CREATE OR REPLACE FUNCTION public.handle_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_customer_id UUID;
  v_restaurant_owner_id UUID;
  v_driver_user_id UUID;
  v_order_number TEXT;
  v_restaurant_name TEXT;
  v_old_status TEXT;
  v_new_status TEXT;
BEGIN
  -- Only process if status actually changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  v_old_status := OLD.status;
  v_new_status := NEW.status;
  v_customer_id := NEW.customer_id;
  v_order_number := NEW.order_number;

  -- Get restaurant info
  SELECT name, owner_id INTO v_restaurant_name, v_restaurant_owner_id
  FROM public.restaurants WHERE id = NEW.restaurant_id;

  -- Get driver user_id if assigned
  IF NEW.driver_id IS NOT NULL THEN
    SELECT user_id INTO v_driver_user_id
    FROM public.drivers WHERE id = NEW.driver_id;
  END IF;

  -- Log the status change event
  INSERT INTO public.order_events (
    order_id, status, actor_type, notes, metadata
  ) VALUES (
    NEW.id,
    v_new_status,
    CASE
      WHEN v_new_status IN ('confirmed', 'preparing', 'ready') THEN 'restaurant'
      WHEN v_new_status IN ('assigned', 'picked_up', 'delivered') THEN 'driver'
      WHEN v_new_status = 'cancelled' THEN
        CASE WHEN NEW.cancelled_by = 'restaurant' THEN 'restaurant' ELSE 'customer' END
      ELSE 'system'
    END,
    format('Status changed from %s to %s', v_old_status, v_new_status),
    jsonb_build_object(
      'previous_status', v_old_status,
      'new_status', v_new_status,
      'timestamp', NOW()
    )
  );

  -- Create notifications based on the new status
  CASE v_new_status
    -- Order confirmed by restaurant → notify customer
    WHEN 'confirmed' THEN
      INSERT INTO public.user_notifications (user_id, type, title, message, data)
      VALUES (
        v_customer_id,
        'order_update',
        'Order Confirmed!',
        format('Your order #%s has been confirmed by %s', v_order_number, COALESCE(v_restaurant_name, 'the restaurant')),
        jsonb_build_object('order_id', NEW.id, 'status', 'confirmed')
      );

    -- Preparing → notify customer
    WHEN 'preparing' THEN
      INSERT INTO public.user_notifications (user_id, type, title, message, data)
      VALUES (
        v_customer_id,
        'order_update',
        'Order Being Prepared',
        format('Your order #%s is now being prepared', v_order_number),
        jsonb_build_object('order_id', NEW.id, 'status', 'preparing')
      );

    -- Ready → notify customer + all online drivers
    WHEN 'ready' THEN
      -- Notify customer
      INSERT INTO public.user_notifications (user_id, type, title, message, data)
      VALUES (
        v_customer_id,
        'order_update',
        'Order Ready!',
        format('Your order #%s is ready and waiting for a delivery partner', v_order_number),
        jsonb_build_object('order_id', NEW.id, 'status', 'ready')
      );

      -- Notify all online, verified drivers who are not on hold
      INSERT INTO public.user_notifications (user_id, type, title, message, data)
      SELECT
        d.user_id,
        'delivery_request',
        'New Delivery Available!',
        format('Order #%s from %s is ready for pickup - ₹%s', v_order_number, COALESCE(v_restaurant_name, 'Restaurant'), NEW.total),
        jsonb_build_object(
          'order_id', NEW.id,
          'restaurant_name', v_restaurant_name,
          'delivery_address', NEW.delivery_address,
          'total', NEW.total
        )
      FROM public.drivers d
      WHERE d.is_online = true
        AND d.is_verified = true
        AND COALESCE(d.on_hold, false) = false;

    -- Assigned (driver accepted) → notify customer + restaurant
    WHEN 'assigned' THEN
      -- Notify customer
      INSERT INTO public.user_notifications (user_id, type, title, message, data)
      VALUES (
        v_customer_id,
        'order_update',
        'Driver Assigned!',
        format('A delivery partner has been assigned to your order #%s', v_order_number),
        jsonb_build_object('order_id', NEW.id, 'status', 'assigned', 'driver_id', NEW.driver_id)
      );

      -- Notify restaurant owner
      IF v_restaurant_owner_id IS NOT NULL THEN
        INSERT INTO public.user_notifications (user_id, type, title, message, data)
        VALUES (
          v_restaurant_owner_id,
          'order_update',
          'Driver Assigned',
          format('A delivery partner is heading to pick up order #%s', v_order_number),
          jsonb_build_object('order_id', NEW.id, 'status', 'assigned', 'driver_id', NEW.driver_id)
        );
      END IF;

    -- Picked up → notify customer
    WHEN 'picked_up' THEN
      INSERT INTO public.user_notifications (user_id, type, title, message, data)
      VALUES (
        v_customer_id,
        'order_update',
        'Out for Delivery!',
        format('Your order #%s has been picked up and is on its way!', v_order_number),
        jsonb_build_object('order_id', NEW.id, 'status', 'picked_up', 'driver_id', NEW.driver_id)
      );

    -- Delivered → notify customer + restaurant
    WHEN 'delivered' THEN
      -- Notify customer
      INSERT INTO public.user_notifications (user_id, type, title, message, data)
      VALUES (
        v_customer_id,
        'order_update',
        'Order Delivered!',
        format('Your order #%s has been delivered. Enjoy your meal! 🍽️', v_order_number),
        jsonb_build_object('order_id', NEW.id, 'status', 'delivered')
      );

      -- Notify restaurant
      IF v_restaurant_owner_id IS NOT NULL THEN
        INSERT INTO public.user_notifications (user_id, type, title, message, data)
        VALUES (
          v_restaurant_owner_id,
          'order_update',
          'Order Delivered',
          format('Order #%s has been successfully delivered', v_order_number),
          jsonb_build_object('order_id', NEW.id, 'status', 'delivered')
        );
      END IF;

    -- Cancelled → notify relevant parties
    WHEN 'cancelled' THEN
      -- Always notify customer
      INSERT INTO public.user_notifications (user_id, type, title, message, data)
      VALUES (
        v_customer_id,
        'order_update',
        'Order Cancelled',
        format('Your order #%s has been cancelled. %s',
          v_order_number,
          COALESCE('Reason: ' || NEW.cancellation_reason, '')),
        jsonb_build_object('order_id', NEW.id, 'status', 'cancelled', 'reason', NEW.cancellation_reason)
      );

      -- Notify restaurant if cancelled by customer
      IF NEW.cancelled_by != 'restaurant' AND v_restaurant_owner_id IS NOT NULL THEN
        INSERT INTO public.user_notifications (user_id, type, title, message, data)
        VALUES (
          v_restaurant_owner_id,
          'order_update',
          'Order Cancelled by Customer',
          format('Order #%s has been cancelled by the customer', v_order_number),
          jsonb_build_object('order_id', NEW.id, 'status', 'cancelled')
        );
      END IF;

      -- Notify driver if one was assigned
      IF v_driver_user_id IS NOT NULL THEN
        INSERT INTO public.user_notifications (user_id, type, title, message, data)
        VALUES (
          v_driver_user_id,
          'order_update',
          'Order Cancelled',
          format('Order #%s has been cancelled', v_order_number),
          jsonb_build_object('order_id', NEW.id, 'status', 'cancelled')
        );
      END IF;

    ELSE
      -- For any other status change, just log (already logged above)
      NULL;
  END CASE;

  RETURN NEW;
END;
$$;

-- Create the trigger (fires AFTER update so the row is committed)
DROP TRIGGER IF EXISTS order_status_change_trigger ON public.orders;
CREATE TRIGGER order_status_change_trigger
    AFTER UPDATE OF status ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_order_status_change();

-- ============================================
-- 6. ORDER CREATION NOTIFICATION FUNCTION
-- ============================================
-- Notifies restaurant owner when a new order is placed

CREATE OR REPLACE FUNCTION public.handle_new_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_restaurant_owner_id UUID;
  v_restaurant_name TEXT;
BEGIN
  -- Get restaurant info
  SELECT owner_id, name INTO v_restaurant_owner_id, v_restaurant_name
  FROM public.restaurants WHERE id = NEW.restaurant_id;

  -- Log order creation event
  INSERT INTO public.order_events (
    order_id, status, actor_type, actor_id, notes, metadata
  ) VALUES (
    NEW.id,
    'pending',
    'customer',
    NEW.customer_id,
    'Order placed by customer',
    jsonb_build_object(
      'total', NEW.total,
      'payment_method', NEW.payment_method,
      'timestamp', NOW()
    )
  );

  -- Notify restaurant owner
  IF v_restaurant_owner_id IS NOT NULL THEN
    INSERT INTO public.user_notifications (user_id, type, title, message, data)
    VALUES (
      v_restaurant_owner_id,
      'new_order',
      'New Order Received!',
      format('New order #%s - ₹%s', NEW.order_number, NEW.total),
      jsonb_build_object(
        'order_id', NEW.id,
        'order_number', NEW.order_number,
        'total', NEW.total,
        'status', 'pending'
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create the trigger for new orders
DROP TRIGGER IF EXISTS new_order_notification_trigger ON public.orders;
CREATE TRIGGER new_order_notification_trigger
    AFTER INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_order();

-- ============================================
-- 7. STATUS TRANSITION VALIDATION
-- ============================================
-- Enforce valid status transitions to prevent invalid state changes

CREATE OR REPLACE FUNCTION public.validate_order_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only validate if status is changing
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Define valid transitions
  -- pending → confirmed, cancelled
  -- confirmed → preparing, cancelled
  -- preparing → ready, cancelled
  -- ready → assigned, cancelled
  -- assigned → picked_up, cancelled
  -- picked_up → delivered, cancelled
  -- delivered → (terminal)
  -- cancelled → (terminal)

  IF OLD.status = 'pending' AND NEW.status NOT IN ('confirmed', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status transition: % → %. Pending orders can only be confirmed or cancelled.', OLD.status, NEW.status;
  ELSIF OLD.status = 'confirmed' AND NEW.status NOT IN ('preparing', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status transition: % → %. Confirmed orders can only move to preparing or cancelled.', OLD.status, NEW.status;
  ELSIF OLD.status = 'preparing' AND NEW.status NOT IN ('ready', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status transition: % → %. Preparing orders can only move to ready or cancelled.', OLD.status, NEW.status;
  ELSIF OLD.status = 'ready' AND NEW.status NOT IN ('assigned', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status transition: % → %. Ready orders can only be assigned or cancelled.', OLD.status, NEW.status;
  ELSIF OLD.status = 'assigned' AND NEW.status NOT IN ('picked_up', 'ready', 'cancelled') THEN
    -- assigned can go back to ready (if driver declines)
    RAISE EXCEPTION 'Invalid status transition: % → %. Assigned orders can only be picked up, returned to ready, or cancelled.', OLD.status, NEW.status;
  ELSIF OLD.status = 'picked_up' AND NEW.status NOT IN ('delivered', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status transition: % → %. Picked up orders can only be delivered or cancelled.', OLD.status, NEW.status;
  ELSIF OLD.status IN ('delivered', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status transition: % → %. % orders cannot change status.', OLD.status, NEW.status, OLD.status;
  END IF;

  -- Auto-set timestamps based on status
  IF NEW.status = 'assigned' AND NEW.assigned_at IS NULL THEN
    NEW.assigned_at := NOW();
  END IF;

  IF NEW.status = 'picked_up' AND NEW.picked_up_at IS NULL THEN
    NEW.picked_up_at := NOW();
  END IF;

  IF NEW.status = 'delivered' AND NEW.delivered_at IS NULL THEN
    NEW.delivered_at := NOW();
    NEW.actual_delivery_time := NOW()::TEXT;
  END IF;

  -- Always update updated_at
  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$;

-- Create the trigger BEFORE update (so we can modify NEW)
DROP TRIGGER IF EXISTS validate_order_status_transition_trigger ON public.orders;
CREATE TRIGGER validate_order_status_transition_trigger
    BEFORE UPDATE OF status ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_order_status_transition();

-- ============================================
-- 8. ENSURE REALTIME IS ENABLED ON ALL TABLES
-- ============================================
DO $$
BEGIN
  -- orders table
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'orders already in realtime publication';
  END;

  -- order_items table
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'order_items already in realtime publication';
  END;

  -- order_events table
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.order_events;
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'order_events already in realtime publication';
  END;

  -- user_notifications table
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_notifications;
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'user_notifications already in realtime publication';
  END;

  -- driver_locations table
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_locations;
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'driver_locations already in realtime publication';
  END;

  -- restaurants table
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurants;
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'restaurants already in realtime publication';
  END;

  -- drivers table
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.drivers;
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'drivers already in realtime publication';
  END;
END $$;

-- ============================================
-- 9. ADD INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON public.orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_driver_id ON public.orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_restaurant ON public.orders(restaurant_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_status_driver ON public.orders(driver_id, status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_driver_locations_driver_id ON public.driver_locations(driver_id);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON FUNCTION public.handle_order_status_change IS 'Automatically logs events and sends notifications on order status changes';
COMMENT ON FUNCTION public.handle_new_order IS 'Notifies restaurant when a new order is placed';
COMMENT ON FUNCTION public.validate_order_status_transition IS 'Enforces valid order status transitions and auto-sets timestamps';

DO $$ BEGIN RAISE NOTICE 'Order flow fix migration completed successfully'; END $$;
