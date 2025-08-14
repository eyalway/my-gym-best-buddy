-- Create table for workout sessions
CREATE TABLE public.workouts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_type text NOT NULL CHECK (workout_type IN ('A', 'B', 'C')),
  workout_title text NOT NULL,
  start_time timestamp with time zone NOT NULL DEFAULT now(),
  end_time timestamp with time zone,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for exercises within workout sessions
CREATE TABLE public.workout_exercises (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id uuid REFERENCES public.workouts(id) ON DELETE CASCADE NOT NULL,
  exercise_name text NOT NULL,
  target_muscle text NOT NULL,
  machine_number text,
  seat_height text,
  sets text,
  reps text,
  weight text,
  completed boolean NOT NULL DEFAULT false,
  exercise_order integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;

-- Create policies for workouts table
CREATE POLICY "Users can view their own workouts" 
ON public.workouts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workouts" 
ON public.workouts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts" 
ON public.workouts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workouts" 
ON public.workouts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for workout_exercises table
CREATE POLICY "Users can view exercises from their own workouts" 
ON public.workout_exercises 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.workouts 
  WHERE workouts.id = workout_exercises.workout_id 
  AND workouts.user_id = auth.uid()
));

CREATE POLICY "Users can create exercises for their own workouts" 
ON public.workout_exercises 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.workouts 
  WHERE workouts.id = workout_exercises.workout_id 
  AND workouts.user_id = auth.uid()
));

CREATE POLICY "Users can update exercises from their own workouts" 
ON public.workout_exercises 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.workouts 
  WHERE workouts.id = workout_exercises.workout_id 
  AND workouts.user_id = auth.uid()
));

CREATE POLICY "Users can delete exercises from their own workouts" 
ON public.workout_exercises 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.workouts 
  WHERE workouts.id = workout_exercises.workout_id 
  AND workouts.user_id = auth.uid()
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_workouts_updated_at
  BEFORE UPDATE ON public.workouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workout_exercises_updated_at
  BEFORE UPDATE ON public.workout_exercises
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_workouts_user_id ON public.workouts(user_id);
CREATE INDEX idx_workouts_workout_type ON public.workouts(workout_type);
CREATE INDEX idx_workouts_created_at ON public.workouts(created_at);
CREATE INDEX idx_workout_exercises_workout_id ON public.workout_exercises(workout_id);
CREATE INDEX idx_workout_exercises_order ON public.workout_exercises(exercise_order);