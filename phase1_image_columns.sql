-- Phase 1: Add only image URL columns first (these are safe and needed now)
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS rc_image_url TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS insurance_image_url TEXT;

-- Phase 2: Run this later when ready to require RC/Insurance numbers
-- ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS rc_number TEXT;
-- ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS insurance_number TEXT;