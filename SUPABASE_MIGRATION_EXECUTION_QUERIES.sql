-- ============================================
-- SWATO DATABASE MIGRATIONS - COMPLETE SQL
-- ============================================
-- Execute all queries in order in Supabase SQL Editor
-- Date: January 2026
-- ============================================

-- ============================================
-- MIGRATION 1: CREATE MISSING TABLES
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  review_type TEXT NOT NULL CHECK (review_type IN ('restaurant', 'driver', 'both')) DEFAULT 'restaurant',
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT reviews_target_check CHECK (
    (review_type = 'restaurant' AND restaurant_id IS NOT NULL) OR
    (review_type = 'driver' AND driver_id IS NOT NULL) OR
    (review_type = 'both' AND restaurant_id IS NOT NULL AND driver_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON public.reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id ON public.reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_driver_id ON public.reviews(driver_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON public.reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

-- 2. ORDER_EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.order_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('customer', 'restaurant', 'driver', 'admin', 'system')),
  actor_id UUID,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON public.order_events(order_id);
CREATE INDEX IF NOT EXISTS idx_order_events_created_at ON public.order_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_events_status ON public.order_events(status);
CREATE INDEX IF NOT EXISTS idx_order_events_actor ON public.order_events(actor_type, actor_id);

-- 3. USER_NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON public.user_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON public.user_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notifications_type ON public.user_notifications(type);

-- 4. USER_CART TABLE
CREATE TABLE IF NOT EXISTS public.user_cart (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  item_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, restaurant_id, menu_item_id)
);

CREATE INDEX IF NOT EXISTS idx_user_cart_user_id ON public.user_cart(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cart_restaurant_id ON public.user_cart(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_user_cart_updated_at ON public.user_cart(updated_at DESC);

-- 5. ADD MISSING COLUMNS TO ORDERS TABLE
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'orders' 
                 AND column_name = 'assigned_at') THEN
    ALTER TABLE public.orders ADD COLUMN assigned_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'orders' 
                 AND column_name = 'picked_up_at') THEN
    ALTER TABLE public.orders ADD COLUMN picked_up_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'orders' 
                 AND column_name = 'delivered_at') THEN
    ALTER TABLE public.orders ADD COLUMN delivered_at TIMESTAMPTZ;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_assigned_at ON public.orders(assigned_at);
CREATE INDEX IF NOT EXISTS idx_orders_picked_up_at ON public.orders(picked_up_at);
CREATE INDEX IF NOT EXISTS idx_orders_delivered_at ON public.orders(delivered_at);

-- 6. ADD MISSING COLUMNS TO DRIVERS TABLE
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'drivers' 
                 AND column_name = 'on_hold') THEN
    ALTER TABLE public.drivers ADD COLUMN on_hold BOOLEAN NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'drivers' 
                 AND column_name = 'hold_reason') THEN
    ALTER TABLE public.drivers ADD COLUMN hold_reason TEXT;
  END IF;
END $$;

-- 7. UPDATE TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_cart_updated_at ON public.user_cart;
CREATE TRIGGER update_user_cart_updated_at
  BEFORE UPDATE ON public.user_cart
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 8. ENABLE REALTIME ON NEW TABLES
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;

COMMENT ON TABLE public.reviews IS 'Customer reviews for restaurants and drivers';
COMMENT ON TABLE public.order_events IS 'Complete audit trail of all order status changes and events';
COMMENT ON TABLE public.user_notifications IS 'Individual user notifications (separate from system-wide notifications)';
COMMENT ON TABLE public.user_cart IS 'Persistent shopping cart for users across devices';

-- ============================================
-- MIGRATION 2: CREATE ATOMIC DRIVER ASSIGNMENT FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.atomic_assign_driver(
  p_order_id UUID,
  p_driver_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_order_status TEXT;
  v_current_driver_id UUID;
  v_result JSONB;
BEGIN
  SELECT status, driver_id
  INTO v_order_status, v_current_driver_id
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found');
  END IF;

  IF v_order_status != 'ready' THEN
    RETURN jsonb_build_object('success', false, 'error', format('Order is not ready for pickup. Current status: %s', v_order_status));
  END IF;

  IF v_current_driver_id IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order is already assigned to another driver');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.drivers
    WHERE id = p_driver_id
    AND is_online = true
    AND is_verified = true
    AND (on_hold IS NULL OR on_hold = false)
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Driver is not available or not verified');
  END IF;

  UPDATE public.orders
  SET driver_id = p_driver_id, status = 'assigned', assigned_at = NOW(), updated_at = NOW()
  WHERE id = p_order_id AND status = 'ready' AND driver_id IS NULL;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Failed to assign driver (order may have been assigned by another driver)');
  END IF;

  INSERT INTO public.order_events (order_id, status, actor_type, actor_id, notes)
  VALUES (p_order_id, 'assigned', 'driver', p_driver_id, 'Driver accepted delivery request');

  RETURN jsonb_build_object('success', true, 'order_id', p_order_id, 'driver_id', p_driver_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.atomic_assign_driver(UUID, UUID) TO authenticated;
COMMENT ON FUNCTION public.atomic_assign_driver IS 'Atomically assigns a driver to a ready order, preventing race conditions';

-- ============================================
-- MIGRATION 3: CREATE RLS POLICIES
-- ============================================

-- REVIEWS TABLE RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create reviews for their orders" ON public.reviews;
CREATE POLICY "Users can create reviews for their orders"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "Anyone can read reviews" ON public.reviews;
CREATE POLICY "Anyone can read reviews"
  ON public.reviews FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
CREATE POLICY "Users can update their own reviews"
  ON public.reviews FOR UPDATE TO authenticated
  USING (customer_id = auth.uid()) WITH CHECK (customer_id = auth.uid());

-- ORDER_EVENTS TABLE RLS
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System can insert order events" ON public.order_events;
CREATE POLICY "System can insert order events"
  ON public.order_events FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read their order events" ON public.order_events;
CREATE POLICY "Users can read their order events"
  ON public.order_events FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_events.order_id
    AND (orders.customer_id = auth.uid() OR
         orders.restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()) OR
         orders.driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()))
  ));

