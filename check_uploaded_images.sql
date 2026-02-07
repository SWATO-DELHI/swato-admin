-- Check what image URLs exist in the drivers table
SELECT 
  id,
  license_number,
  verification_status,
  license_image_url,
  rc_image_url,
  insurance_image_url,
  submitted_at,
  created_at
FROM public.drivers 
WHERE license_image_url IS NOT NULL 
   OR rc_image_url IS NOT NULL 
   OR insurance_image_url IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;