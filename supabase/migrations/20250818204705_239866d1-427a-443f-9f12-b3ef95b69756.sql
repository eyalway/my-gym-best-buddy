-- Add deleted_at column to workouts table for soft delete
ALTER TABLE workouts ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for better performance when filtering out deleted workouts
CREATE INDEX idx_workouts_deleted_at ON workouts(deleted_at) WHERE deleted_at IS NULL;

-- Add a function to restore deleted workouts
CREATE OR REPLACE FUNCTION restore_workout(workout_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE workouts 
  SET deleted_at = NULL, updated_at = now()
  WHERE id = workout_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;