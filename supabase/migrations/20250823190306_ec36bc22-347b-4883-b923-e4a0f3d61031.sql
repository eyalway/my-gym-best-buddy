-- Clean up orphaned active workouts by setting them to paused
-- These are workouts that are active but not completed and don't have an end_time
UPDATE workouts 
SET status = 'paused', paused_at = COALESCE(paused_at, updated_at)
WHERE status = 'active' 
  AND completed = false 
  AND end_time IS NULL 
  AND paused_at IS NULL;