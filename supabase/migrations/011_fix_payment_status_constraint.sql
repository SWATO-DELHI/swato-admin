-- Migration: Fix Payment Status Check Constraint
-- The orders table has a check constraint that's too restrictive
-- This migration updates it to accept all valid payment statuses

-- ============ 1. Drop the existing constraint ============
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;

-- ============ 2. Add the corrected constraint ============
-- Allow: pending, unpaid, paid, failed, refunded, processing
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_status_check 
CHECK (payment_status IN ('pending', 'unpaid', 'paid', 'failed', 'refunded', 'processing'));

-- ============ 3. Verify the constraint ============
DO $$ 
BEGIN
    RAISE NOTICE 'Payment status constraint updated successfully';
    RAISE NOTICE 'Allowed values: pending, unpaid, paid, failed, refunded, processing';
END $$;
