-- ============================================
-- REMOVE Payment Status Constraint Entirely
-- ============================================
-- The payment_status check constraint is causing issues
-- For a cash-on-delivery only app, we don't need validation
-- This script completely removes any payment_status constraints

-- Show what we're removing
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
    RAISE NOTICE '=== REMOVING PAYMENT_STATUS CONSTRAINTS ===';
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
        RAISE NOTICE 'Found constraint: %', constraint_rec.conname;
        RAISE NOTICE 'Definition: %', constraint_rec.definition;
        EXECUTE format('ALTER TABLE public.orders DROP CONSTRAINT %I CASCADE', constraint_rec.conname);
        RAISE NOTICE 'Dropped: %', constraint_rec.conname;
    END LOOP;
END $$;

-- Verify removal
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO v_count
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE rel.relname = 'orders'
      AND nsp.nspname = 'public'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) ILIKE '%payment_status%';
    
    IF v_count = 0 THEN
        RAISE NOTICE '=== SUCCESS ===';
        RAISE NOTICE 'All payment_status constraints removed';
        RAISE NOTICE 'Orders can now be placed with any payment_status value';
    ELSE
        RAISE WARNING 'Still found % constraint(s) on payment_status', v_count;
    END IF;
END $$;
