-- ============================================
-- FORCE FIX Payment Status Constraint
-- ============================================
-- This aggressively removes ALL check constraints and creates the correct one

-- Step 1: Show ALL constraints on orders table
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
    RAISE NOTICE '=== ALL CHECK CONSTRAINTS ON ORDERS TABLE ===';
    FOR constraint_rec IN
        SELECT 
            con.conname,
            pg_get_constraintdef(con.oid) as definition
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE rel.relname = 'orders'
          AND nsp.nspname = 'public'
          AND con.contype = 'c'
    LOOP
        RAISE NOTICE 'Constraint: %', constraint_rec.conname;
        RAISE NOTICE 'Definition: %', constraint_rec.definition;
    END LOOP;
END $$;

-- Step 2: Drop ALL check constraints that reference payment_status
-- Using CASCADE to handle dependencies
DO $$
DECLARE
    constraint_rec RECORD;
    v_count INTEGER := 0;
BEGIN
    RAISE NOTICE '=== DROPPING PAYMENT_STATUS CONSTRAINTS ===';
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
        RAISE NOTICE 'Dropping constraint: %', constraint_rec.conname;
        EXECUTE format('ALTER TABLE public.orders DROP CONSTRAINT %I CASCADE', constraint_rec.conname);
        v_count := v_count + 1;
    END LOOP;
    RAISE NOTICE 'Dropped % constraint(s)', v_count;
END $$;

-- Step 3: Add the correct constraint with only actually valid values
-- Based on the application code, only these 4 values are used:
-- 'pending' (for COD/unpaid orders), 'paid' (online payment completed), 
-- 'failed' (payment failed), 'refunded' (order refunded)
ALTER TABLE public.orders 
ADD CONSTRAINT orders_payment_status_check 
CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

-- Step 4: Verify the fix
DO $$
DECLARE
    constraint_rec RECORD;
    v_found BOOLEAN := false;
BEGIN
    RAISE NOTICE '=== VERIFICATION ===';
    FOR constraint_rec IN
        SELECT 
            con.conname,
            pg_get_constraintdef(con.oid) as definition
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE rel.relname = 'orders'
          AND nsp.nspname = 'public'
          AND con.contype = 'c'
          AND pg_get_constraintdef(con.oid) ILIKE '%payment_status%'
    LOOP
        RAISE NOTICE 'New Constraint: %', constraint_rec.conname;
        RAISE NOTICE 'Definition: %', constraint_rec.definition;
        v_found := true;
    END LOOP;
    
    IF v_found THEN
        RAISE NOTICE '=== SUCCESS ===';
        RAISE NOTICE 'payment_status constraint fixed!';
        RAISE NOTICE 'Allowed values: pending, paid, failed, refunded';
    ELSE
        RAISE WARNING 'No payment_status constraint found - this might indicate an issue!';
    END IF;
END $$;
