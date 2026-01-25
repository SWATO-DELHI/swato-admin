-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Comprehensive RLS policies for all tables
-- Created: January 2026

-- ============================================
-- 1. REVIEWS TABLE RLS
-- ============================================
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Users can create reviews for their own orders
DROP POLICY IF EXISTS "Users can create reviews for their orders" ON public.reviews;
CREATE POLICY "Users can create reviews for their orders"
  ON public.reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

-- Anyone can read reviews
DROP POLICY IF EXISTS "Anyone can read reviews" ON public.reviews;
CREATE POLICY "Anyone can read reviews"
  ON public.reviews
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own reviews
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
CREATE POLICY "Users can update their own reviews"
  ON public.reviews
  FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

-- ============================================
-- 2. ORDER_EVENTS TABLE RLS
-- ============================================
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;

-- System can insert events
DROP POLICY IF EXISTS "System can insert order events" ON public.order_events;
CREATE POLICY "System can insert order events"
  ON public.order_events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can read events for their orders
DROP POLICY IF EXISTS "Users can read their order events" ON public.order_events;
CREATE POLICY "Users can read their order events"
  ON public.order_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_events.order_id
      AND (
        orders.customer_id = auth.uid() OR
        orders.restaurant_id IN (
          SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
        ) OR
        orders.driver_id IN (
          SELECT id FROM public.drivers WHERE user_id = auth.uid()
        )
      )
    )
  );

-- ============================================
-- 3. USER_NOTIFICATIONS TABLE RLS
-- ============================================
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
DROP POLICY IF EXISTS "Users can read their own notifications" ON public.user_notifications;
CREATE POLICY "Users can read their own notifications"
  ON public.user_notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- System can insert notifications
DROP POLICY IF EXISTS "System can insert notifications" ON public.user_notifications;
CREATE POLICY "System can insert notifications"
  ON public.user_notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can update their own notifications
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.user_notifications;
CREATE POLICY "Users can update their own notifications"
  ON public.user_notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- 4. USER_CART TABLE RLS
-- ============================================
ALTER TABLE public.user_cart ENABLE ROW LEVEL SECURITY;

-- Users can only see their own cart
DROP POLICY IF EXISTS "Users can read their own cart" ON public.user_cart;
CREATE POLICY "Users can read their own cart"
  ON public.user_cart
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert into their own cart
DROP POLICY IF EXISTS "Users can insert into their own cart" ON public.user_cart;
CREATE POLICY "Users can insert into their own cart"
  ON public.user_cart
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own cart
DROP POLICY IF EXISTS "Users can update their own cart" ON public.user_cart;
CREATE POLICY "Users can update their own cart"
  ON public.user_cart
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete from their own cart
DROP POLICY IF EXISTS "Users can delete from their own cart" ON public.user_cart;
CREATE POLICY "Users can delete from their own cart"
  ON public.user_cart
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- 5. ORDERS TABLE RLS (ENHANCED)
-- ============================================
-- Ensure orders RLS is enabled
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Customers can read their own orders
DROP POLICY IF EXISTS "Customers can read their own orders" ON public.orders;
CREATE POLICY "Customers can read their own orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

-- Restaurants can read their own orders
DROP POLICY IF EXISTS "Restaurants can read their orders" ON public.orders;
CREATE POLICY "Restaurants can read their orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

-- Drivers can read their assigned orders
DROP POLICY IF EXISTS "Drivers can read their assigned orders" ON public.orders;
CREATE POLICY "Drivers can read their assigned orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    driver_id IN (
      SELECT id FROM public.drivers WHERE user_id = auth.uid()
    )
  );

-- Customers can create orders
DROP POLICY IF EXISTS "Customers can create orders" ON public.orders;
CREATE POLICY "Customers can create orders"
  ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

-- Restaurants can update their orders (status changes)
DROP POLICY IF EXISTS "Restaurants can update their orders" ON public.orders;
CREATE POLICY "Restaurants can update their orders"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

-- Drivers can update assigned orders (status changes)
DROP POLICY IF EXISTS "Drivers can update assigned orders" ON public.orders;
CREATE POLICY "Drivers can update assigned orders"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (
    driver_id IN (
      SELECT id FROM public.drivers WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 6. DRIVERS TABLE RLS (ENHANCED)
-- ============================================
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Drivers can read their own profile
DROP POLICY IF EXISTS "Drivers can read their own profile" ON public.drivers;
CREATE POLICY "Drivers can read their own profile"
  ON public.drivers
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Drivers can update their own profile (online status, location)
DROP POLICY IF EXISTS "Drivers can update their own profile" ON public.drivers;
CREATE POLICY "Drivers can update their own profile"
  ON public.drivers
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- 7. DRIVER_LOCATIONS TABLE RLS
-- ============================================
ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;

-- Drivers can insert their own locations
DROP POLICY IF EXISTS "Drivers can insert their locations" ON public.driver_locations;
CREATE POLICY "Drivers can insert their locations"
  ON public.driver_locations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    driver_id IN (
      SELECT id FROM public.drivers WHERE user_id = auth.uid()
    )
  );

-- Anyone can read driver locations (for tracking)
DROP POLICY IF EXISTS "Anyone can read driver locations" ON public.driver_locations;
CREATE POLICY "Anyone can read driver locations"
  ON public.driver_locations
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- 8. ORDER_ITEMS TABLE RLS
-- ============================================
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Users can read items for their orders
DROP POLICY IF EXISTS "Users can read their order items" ON public.order_items;
CREATE POLICY "Users can read their order items"
  ON public.order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (
        orders.customer_id = auth.uid() OR
        orders.restaurant_id IN (
          SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
        )
      )
    )
  );

-- Customers can insert order items (during checkout)
DROP POLICY IF EXISTS "Customers can insert order items" ON public.order_items;
CREATE POLICY "Customers can insert order items"
  ON public.order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_id = auth.uid()
    )
  );

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON POLICY "Users can create reviews for their orders" ON public.reviews IS 'Customers can only review their own orders';
COMMENT ON POLICY "Users can read their own notifications" ON public.user_notifications IS 'Users can only see their own notifications';
COMMENT ON POLICY "Users can read their own cart" ON public.user_cart IS 'Users can only access their own cart';
