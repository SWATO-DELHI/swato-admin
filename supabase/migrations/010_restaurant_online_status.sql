-- Migration: Add Restaurant Online/Offline Status Feature
-- This migration adds the is_online column and creates validation functions
-- for preventing orders to offline restaurants

-- ============ 1. Add is_online column if not exists ============
DO $$
BEGIN
    -- Check if is_online column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'restaurants' 
        AND column_name = 'is_online'
    ) THEN
        ALTER TABLE public.restaurants 
        ADD COLUMN is_online BOOLEAN NOT NULL DEFAULT true;
        
        -- Create index for faster queries
        CREATE INDEX IF NOT EXISTS idx_restaurants_is_online ON public.restaurants(is_online);
        
        RAISE NOTICE 'Added is_online column to restaurants table';
    ELSE
        RAISE NOTICE 'is_online column already exists';
    END IF;
    
    -- Also ensure is_open exists (some schemas may have this instead)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'restaurants' 
        AND column_name = 'is_open'
    ) THEN
        ALTER TABLE public.restaurants 
        ADD COLUMN is_open BOOLEAN NOT NULL DEFAULT true;
        
        RAISE NOTICE 'Added is_open column to restaurants table';
    ELSE
        RAISE NOTICE 'is_open column already exists';
    END IF;
END $$;

-- ============ 2. Create function to check restaurant availability ============
CREATE OR REPLACE FUNCTION public.check_restaurant_available(p_restaurant_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_is_available BOOLEAN;
BEGIN
    SELECT 
        COALESCE(is_online, is_open, true) AND is_active AND verification_status = 'approved'
    INTO v_is_available
    FROM public.restaurants
    WHERE id = p_restaurant_id;
    
    RETURN COALESCE(v_is_available, false);
END;
$$;

-- ============ 3. Create function to validate order creation ============
CREATE OR REPLACE FUNCTION public.validate_order_restaurant()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_restaurant_name TEXT;
    v_is_online BOOLEAN;
    v_is_active BOOLEAN;
    v_verification_status TEXT;
BEGIN
    -- Get restaurant details
    SELECT 
        name,
        COALESCE(is_online, is_open, true),
        is_active,
        verification_status
    INTO 
        v_restaurant_name,
        v_is_online,
        v_is_active,
        v_verification_status
    FROM public.restaurants
    WHERE id = NEW.restaurant_id;
    
    -- Check if restaurant exists
    IF v_restaurant_name IS NULL THEN
        RAISE EXCEPTION 'Restaurant not found';
    END IF;
    
    -- Check if restaurant is online
    IF NOT v_is_online THEN
        RAISE EXCEPTION 'Restaurant "%" is currently offline and not accepting orders', v_restaurant_name;
    END IF;
    
    -- Check if restaurant is active
    IF NOT v_is_active THEN
        RAISE EXCEPTION 'Restaurant "%" is not currently active', v_restaurant_name;
    END IF;
    
    -- Check verification status
    IF v_verification_status != 'approved' THEN
        RAISE EXCEPTION 'Restaurant "%" is not verified for orders', v_restaurant_name;
    END IF;
    
    RETURN NEW;
END;
$$;

-- ============ 4. Create trigger for order validation ============
-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS validate_order_restaurant_trigger ON public.orders;

-- Create trigger to validate orders before insert
CREATE TRIGGER validate_order_restaurant_trigger
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_order_restaurant();

-- ============ 5. Create function to toggle restaurant online status ============
CREATE OR REPLACE FUNCTION public.toggle_restaurant_online_status(
    p_restaurant_id UUID,
    p_is_online BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB;
BEGIN
    UPDATE public.restaurants
    SET 
        is_online = p_is_online,
        is_open = p_is_online,
        updated_at = NOW()
    WHERE id = p_restaurant_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Restaurant not found'
        );
    END IF;
    
    -- Log the status change
    INSERT INTO public.restaurant_activity_log (restaurant_id, action, details)
    VALUES (
        p_restaurant_id,
        CASE WHEN p_is_online THEN 'went_online' ELSE 'went_offline' END,
        jsonb_build_object('timestamp', NOW())
    )
    ON CONFLICT DO NOTHING;
    
    RETURN jsonb_build_object(
        'success', true,
        'is_online', p_is_online
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- ============ 6. Enable real-time for restaurants table ============
-- This allows clients to subscribe to restaurant status changes
-- Note: Using DO block to handle case where table is already in publication
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurants;
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'restaurants table already in supabase_realtime publication';
END $$;

-- ============ 7. Update RLS policy to include is_online in SELECT ============
-- Anyone can read restaurant status (including is_online)
DROP POLICY IF EXISTS "Anyone can view active approved restaurants" ON public.restaurants;
CREATE POLICY "Anyone can view active approved restaurants" ON public.restaurants
    FOR SELECT 
    USING (is_active = true AND verification_status = 'approved');

-- Restaurant owners can update their own restaurant status
DROP POLICY IF EXISTS "Restaurant owners can update their restaurant" ON public.restaurants;
CREATE POLICY "Restaurant owners can update their restaurant" ON public.restaurants
    FOR UPDATE
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

COMMENT ON COLUMN public.restaurants.is_online IS 'Whether the restaurant is currently accepting orders. Partners can toggle this.';
COMMENT ON FUNCTION public.validate_order_restaurant() IS 'Trigger function to prevent orders to offline/inactive restaurants';
COMMENT ON FUNCTION public.check_restaurant_available(UUID) IS 'Check if a restaurant is available for ordering';

-- ============ 8. Create activity log table if not exists ============
CREATE TABLE IF NOT EXISTS public.restaurant_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_restaurant_activity_log_restaurant_id 
ON public.restaurant_activity_log(restaurant_id);

-- Grant permissions
GRANT SELECT ON public.restaurant_activity_log TO authenticated;
GRANT INSERT ON public.restaurant_activity_log TO authenticated;

-- Add RLS policies for restaurant_activity_log
ALTER TABLE public.restaurant_activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read activity log" ON public.restaurant_activity_log;
CREATE POLICY "Anyone can read activity log" ON public.restaurant_activity_log
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert activity log" ON public.restaurant_activity_log;
CREATE POLICY "Authenticated users can insert activity log" ON public.restaurant_activity_log
    FOR INSERT WITH CHECK (true);

-- ============ 9. Add policy for partners to update online status ============
-- Partners can update is_online/is_open for their own restaurants
DROP POLICY IF EXISTS "Partners can update their restaurant online status" ON public.restaurants;
CREATE POLICY "Partners can update their restaurant online status" ON public.restaurants
    FOR UPDATE
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

-- Final notice wrapped in DO block
DO $$ BEGIN RAISE NOTICE 'Restaurant online/offline status migration completed successfully'; END $$;
