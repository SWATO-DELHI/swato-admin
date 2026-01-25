-- ============================================
-- SWATO Database - Missing Tables Migration
-- ============================================
-- This migration creates all missing tables required for the complete order flow
-- Created: January 2026

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. REVIEWS TABLE
-- ============================================
-- Supports both restaurant and driver reviews
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
  
  -- Ensure at least one of restaurant_id or driver_id is set
  CONSTRAINT reviews_target_check CHECK (
    (review_type = 'restaurant' AND restaurant_id IS NOT NULL) OR
    (review_type = 'driver' AND driver_id IS NOT NULL) OR
    (review_type = 'both' AND restaurant_id IS NOT NULL AND driver_id IS NOT NULL)
  )
);

-- Indexes for reviews
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON public.reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id ON public.reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_driver_id ON public.reviews(driver_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON public.reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

-- ============================================
-- 2. ORDER_EVENTS TABLE
-- ============================================
-- Single source of truth for order timeline and notifications
CREATE TABLE IF NOT EXISTS public.order_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('customer', 'restaurant', 'driver', 'admin', 'system')),
  actor_id UUID, -- Can be user_id, restaurant_id, driver_id, or null for system
  notes TEXT,
  metadata JSONB, -- Additional event data
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for order_events
CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON public.order_events(order_id);
CREATE INDEX IF NOT EXISTS idx_order_events_created_at ON public.order_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_events_status ON public.order_events(status);
CREATE INDEX IF NOT EXISTS idx_order_events_actor ON public.order_events(actor_type, actor_id);

-- ============================================
-- 3. USER_NOTIFICATIONS TABLE
-- ============================================
-- Individual user notifications (separate from system notifications)
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'order_update', 'delivery_request', 'promotion', etc.
  title TEXT NOT NULL,
  message TEXT,
  data JSONB, -- Additional notification data
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for user_notifications
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON public.user_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON public.user_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notifications_type ON public.user_notifications(type);

-- ============================================
-- 4. USER_CART TABLE
-- ============================================
-- Persistent cart storage for users
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
  
  -- Unique constraint: one cart item per user-restaurant-menu_item combination
  UNIQUE(user_id, restaurant_id, menu_item_id)
);

-- Indexes for user_cart
CREATE INDEX IF NOT EXISTS idx_user_cart_user_id ON public.user_cart(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cart_restaurant_id ON public.user_cart(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_user_cart_updated_at ON public.user_cart(updated_at DESC);

-- ============================================
-- 5. ADD MISSING COLUMNS TO ORDERS TABLE
-- ============================================
-- Add timestamp columns for order lifecycle tracking
DO $$ 
BEGIN
  -- Add assigned_at if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'orders' 
                 AND column_name = 'assigned_at') THEN
    ALTER TABLE public.orders ADD COLUMN assigned_at TIMESTAMPTZ;
  END IF;

  -- Add picked_up_at if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'orders' 
                 AND column_name = 'picked_up_at') THEN
    ALTER TABLE public.orders ADD COLUMN picked_up_at TIMESTAMPTZ;
  END IF;

  -- Add delivered_at if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'orders' 
                 AND column_name = 'delivered_at') THEN
    ALTER TABLE public.orders ADD COLUMN delivered_at TIMESTAMPTZ;
  END IF;
END $$;

-- Indexes for new timestamp columns
CREATE INDEX IF NOT EXISTS idx_orders_assigned_at ON public.orders(assigned_at);
CREATE INDEX IF NOT EXISTS idx_orders_picked_up_at ON public.orders(picked_up_at);
CREATE INDEX IF NOT EXISTS idx_orders_delivered_at ON public.orders(delivered_at);

-- ============================================
-- 6. ADD MISSING COLUMNS TO DRIVERS TABLE
-- ============================================
DO $$ 
BEGIN
  -- Add on_hold if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'drivers' 
                 AND column_name = 'on_hold') THEN
    ALTER TABLE public.drivers ADD COLUMN on_hold BOOLEAN NOT NULL DEFAULT false;
  END IF;

  -- Add hold_reason if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'drivers' 
                 AND column_name = 'hold_reason') THEN
    ALTER TABLE public.drivers ADD COLUMN hold_reason TEXT;
  END IF;
END $$;

-- ============================================
-- 7. UPDATE TRIGGERS FOR UPDATED_AT
-- ============================================
-- Ensure updated_at triggers exist for new tables
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for new tables
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

-- ============================================
-- 8. ENABLE REALTIME ON NEW TABLES
-- ============================================
-- Enable realtime for order_events and user_notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE public.reviews IS 'Customer reviews for restaurants and drivers';
COMMENT ON TABLE public.order_events IS 'Complete audit trail of all order status changes and events';
COMMENT ON TABLE public.user_notifications IS 'Individual user notifications (separate from system-wide notifications)';
COMMENT ON TABLE public.user_cart IS 'Persistent shopping cart for users across devices';
