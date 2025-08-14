import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Exercise } from './useExercises';

export interface WorkoutSession {
  id: string;
  workout_type: 'A' | 'B' | 'C';
  workout_title: string;
  start_time: string;
  end_time?: string;
  completed: boolean;
}

export interface WorkoutExercise {
  exercise_name: string;
  target_muscle: string;
  machine_number?: string;
  seat_height?: string;
  sets: string;
  reps: string;
  weight?: string;
  completed: boolean;
  exercise_order: number;
}

export const useWorkoutSession = () => {
  const [currentWorkoutId, setCurrentWorkoutId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const startWorkout = async (
    workoutType: 'A' | 'B' | 'C',
    workoutTitle: string,
    exercises: Exercise[]
  ) => {
    try {
      setIsLoading(true);

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "נדרש להתחבר",
          description: "יש להתחבר כדי לשמור את נתוני האימון",
          variant: "destructive",
        });
        return null;
      }

      // Create workout session
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          workout_type: workoutType,
          workout_title: workoutTitle,
          start_time: new Date().toISOString(),
          completed: false,
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      // Create workout exercises
      const workoutExercises: Omit<WorkoutExercise, 'completed'>[] = exercises.map((exercise, index) => ({
        exercise_name: exercise.name,
        target_muscle: exercise.targetMuscle,
        machine_number: exercise.machineNumber,
        seat_height: exercise.seatHeight,
        sets: exercise.sets || '',
        reps: exercise.reps || '',
        weight: exercise.weight,
        exercise_order: index,
      }));

      const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(
          workoutExercises.map(exercise => ({
            workout_id: workout.id,
            ...exercise,
            completed: false,
          }))
        );

      if (exercisesError) throw exercisesError;

      setCurrentWorkoutId(workout.id);
      return workout.id;

    } catch (error) {
      console.error('Error starting workout:', error);
      toast({
        title: "שגיאה בהתחלת האימון",
        description: "לא הצלחנו לשמור את פרטי האימון",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const completeWorkout = async (workoutId: string, completedExerciseIndices: Set<number>) => {
    try {
      setIsLoading(true);

      // Update workout as completed
      const { error: workoutError } = await supabase
        .from('workouts')
        .update({
          end_time: new Date().toISOString(),
          completed: true,
        })
        .eq('id', workoutId);

      if (workoutError) throw workoutError;

      // Update completed exercises
      const { data: exercises, error: fetchError } = await supabase
        .from('workout_exercises')
        .select('id, exercise_order')
        .eq('workout_id', workoutId)
        .order('exercise_order');

      if (fetchError) throw fetchError;

      // Mark completed exercises
      const updatePromises = exercises.map(exercise => {
        const isCompleted = completedExerciseIndices.has(exercise.exercise_order);
        return supabase
          .from('workout_exercises')
          .update({ completed: isCompleted })
          .eq('id', exercise.id);
      });

      await Promise.all(updatePromises);

      setCurrentWorkoutId(null);

      toast({
        title: "האימון נשמר בהצלחה! 🎉",
        description: "ניתן לעקוב אחר ההתקדמות בעמוד הסטטיסטיקות",
      });

    } catch (error) {
      console.error('Error completing workout:', error);
      toast({
        title: "שגיאה בשמירת האימון",
        description: "האימון הושלם אך לא נשמר במערכת",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateExerciseWeight = async (workoutId: string, exerciseOrder: number, newWeight: string) => {
    try {
      const { error } = await supabase
        .from('workout_exercises')
        .update({ weight: newWeight })
        .eq('workout_id', workoutId)
        .eq('exercise_order', exerciseOrder);

      if (error) throw error;

    } catch (error) {
      console.error('Error updating exercise weight:', error);
    }
  };

  return {
    currentWorkoutId,
    isLoading,
    startWorkout,
    completeWorkout,
    updateExerciseWeight,
  };
};