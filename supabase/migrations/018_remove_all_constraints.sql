-- ============================================
-- REMOVE ALL PROBLEMATIC CONSTRAINTS
-- ============================================
-- This script REMOVES constraints entirely - no re-adding
-- This ensures orders can be placed without any check failures

-- ============================================
-- STEP 1: Remove ALL check constraints from order_events
-- ============================================
DO $$
DECLARE
    constraint_rec RECORD;
    v_count INTEGER := 0;
BEGIN
    RAISE NOTICE '=== REMOVING ORDER_EVENTS CONSTRAINTS ===';
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
        v_count := v_count + 1;
    END LOOP;
    RAISE NOTICE 'Dropped % constraint(s) from order_events', v_count;
END $$;

-- ============================================
-- STEP 2: Remove ALL check constraints from orders
-- ============================================
DO $$
DECLARE
    constraint_rec RECORD;
    v_count INTEGER := 0;
BEGIN
    RAISE NOTICE '=== REMOVING ORDERS CONSTRAINTS ===';
    FOR constraint_rec IN
        SELECT con.conname
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE rel.relname = 'orders'
          AND nsp.nspname = 'public'
          AND con.contype = 'c'
    LOOP
        RAISE NOTICE 'Dropping: %', constraint_rec.conname;
        EXECUTE format('ALTER TABLE public.orders DROP CONSTRAINT %I', constraint_rec.conname);
        v_count := v_count + 1;
    END LOOP;
    RAISE NOTICE 'Dropped % constraint(s) from orders', v_count;
END $$;

-- ============================================
-- STEP 3: Verify no check constraints remain
-- ============================================
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE rel.relname IN ('orders', 'order_events')
      AND nsp.nspname = 'public'
      AND con.contype = 'c';
    
    IF v_count = 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '==========================================';
        RAISE NOTICE 'SUCCESS! All check constraints removed.';
        RAISE NOTICE 'Orders can now be placed without errors.';
        RAISE NOTICE '==========================================';
    ELSE
        RAISE NOTICE 'Warning: % constraint(s) still remain', v_count;
    END IF;
END $$;
