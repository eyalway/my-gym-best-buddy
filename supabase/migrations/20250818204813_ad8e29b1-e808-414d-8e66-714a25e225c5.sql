-- Fix security issue: Set search_path for restore_workout function
CREATE OR REPLACE FUNCTION restore_workout(workout_id UUID)
RETURNS VOID 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE workouts 
  SET deleted_at = NULL, updated_at = now()
  WHERE id = workout_id AND user_id = auth.uid();
END;
$$;