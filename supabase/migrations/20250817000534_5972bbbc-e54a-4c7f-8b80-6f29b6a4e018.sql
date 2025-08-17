-- Delete only workout history data, keep exercise templates
-- First delete workout exercises (child records)
DELETE FROM public.workout_exercises 
WHERE workout_id IN (
  SELECT id FROM public.workouts 
  WHERE user_id = auth.uid()
);

-- Then delete workouts  
DELETE FROM public.workouts 
WHERE user_id = auth.uid();