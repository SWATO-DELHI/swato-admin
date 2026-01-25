# Database Migration Execution Report

**Date:** January 2026  
**Status:** Ready for Execution  
**Supabase MCP:** Not Available (Manual Execution Required)

---

## 📋 Executive Summary

This report contains all SQL migrations that need to be executed in your Supabase database. Since Supabase MCP is not configured, you'll need to execute these manually via the Supabase Dashboard SQL Editor.

**Total Migrations:** 3  
**Total Tables Created:** 4  
**Total Functions Created:** 1  
**Total RLS Policies:** 20+

---

## 🚀 Execution Instructions

### Method 1: Supabase Dashboard (Recommended)

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Navigate to: **SQL Editor** → **New Query**
4. Copy and paste each migration file content
5. Click **Run** (or press `Ctrl+Enter`)
6. Verify success message

### Method 2: Supabase CLI

```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref <your-project-ref>

# Run migrations
supabase db push
```

---

## 📊 Migration 1: Create Missing Tables

**File:** `001_create_missing_tables.sql`  
**Execution Time:** ~5-10 seconds  
**Risk Level:** Low (uses `IF NOT EXISTS`)

### What This Migration Does:

1. **Creates 4 New Tables:**
   - `reviews` - Restaurant and driver reviews
   - `order_events` - Complete order audit trail
   - `user_notifications` - Individual user notifications
   - `user_cart` - Persistent shopping cart

2. **Adds Missing Columns:**
   - `orders.assigned_at` - Timestamp when driver assigned
   - `orders.picked_up_at` - Timestamp when order picked up
   - `orders.delivered_at` - Timestamp when order delivered
   - `drivers.on_hold` - Driver hold status
   - `drivers.hold_reason` - Reason for hold

3. **Creates Indexes:**
   - 15+ indexes for performance optimization

4. **Enables Realtime:**
   - Adds new tables to `supabase_realtime` publication

### SQL Content:

```sql
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
```

### Verification Query:

```sql
-- Check if tables were created
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('reviews', 'order_events', 'user_notifications', 'user_cart')
ORDER BY table_name;

-- Check if columns were added to orders
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'orders'
  AND column_name IN ('assigned_at', 'picked_up_at', 'delivered_at');

-- Check if columns were added to drivers
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'drivers'
  AND column_name IN ('on_hold', 'hold_reason');
```

**Expected Result:**
- 4 tables should exist
- 3 columns added to `orders`
- 2 columns added to `drivers`

---

## 📊 Migration 2: Create Atomic Driver Assignment Function

**File:** `002_create_atomic_assign_driver.sql`  
**Execution Time:** ~2-3 seconds  
**Risk Level:** Low (uses `CREATE OR REPLACE`)

### What This Migration Does:

1. **Creates Function:** `atomic_assign_driver(order_id, driver_id)`
   - Prevents race conditions when multiple drivers try to accept the same order
   - Uses row-level locking (`FOR UPDATE`)
   - Validates driver availability
   - Returns JSONB with success/error

2. **Grants Permissions:**
   - Allows authenticated users to execute the function

### SQL Content:

```sql
-- ============================================
-- ATOMIC DRIVER ASSIGNMENT FUNCTION
-- ============================================
-- Prevents race conditions when multiple drivers try to accept the same order
-- Uses row-level locking to ensure only one driver can accept an order

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
  -- Lock the order row for update to prevent race conditions
  SELECT status, driver_id
  INTO v_order_status, v_current_driver_id
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE; -- Row-level lock

  -- Check if order exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Order not found'
    );
  END IF;

  -- Check if order is in ready status
  IF v_order_status != 'ready' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', format('Order is not ready for pickup. Current status: %s', v_order_status)
    );
  END IF;

  -- Check if order is already assigned
  IF v_current_driver_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Order is already assigned to another driver'
    );
  END IF;

  -- Verify driver exists and is online
  IF NOT EXISTS (
    SELECT 1 FROM public.drivers
    WHERE id = p_driver_id
    AND is_online = true
    AND is_verified = true
    AND (on_hold IS NULL OR on_hold = false)
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Driver is not available or not verified'
    );
  END IF;

  -- Assign driver to order atomically
  UPDATE public.orders
  SET
    driver_id = p_driver_id,
    status = 'assigned',
    assigned_at = NOW(),
    updated_at = NOW()
  WHERE id = p_order_id
  AND status = 'ready'
  AND driver_id IS NULL;

  -- Check if update succeeded
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Failed to assign driver (order may have been assigned by another driver)'
    );
  END IF;

  -- Log the event
  INSERT INTO public.order_events (
    order_id,
    status,
    actor_type,
    actor_id,
    notes
  ) VALUES (
    p_order_id,
    'assigned',
    'driver',
    p_driver_id,
    'Driver accepted delivery request'
  );

  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'driver_id', p_driver_id
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.atomic_assign_driver(UUID, UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.atomic_assign_driver IS 'Atomically assigns a driver to a ready order, preventing race conditions';
```

### Verification Query:

```sql
-- Check if function exists
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  pg_get_function_result(oid) as return_type
FROM pg_proc
WHERE proname = 'atomic_assign_driver';

-- Test function (use a test order_id and driver_id)
-- SELECT public.atomic_assign_driver('test-order-id'::uuid, 'test-driver-id'::uuid);
```

