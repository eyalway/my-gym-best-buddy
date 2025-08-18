-- Fix the workout time to show 13:00 Israeli time (10:00 UTC)
UPDATE workouts 
SET 
  start_time = '2025-08-17 10:00:00+00',
  end_time = '2025-08-17 11:22:00+00',
  updated_at = now()
WHERE id = '69f460c8-c90c-4ce8-81cb-4cbccb4d5238';