-- Update the latest workout to yesterday's date with 82 minutes duration
UPDATE workouts 
SET 
  start_time = '2025-08-17 13:00:00+00',
  end_time = '2025-08-17 14:22:00+00',
  updated_at = now()
WHERE id = '69f460c8-c90c-4ce8-81cb-4cbccb4d5238';