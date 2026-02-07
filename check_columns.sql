-- Test if the image URL columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'drivers' 
  AND table_schema = 'public' 
  AND column_name IN ('license_image_url', 'rc_image_url', 'insurance_image_url')
ORDER BY column_name;