-- ============================================
-- FIX ORDER_EVENTS ACTOR_TYPE CHECK CONSTRAINT
-- ============================================
-- The order_events table has a constraint that doesn't allow 'customer'
-- This fixes it to allow all valid actor types

-- Step 1: Show current constraint
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
    RAISE NOTICE '=== CURRENT CONSTRAINTS ON ORDER_EVENTS ===';
    FOR constraint_rec IN
        SELECT 
            con.conname,
            pg_get_constraintdef(con.oid) as definition
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE rel.relname = 'order_events'
          AND nsp.nspname = 'public'
          AND con.contype = 'c'
    LOOP
        RAISE NOTICE 'Constraint: %', constraint_rec.conname;
        RAISE NOTICE 'Definition: %', constraint_rec.definition;
    END LOOP;
END $$;

-- Step 2: Drop ALL check constraints on order_events table
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
    RAISE NOTICE '=== DROPPING ALL CHECK CONSTRAINTS ===';
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

-- Step 3: Add the correct constraint that allows all actor types
ALTER TABLE public.order_events 
ADD CONSTRAINT order_events_actor_type_check 
CHECK (actor_type IN ('customer', 'restaurant', 'driver', 'admin', 'system'));

-- Step 4: Verify
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
    RAISE NOTICE '=== NEW CONSTRAINTS ON ORDER_EVENTS ===';
    FOR constraint_rec IN
        SELECT 
            con.conname,
            pg_get_constraintdef(con.oid) as definition
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE rel.relname = 'order_events'
          AND nsp.nspname = 'public'
          AND con.contype = 'c'
    LOOP
        RAISE NOTICE 'Constraint: %', constraint_rec.conname;
        RAISE NOTICE 'Definition: %', constraint_rec.definition;
    END LOOP;
    
    RAISE NOTICE '=== SUCCESS ===';
    RAISE NOTICE 'actor_type constraint now allows: customer, restaurant, driver, admin, system';
END $$;