**Expected Result:**
- Function should exist with 2 UUID parameters
- Return type should be JSONB

---

## 📊 Migration 3: Create RLS Policies

**File:** `003_create_rls_policies.sql`  
**Execution Time:** ~5-10 seconds  
**Risk Level:** Medium (affects data access)

### What This Migration Does:

1. **Enables RLS** on all new tables
2. **Creates 20+ Policies** for:
   - `reviews` - Users can only review their own orders
   - `order_events` - Users see events for their orders
   - `user_notifications` - Users see only their notifications
   - `user_cart` - Users see only their cart
   - `orders` - Role-based access (customer/restaurant/driver)
   - `drivers` - Drivers can update their own profile
   - `driver_locations` - Drivers can insert, anyone can read
   - `order_items` - Users see items for their orders

### SQL Content:

*(See full content in `003_create_rls_policies.sql` file - 301 lines)*

### Verification Query:

```sql
-- Check RLS is enabled on new tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('reviews', 'order_events', 'user_notifications', 'user_cart')
ORDER BY tablename;

-- Check policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('reviews', 'order_events', 'user_notifications', 'user_cart', 'orders', 'drivers')
ORDER BY tablename, policyname;
```

**Expected Result:**
- RLS enabled on all new tables
- 20+ policies created

---

## ✅ Post-Migration Verification

### Complete Verification Script:

```sql
-- ============================================
-- COMPLETE MIGRATION VERIFICATION
-- ============================================

-- 1. Check all tables exist
SELECT 
  'Tables' as check_type,
  COUNT(*) as count,
  string_agg(table_name, ', ') as items
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('reviews', 'order_events', 'user_notifications', 'user_cart');

-- 2. Check orders columns
SELECT 
  'Orders Columns' as check_type,
  COUNT(*) as count,
  string_agg(column_name, ', ') as items
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'orders'
  AND column_name IN ('assigned_at', 'picked_up_at', 'delivered_at');

-- 3. Check drivers columns
SELECT 
  'Drivers Columns' as check_type,
  COUNT(*) as count,
  string_agg(column_name, ', ') as items
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'drivers'
  AND column_name IN ('on_hold', 'hold_reason');

-- 4. Check function exists
SELECT 
  'Function' as check_type,
  COUNT(*) as count,
  string_agg(proname, ', ') as items
FROM pg_proc
WHERE proname = 'atomic_assign_driver';

-- 5. Check RLS enabled
SELECT 
  'RLS Enabled' as check_type,
  COUNT(*) as count,
  string_agg(tablename, ', ') as items
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('reviews', 'order_events', 'user_notifications', 'user_cart')
  AND rowsecurity = true;

-- 6. Check policies count
SELECT 
  'Policies' as check_type,
  COUNT(*) as count,
  string_agg(DISTINCT tablename, ', ') as tables
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('reviews', 'order_events', 'user_notifications', 'user_cart', 'orders', 'drivers', 'driver_locations', 'order_items');

-- 7. Check realtime publication
SELECT 
  'Realtime Tables' as check_type,
  COUNT(*) as count,
  string_agg(tablename, ', ') as items
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('reviews', 'order_events', 'user_notifications');
```

**Expected Results:**
- ✅ 4 tables created
- ✅ 3 columns added to orders
- ✅ 2 columns added to drivers
- ✅ 1 function created
- ✅ RLS enabled on 4 tables
- ✅ 20+ policies created
- ✅ 3 tables added to realtime

---

## 📈 Migration Summary

| Migration | Status | Tables | Functions | Policies | Time |
|-----------|--------|--------|-----------|----------|------|
| 001 - Missing Tables | ⏳ Pending | 4 | 0 | 0 | ~10s |
| 002 - Atomic Function | ⏳ Pending | 0 | 1 | 0 | ~3s |
| 003 - RLS Policies | ⏳ Pending | 0 | 0 | 20+ | ~10s |
| **TOTAL** | **⏳ Pending** | **4** | **1** | **20+** | **~23s** |

---

## 🚨 Important Notes

1. **Backup First:** Always backup your database before running migrations
2. **Test Environment:** Test migrations in a staging environment first
3. **Execution Order:** Run migrations in order (001 → 002 → 003)
4. **Verification:** Run verification queries after each migration
5. **Rollback:** Keep migration files for rollback if needed

---

## 📝 Execution Checklist

- [ ] Backup database
- [ ] Review all SQL migrations
- [ ] Execute Migration 1 (001_create_missing_tables.sql)
- [ ] Verify Migration 1 results
- [ ] Execute Migration 2 (002_create_atomic_assign_driver.sql)
- [ ] Verify Migration 2 results
- [ ] Execute Migration 3 (003_create_rls_policies.sql)
- [ ] Verify Migration 3 results
- [ ] Run complete verification script
- [ ] Test order flow end-to-end
- [ ] Document any issues

---

## 🎯 Next Steps After Migration

1. **Test Order Flow:**
   - User places order
   - Partner receives notification
   - Driver accepts order (uses atomic function)
   - Complete delivery

2. **Verify Real-time:**
   - Check real-time subscriptions work
   - Test notifications
   - Test order status updates

3. **Test Security:**
   - Verify RLS policies prevent unauthorized access
   - Test user can only see their own data

---

**Ready to Execute!** 🚀

All migrations are safe to run (use `IF NOT EXISTS` and `CREATE OR REPLACE`).
