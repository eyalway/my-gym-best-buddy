import { useState, useEffect } from 'react';
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

  // Check for any active workout on mount
  useEffect(() => {
    const checkActiveWorkout = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('workouts')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .eq('completed', false)
          .is('deleted_at', null)
          .limit(1);

        if (error) throw error;
        
        if (data && data.length > 0) {
          setCurrentWorkoutId(data[0].id);
        }
      } catch (error) {
        console.error('Error checking for active workout:', error);
      }
    };

    checkActiveWorkout();
  }, []);

  // Check for paused workouts on mount
  const checkForPausedWorkout = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // First check for specifically paused workouts
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'paused')
        .eq('completed', false)
        .is('deleted_at', null)
        .order('paused_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      // If found a paused workout, return it
      if (data && data.length > 0) {
        return data[0];
      }

      // If no paused workout found, check for any active uncompleted workouts
      // These might be orphaned active workouts that should be paused
      const { data: activeData, error: activeError } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .eq('completed', false)
        .is('deleted_at', null)
        .is('end_time', null)
        .order('start_time', { ascending: false })
        .limit(1);

      if (activeError) throw activeError;

      // If there's an active workout, auto-pause it and return the UPDATED workout
      if (activeData && activeData.length > 0) {
        const activeWorkout = activeData[0];
        
        // Update the existing workout to paused status
        const { data: updatedWorkout, error: updateError } = await supabase
          .from('workouts')
          .update({
            status: 'paused',
            paused_at: new Date().toISOString()
          })
          .eq('id', activeWorkout.id)
          .select()
          .single();

        if (updateError) throw updateError;

        return updatedWorkout;
      }

      return null;
    } catch (error) {
      console.error('Error checking for paused workout:', error);
      return null;
    }
  };

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

      // First, check if there are ANY uncompleted workouts for this user
      const { data: existingWorkouts, error: checkError } = await supabase
        .from('workouts')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('completed', false)
        .is('deleted_at', null);

      if (checkError) throw checkError;

      // If there are any uncompleted workouts, don't create a new one
      if (existingWorkouts && existingWorkouts.length > 0) {
        toast({
          title: "יש אימון פעיל",
          description: "חזור לדף הבית להמשיך את האימון הקיים",
          variant: "destructive",
        });
        return null;
      }

      // Create workout session only if no uncompleted workouts exist
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          workout_type: workoutType,
          workout_title: workoutTitle,
          start_time: new Date().toISOString(),
          completed: false,
          status: 'active'
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
          status: 'completed',
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

  const pauseWorkout = async (workoutId: string) => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('workouts')
        .update({
          status: 'paused',
          paused_at: new Date().toISOString(),
        })
        .eq('id', workoutId);

      if (error) throw error;

      setCurrentWorkoutId(null);

      toast({
        title: "האימון הושהה ⏸️",
        description: "תוכל להמשיך מאוחר יותר מהדף הבית",
      });

    } catch (error) {
      console.error('Error pausing workout:', error);
      toast({
        title: "שגיאה בהשהיית האימון",
        description: "לא הצלחנו להשהות את האימון",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resumeWorkout = async (workoutId: string) => {
    try {
      setIsLoading(true);

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "נדרש להתחבר",
          description: "יש להתחבר כדי להמשיך את האימון",
          variant: "destructive",
        });
        return null;
      }

      // First, pause ALL other workouts (active, paused, or any uncompleted workouts)
      // except the one we're resuming to ensure no duplicates
      await supabase
        .from('workouts')
        .update({
          status: 'paused',
          paused_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('completed', false)
        .is('deleted_at', null)
        .neq('id', workoutId);

      // Now resume ONLY the specific workout we want
      const { error } = await supabase
        .from('workouts')
        .update({
          status: 'active',
          paused_at: null,
        })
        .eq('id', workoutId)
        .eq('user_id', user.id)
        .eq('completed', false);

      if (error) throw error;

      setCurrentWorkoutId(workoutId);

      // Also store in localStorage for immediate access
      localStorage.setItem('currentWorkoutId', workoutId);

      toast({
        title: "האימון התחדש! ▶️",
        description: "המשך משם שעצרת",
      });

      return workoutId;

    } catch (error) {
      console.error('Error resuming workout:', error);
      toast({
        title: "שגיאה בהמשכת האימון",
        description: "לא הצלחנו להמשיך את האימון",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentWorkoutId,
    isLoading,
    startWorkout,
    completeWorkout,
    pauseWorkout,
    resumeWorkout,
    checkForPausedWorkout,
    updateExerciseWeight,
  };
};