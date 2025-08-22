-- Add status column to workouts table to track workout state
ALTER TABLE workouts ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed'));

-- Add paused_at column to track when workout was paused
ALTER TABLE workouts ADD COLUMN paused_at timestamp with time zone;

-- Update existing completed workouts to have correct status
UPDATE workouts SET status = 'completed' WHERE completed = true;