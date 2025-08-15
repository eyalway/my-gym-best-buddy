import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Exercise {
  id: string;
  name: string;
  targetMuscle: string;
  machineNumber?: string;
  seatHeight?: string;
  sets?: string;
  reps?: string;
  weight?: string;
  workoutType: 'A' | 'B' | 'C';
  exerciseOrder?: number;
}

export const useSupabaseExercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load exercises from Supabase
  useEffect(() => {
    if (user) {
      loadExercises();
    }
  }, [user]);

  const loadExercises = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('exercise_templates' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('exercise_order');

      if (error) {
        console.error('Error loading exercises:', error);
        return;
      }

      // Transform the data to our Exercise interface
      const transformedExercises: Exercise[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.exercise_name,
        targetMuscle: item.target_muscle,
        machineNumber: item.machine_number,
        seatHeight: item.seat_height,
        sets: item.sets,
        reps: item.reps,
        weight: item.weight,
        workoutType: item.workout_type as 'A' | 'B' | 'C',
        exerciseOrder: item.exercise_order
      }));

      setExercises(transformedExercises);
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const addExercise = async (exercise: Omit<Exercise, 'id'>) => {
    if (!user) return;

    try {
      // Get the next order number for this workout type
      const { data: existingExercises } = await supabase
        .from('exercise_templates' as any)
        .select('exercise_order')
        .eq('user_id', user.id)
        .eq('workout_type', exercise.workoutType)
        .order('exercise_order', { ascending: false })
        .limit(1);

      const nextOrder = existingExercises && existingExercises.length > 0 
        ? (existingExercises[0] as any).exercise_order + 1 
        : 1;

      const { data, error } = await supabase
        .from('exercise_templates' as any)
        .insert({
          user_id: user.id,
          exercise_name: exercise.name,
          target_muscle: exercise.targetMuscle,
          machine_number: exercise.machineNumber,
          seat_height: exercise.seatHeight,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
          workout_type: exercise.workoutType,
          exercise_order: nextOrder
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding exercise:', error);
        return;
      }

      // Reload exercises to get the updated list
      await loadExercises();
    } catch (error) {
      console.error('Error adding exercise:', error);
    }
  };

  const addMultipleExercises = async (exercises: Omit<Exercise, 'id'>[]) => {
    if (!user || exercises.length === 0) return;

    try {
      // Get the current max order for the workout type
      const workoutType = exercises[0].workoutType;
      const { data: existingExercises } = await supabase
        .from('exercise_templates' as any)
        .select('exercise_order')
        .eq('user_id', user.id)
        .eq('workout_type', workoutType)
        .order('exercise_order', { ascending: false })
        .limit(1);

      let nextOrder = existingExercises && existingExercises.length > 0 
        ? (existingExercises[0] as any).exercise_order + 1 
        : 1;

      // Prepare all exercises for insertion with incremental order
      const exercisesToInsert = exercises.map(exercise => ({
        user_id: user.id,
        exercise_name: exercise.name,
        target_muscle: exercise.targetMuscle,
        machine_number: exercise.machineNumber,
        seat_height: exercise.seatHeight,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight,
        workout_type: exercise.workoutType,
        exercise_order: nextOrder++
      }));

      const { error } = await supabase
        .from('exercise_templates' as any)
        .insert(exercisesToInsert);

      if (error) {
        console.error('Error adding multiple exercises:', error);
        return;
      }

      // Reload exercises to get the updated list
      await loadExercises();
    } catch (error) {
      console.error('Error adding multiple exercises:', error);
    }
  };

  const updateExercise = async (id: string, updatedExercise: Omit<Exercise, 'id'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('exercise_templates' as any)
        .update({
          exercise_name: updatedExercise.name,
          target_muscle: updatedExercise.targetMuscle,
          machine_number: updatedExercise.machineNumber,
          seat_height: updatedExercise.seatHeight,
          sets: updatedExercise.sets,
          reps: updatedExercise.reps,
          weight: updatedExercise.weight,
          workout_type: updatedExercise.workoutType
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating exercise:', error);
        return;
      }

      // Reload exercises to get the updated list
      await loadExercises();
    } catch (error) {
      console.error('Error updating exercise:', error);
    }
  };

  const deleteExercise = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('exercise_templates' as any)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting exercise:', error);
        return;
      }

      // Reload exercises to get the updated list
      await loadExercises();
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };

  const getExercisesByWorkout = (workoutType: 'A' | 'B' | 'C') => {
    return exercises
      .filter(exercise => exercise.workoutType === workoutType)
      .sort((a, b) => (a.exerciseOrder || 0) - (b.exerciseOrder || 0));
  };

  const reorderExercise = async (id: string, direction: 'up' | 'down', workoutType: 'A' | 'B' | 'C') => {
    if (!user) return;

    const workoutExercises = getExercisesByWorkout(workoutType);
    const exerciseIndex = workoutExercises.findIndex(ex => ex.id === id);
    
    if (exerciseIndex === -1) return;
    
    const targetIndex = direction === 'up' ? exerciseIndex - 1 : exerciseIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= workoutExercises.length) return;

    // Swap the exercise orders
    const currentExercise = workoutExercises[exerciseIndex];
    const targetExercise = workoutExercises[targetIndex];

    try {
      await supabase
        .from('exercise_templates' as any)
        .update({ exercise_order: targetExercise.exerciseOrder })
        .eq('id', currentExercise.id)
        .eq('user_id', user.id);

      await supabase
        .from('exercise_templates' as any)
        .update({ exercise_order: currentExercise.exerciseOrder })
        .eq('id', targetExercise.id)
        .eq('user_id', user.id);

      // Reload exercises to get the updated list
      await loadExercises();
    } catch (error) {
      console.error('Error reordering exercise:', error);
    }
  };

  return {
    exercises,
    loading,
    addExercise,
    addMultipleExercises,
    updateExercise,
    deleteExercise,
    getExercisesByWorkout,
    reorderExercise,
  };
};