-- USER_NOTIFICATIONS TABLE RLS
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own notifications" ON public.user_notifications;
CREATE POLICY "Users can read their own notifications"
  ON public.user_notifications FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can insert notifications" ON public.user_notifications;
CREATE POLICY "System can insert notifications"
  ON public.user_notifications FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.user_notifications;
CREATE POLICY "Users can update their own notifications"
  ON public.user_notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- USER_CART TABLE RLS
ALTER TABLE public.user_cart ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own cart" ON public.user_cart;
CREATE POLICY "Users can read their own cart"
  ON public.user_cart FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert into their own cart" ON public.user_cart;
CREATE POLICY "Users can insert into their own cart"
  ON public.user_cart FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own cart" ON public.user_cart;
CREATE POLICY "Users can update their own cart"
  ON public.user_cart FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete from their own cart" ON public.user_cart;
CREATE POLICY "Users can delete from their own cart"
  ON public.user_cart FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ORDERS TABLE RLS (ENHANCED)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers can read their own orders" ON public.orders;
CREATE POLICY "Customers can read their own orders"
  ON public.orders FOR SELECT TO authenticated USING (customer_id = auth.uid());

DROP POLICY IF EXISTS "Restaurants can read their orders" ON public.orders;
CREATE POLICY "Restaurants can read their orders"
  ON public.orders FOR SELECT TO authenticated
  USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Drivers can read their assigned orders" ON public.orders;
CREATE POLICY "Drivers can read their assigned orders"
  ON public.orders FOR SELECT TO authenticated
  USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Customers can create orders" ON public.orders;
CREATE POLICY "Customers can create orders"
  ON public.orders FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "Restaurants can update their orders" ON public.orders;
CREATE POLICY "Restaurants can update their orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Drivers can update assigned orders" ON public.orders;
CREATE POLICY "Drivers can update assigned orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

-- DRIVERS TABLE RLS (ENHANCED)
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Drivers can read their own profile" ON public.drivers;
CREATE POLICY "Drivers can read their own profile"
  ON public.drivers FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Drivers can update their own profile" ON public.drivers;
CREATE POLICY "Drivers can update their own profile"
  ON public.drivers FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- DRIVER_LOCATIONS TABLE RLS
ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Drivers can insert their locations" ON public.driver_locations;
CREATE POLICY "Drivers can insert their locations"
  ON public.driver_locations FOR INSERT TO authenticated
  WITH CHECK (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Anyone can read driver locations" ON public.driver_locations;
CREATE POLICY "Anyone can read driver locations"
  ON public.driver_locations FOR SELECT TO authenticated USING (true);

-- ORDER_ITEMS TABLE RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their order items" ON public.order_items;
CREATE POLICY "Users can read their order items"
  ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND (orders.customer_id = auth.uid() OR
         orders.restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()))
  ));

DROP POLICY IF EXISTS "Customers can insert order items" ON public.order_items;
CREATE POLICY "Customers can insert order items"
  ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid()
  ));

COMMENT ON POLICY "Users can create reviews for their orders" ON public.reviews IS 'Customers can only review their own orders';
COMMENT ON POLICY "Users can read their own notifications" ON public.user_notifications IS 'Users can only see their own notifications';
COMMENT ON POLICY "Users can read their own cart" ON public.user_cart IS 'Users can only access their own cart';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check tables created
SELECT 'Tables Created' as check_type, COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('reviews', 'order_events', 'user_notifications', 'user_cart');

-- Check function exists
SELECT 'Function Created' as check_type, COUNT(*) as count
FROM pg_proc WHERE proname = 'atomic_assign_driver';

-- Check RLS enabled
SELECT 'RLS Enabled' as check_type, COUNT(*) as count
FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('reviews', 'order_events', 'user_notifications', 'user_cart') AND rowsecurity = true;

-- Check policies count
SELECT 'Policies Created' as check_type, COUNT(*) as count
FROM pg_policies
WHERE schemaname = 'public' AND tablename IN ('reviews', 'order_events', 'user_notifications', 'user_cart', 'orders', 'drivers', 'driver_locations', 'order_items');
