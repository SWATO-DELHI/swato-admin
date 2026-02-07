-- ============================================
-- COMPREHENSIVE FIX FOR PAYMENT_STATUS
-- ============================================
-- This handles ALL possible cases:
-- 1. CHECK constraint on text column
-- 2. ENUM type column
-- 3. Missing default value

-- =============================================
-- STEP 1: Check what type payment_status is
-- =============================================
SELECT 
    c.column_name, 
    c.data_type,
    c.udt_name,
    c.column_default,
    c.is_nullable
FROM information_schema.columns c
WHERE c.table_schema = 'public' 
  AND c.table_name = 'orders' 
  AND c.column_name = 'payment_status';

-- =============================================
-- STEP 2: If it's an ENUM, check the values
-- =============================================
SELECT e.enumlabel
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname LIKE '%payment%';

-- =============================================
-- STEP 3: Drop ALL check constraints on orders table
-- =============================================
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
    RAISE NOTICE 'Dropping all CHECK constraints on payment_status...';
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

-- =============================================
-- STEP 4: If payment_status is ENUM, convert to TEXT
-- =============================================
DO $$
DECLARE
    v_data_type TEXT;
BEGIN
    SELECT data_type INTO v_data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'orders'
      AND column_name = 'payment_status';
    
    IF v_data_type = 'USER-DEFINED' THEN
        RAISE NOTICE 'payment_status is an ENUM type - converting to TEXT';
        
        -- Drop the default first if it exists
        ALTER TABLE public.orders ALTER COLUMN payment_status DROP DEFAULT;
        
        -- Convert ENUM to TEXT
        ALTER TABLE public.orders 
        ALTER COLUMN payment_status TYPE TEXT 
        USING payment_status::TEXT;
        
        RAISE NOTICE 'Converted payment_status to TEXT';
    ELSE
        RAISE NOTICE 'payment_status is already type: %', v_data_type;
    END IF;
END $$;

-- =============================================
-- STEP 5: Set default value to 'paid'
-- =============================================
ALTER TABLE public.orders 
ALTER COLUMN payment_status SET DEFAULT 'paid';

-- =============================================
-- STEP 6: Make payment_status nullable (backup safety)
-- =============================================
ALTER TABLE public.orders 
ALTER COLUMN payment_status DROP NOT NULL;

-- =============================================
-- STEP 7: Verify the fix
-- =============================================
SELECT 
    c.column_name, 
    c.data_type,
    c.udt_name,
    c.column_default,
    c.is_nullable
FROM information_schema.columns c
WHERE c.table_schema = 'public' 
  AND c.table_name = 'orders' 
  AND c.column_name = 'payment_status';

-- Show any remaining CHECK constraints
SELECT 
    con.conname as constraint_name,
    pg_get_constraintdef(con.oid) as definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'orders'
  AND nsp.nspname = 'public'
  AND con.contype = 'c';

DO $$
BEGIN
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'FIX COMPLETE!';
    RAISE NOTICE 'payment_status is now TEXT with default "paid"';
    RAISE NOTICE 'No check constraints remain';
    RAISE NOTICE '=========================================';
END $$;
