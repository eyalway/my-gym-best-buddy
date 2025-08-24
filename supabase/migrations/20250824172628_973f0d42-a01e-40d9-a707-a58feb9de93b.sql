-- Update workouts that are marked as completed but status is not 'completed'
UPDATE workouts 
SET status = 'completed' 
WHERE completed = true AND status != 'completed';