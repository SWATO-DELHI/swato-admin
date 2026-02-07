-- ============================================
-- FIX PAYMENT_STATUS - Set Default Value
-- ============================================
-- This ensures payment_status has a default so we don't need to send it

-- Step 1: Show the current column definition
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'orders' 
  AND column_name = 'payment_status';

-- Step 2: Set default value for payment_status
ALTER TABLE public.orders 
ALTER COLUMN payment_status SET DEFAULT 'paid';

-- Step 3: If column doesn't allow null and has no default, this fixes it
-- Also drop any check constraint on payment_status
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
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
        EXECUTE format('ALTER TABLE public.orders DROP CONSTRAINT %I', constraint_rec.conname);
    END LOOP;
END $$;

-- Step 4: Verify
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'orders' 
  AND column_name = 'payment_status';

-- Show remaining constraints
SELECT 
    con.conname,
    pg_get_constraintdef(con.oid) as definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'orders'
  AND nsp.nspname = 'public'
  AND con.contype = 'c';
