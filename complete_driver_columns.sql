-- Add missing document columns for complete driver verification
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS rc_image_url TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS insurance_image_url TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS rc_number TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS insurance_number TEXT;