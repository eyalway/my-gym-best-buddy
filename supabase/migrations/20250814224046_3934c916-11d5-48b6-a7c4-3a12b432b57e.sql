-- Create exercise_templates table for storing user's custom exercise templates
CREATE TABLE public.exercise_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_name TEXT NOT NULL,
  target_muscle TEXT NOT NULL,
  machine_number TEXT,
  seat_height TEXT,
  sets TEXT,
  reps TEXT,
  weight TEXT,
  workout_type TEXT NOT NULL CHECK (workout_type IN ('A', 'B', 'C')),
  exercise_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exercise_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own exercise templates" 
ON public.exercise_templates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exercise templates" 
ON public.exercise_templates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercise templates" 
ON public.exercise_templates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exercise templates" 
ON public.exercise_templates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_exercise_templates_updated_at
BEFORE UPDATE ON public.exercise_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();