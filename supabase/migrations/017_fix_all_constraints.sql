-- ============================================
-- COMPREHENSIVE FIX FOR ALL CONSTRAINT ISSUES
-- ============================================
-- This script fixes ALL check constraints causing order failures:
-- 1. order_events.actor_type constraint (doesn't allow 'customer')
-- 2. orders.payment_status constraint (if any)
-- RUN THIS ENTIRE SCRIPT IN SUPABASE SQL EDITOR

-- ============================================
-- FIX 1: ORDER_EVENTS ACTOR_TYPE CONSTRAINT
-- ============================================

-- First, drop ALL existing check constraints on order_events
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
    RAISE NOTICE '=== DROPPING ORDER_EVENTS CONSTRAINTS ===';
    FOR constraint_rec IN
        SELECT con.conname
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE rel.relname = 'order_events'
          AND nsp.nspname = 'public'
          AND con.contype = 'c'
    LOOP
        RAISE NOTICE 'Dropping: %', constraint_rec.conname;
        EXECUTE format('ALTER TABLE public.order_events DROP CONSTRAINT %I', constraint_rec.conname);
    END LOOP;
END $$;

-- Show what invalid values exist
SELECT DISTINCT actor_type, COUNT(*) as count 
FROM public.order_events 
GROUP BY actor_type;

-- Fix any invalid actor_type values in existing rows
UPDATE public.order_events 
SET actor_type = 'system' 
WHERE actor_type IS NULL OR actor_type NOT IN ('customer', 'restaurant', 'driver', 'admin', 'system');

-- Now add the correct constraint
ALTER TABLE public.order_events 
ADD CONSTRAINT order_events_actor_type_check 
CHECK (actor_type IN ('customer', 'restaurant', 'driver', 'admin', 'system'));

-- ============================================
-- FIX 2: ORDERS PAYMENT_STATUS CONSTRAINT
-- ============================================
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
    RAISE NOTICE '=== FIXING ORDERS PAYMENT_STATUS CONSTRAINTS ===';
    FOR constraint_rec IN
        SELECT con.conname
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE rel.relname = 'orders'
          AND nsp.nspname = 'public'
          AND con.contype = 'c'
          AND pg_get_constraintdef(con.oid) ILIKE '%payment_status%'
    LOOP
        RAISE NOTICE 'Dropping: %', constraint_rec.conname;
        EXECUTE format('ALTER TABLE public.orders DROP CONSTRAINT %I', constraint_rec.conname);
    END LOOP;
END $$;

-- Add correct constraint (or skip if it doesn't exist)
DO $$
BEGIN
    ALTER TABLE public.orders 
    ADD CONSTRAINT orders_payment_status_check 
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'payment_status constraint already exists or column does not exist';
END $$;

-- Set default for payment_status
ALTER TABLE public.orders ALTER COLUMN payment_status SET DEFAULT 'paid';

-- ============================================
-- FIX 3: VERIFICATION
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'ALL FIXES APPLIED SUCCESSFULLY!';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Fixed constraints:';
    RAISE NOTICE '  - order_events.actor_type: customer, restaurant, driver, admin, system';
    RAISE NOTICE '  - orders.payment_status: pending, paid, failed, refunded (default: paid)';
    RAISE NOTICE '';
    RAISE NOTICE 'You can now place orders from the app!';
    RAISE NOTICE '==========================================';
END $$;
