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
}

const DEFAULT_EXERCISES: Exercise[] = [
  // Workout A - חזה, כתפיים, יד אחורית ובטן
  { id: '1', name: 'Bench Press', targetMuscle: 'חזה', machineNumber: '1', seatHeight: '5', sets: '4', reps: '8-12', weight: '70', workoutType: 'A' },
  { id: '2', name: 'Incline Dumbbell Press', targetMuscle: 'חזה', machineNumber: '2', seatHeight: '4', sets: '3', reps: '10-12', weight: '25', workoutType: 'A' },
  { id: '3', name: 'Shoulder Press', targetMuscle: 'כתפיים', machineNumber: '3', seatHeight: '6', sets: '4', reps: '8-10', weight: '45', workoutType: 'A' },
  { id: '4', name: 'Lateral Raises', targetMuscle: 'כתפיים', machineNumber: '4', seatHeight: '5', sets: '3', reps: '12-15', weight: '12', workoutType: 'A' },
  { id: '5', name: 'Tricep Dips', targetMuscle: 'יד אחורית', sets: '3', reps: '10-12', workoutType: 'A' },
  { id: '6', name: 'Overhead Tricep Extension', targetMuscle: 'יד אחורית', machineNumber: '5', seatHeight: '4', sets: '3', reps: '10-12', weight: '20', workoutType: 'A' },
  { id: '7', name: 'Plank', targetMuscle: 'בטן', sets: '3', reps: '30-60 שניות', workoutType: 'A' },
  { id: '8', name: 'Russian Twists', targetMuscle: 'בטן', sets: '3', reps: '20-30', workoutType: 'A' },

  // Workout B - גב, יד קידמית ובטן
  { id: '9', name: 'Pull-ups', targetMuscle: 'גב', sets: '4', reps: '6-10', workoutType: 'B' },
  { id: '10', name: 'Barbell Rows', targetMuscle: 'גב', machineNumber: '6', seatHeight: '5', sets: '4', reps: '8-10', weight: '60', workoutType: 'B' },
  { id: '11', name: 'Lat Pulldowns', targetMuscle: 'גב', machineNumber: '7', seatHeight: '6', sets: '3', reps: '10-12', weight: '50', workoutType: 'B' },
  { id: '12', name: 'Bicep Curls', targetMuscle: 'יד קידמית', machineNumber: '8', seatHeight: '4', sets: '4', reps: '10-12', weight: '15', workoutType: 'B' },
  { id: '13', name: 'Hammer Curls', targetMuscle: 'יד קידמית', sets: '3', reps: '10-12', weight: '12', workoutType: 'B' },
  { id: '14', name: 'Cable Curls', targetMuscle: 'יד קידמית', machineNumber: '9', seatHeight: '5', sets: '3', reps: '12-15', weight: '25', workoutType: 'B' },
  { id: '15', name: 'Dead Bug', targetMuscle: 'בטן', sets: '3', reps: '10 לכל צד', workoutType: 'B' },
  { id: '16', name: 'Mountain Climbers', targetMuscle: 'בטן', sets: '3', reps: '20-30', workoutType: 'B' },

  // Workout C - רגליים, זרועות ובטן
  { id: '17', name: 'Squats', targetMuscle: 'רגליים', machineNumber: '10', seatHeight: '7', sets: '4', reps: '10-15', weight: '80', workoutType: 'C' },
  { id: '18', name: 'Romanian Deadlift', targetMuscle: 'רגליים', sets: '4', reps: '8-10', weight: '70', workoutType: 'C' },
  { id: '19', name: 'Walking Lunges', targetMuscle: 'רגליים', sets: '3', reps: '12 לכל רגל', workoutType: 'C' },
  { id: '20', name: 'Calf Raises', targetMuscle: 'רגליים', machineNumber: '11', seatHeight: '6', sets: '4', reps: '15-20', weight: '40', workoutType: 'C' },
  { id: '21', name: 'Bicep Curls', targetMuscle: 'יד קידמית', machineNumber: '8', seatHeight: '4', sets: '3', reps: '10-12', weight: '15', workoutType: 'C' },
  { id: '22', name: 'Close-Grip Push-ups', targetMuscle: 'יד אחורית', sets: '3', reps: '8-12', workoutType: 'C' },
  { id: '23', name: 'Leg Raises', targetMuscle: 'בטן', sets: '3', reps: '12-15', workoutType: 'C' },
  { id: '24', name: 'Bicycle Crunches', targetMuscle: 'בטן', sets: '3', reps: '20 לכל צד', workoutType: 'C' },
];

export const useExercises = () => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  // Load exercises from database on mount
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    loadExercises();
  }, [user]);

  const loadExercises = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // First try to load from database
      const { data: dbExercises, error } = await supabase
        .from('exercise_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('workout_type, exercise_order');

      if (error) {
        console.error('Error loading exercises from database:', error);
        // Fallback to localStorage for migration
        await migrateFromLocalStorage();
        return;
      }

      if (dbExercises && dbExercises.length > 0) {
        // Convert database format to Exercise format
        const convertedExercises: Exercise[] = dbExercises.map(ex => ({
          id: ex.id,
          name: ex.exercise_name,
          targetMuscle: ex.target_muscle,
          machineNumber: ex.machine_number || '',
          seatHeight: ex.seat_height || '',
          sets: ex.sets || '',
          reps: ex.reps || '',
          weight: ex.weight || '',
          workoutType: ex.workout_type as 'A' | 'B' | 'C'
        }));
        
        setExercises(convertedExercises);
        console.log('Loaded exercises from database:', convertedExercises.length);
      } else {
        // No exercises in database, try to migrate from localStorage
        await migrateFromLocalStorage();
      }
    } catch (error) {
      console.error('Error in loadExercises:', error);
      await migrateFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const migrateFromLocalStorage = async () => {
    console.log('Attempting to migrate from localStorage...');
    const savedExercises = localStorage.getItem('fitness-exercises');
    
    if (savedExercises && user) {
      try {
        const localExercises: Exercise[] = JSON.parse(savedExercises);
        console.log('Found exercises in localStorage:', localExercises.length);
        
        // Save to database
        for (const exercise of localExercises) {
          await supabase
            .from('exercise_templates')
            .insert({
              user_id: user.id,
              exercise_name: exercise.name,
              target_muscle: exercise.targetMuscle,
              machine_number: exercise.machineNumber || null,
              seat_height: exercise.seatHeight || null,
              sets: exercise.sets || null,
              reps: exercise.reps || null,
              weight: exercise.weight || null,
              workout_type: exercise.workoutType,
              exercise_order: parseInt(exercise.id) || 0
            });
        }
        
        console.log('Migration to database completed');
        
        // Clear localStorage after successful migration
        localStorage.removeItem('fitness-exercises');
        
        // Reload from database
        await loadExercises();
        return;
      } catch (error) {
        console.error('Error migrating from localStorage:', error);
      }
    }
    
    // If no localStorage data, use default exercises
    console.log('Using default exercises');
    setExercises(DEFAULT_EXERCISES);
    
    // Save default exercises to database for this user
    if (user) {
      await saveDefaultExercisesToDb();
    }
  };

  const saveDefaultExercisesToDb = async () => {
    if (!user) return;
    
    try {
      for (let i = 0; i < DEFAULT_EXERCISES.length; i++) {
        const exercise = DEFAULT_EXERCISES[i];
        await supabase
          .from('exercise_templates')
          .insert({
            user_id: user.id,
            exercise_name: exercise.name,
            target_muscle: exercise.targetMuscle,
            machine_number: exercise.machineNumber || null,
            seat_height: exercise.seatHeight || null,
            sets: exercise.sets || null,
            reps: exercise.reps || null,
            weight: exercise.weight || null,
            workout_type: exercise.workoutType,
            exercise_order: i
          });
      }
      console.log('Default exercises saved to database');
    } catch (error) {
      console.error('Error saving default exercises to database:', error);
    }
  };

  const addExercise = async (exercise: Omit<Exercise, 'id'>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('exercise_templates')
        .insert({
          user_id: user.id,
          exercise_name: exercise.name,
          target_muscle: exercise.targetMuscle,
          machine_number: exercise.machineNumber || null,
          seat_height: exercise.seatHeight || null,
          sets: exercise.sets || null,
          reps: exercise.reps || null,
          weight: exercise.weight || null,
          workout_type: exercise.workoutType,
          exercise_order: exercises.filter(ex => ex.workoutType === exercise.workoutType).length
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding exercise:', error);
        return;
      }

      if (data) {
        const newExercise: Exercise = {
          id: data.id,
          name: data.exercise_name,
          targetMuscle: data.target_muscle,
          machineNumber: data.machine_number || '',
          seatHeight: data.seat_height || '',
          sets: data.sets || '',
          reps: data.reps || '',
          weight: data.weight || '',
          workoutType: data.workout_type as 'A' | 'B' | 'C'
        };
        
        setExercises(prev => [...prev, newExercise]);
        console.log('Exercise added successfully');
      }
    } catch (error) {
      console.error('Error in addExercise:', error);
    }
  };

  const updateExercise = async (id: string, updatedExercise: Omit<Exercise, 'id'>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('exercise_templates')
        .update({
          exercise_name: updatedExercise.name,
          target_muscle: updatedExercise.targetMuscle,
          machine_number: updatedExercise.machineNumber || null,
          seat_height: updatedExercise.seatHeight || null,
          sets: updatedExercise.sets || null,
          reps: updatedExercise.reps || null,
          weight: updatedExercise.weight || null,
          workout_type: updatedExercise.workoutType
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating exercise:', error);
        return;
      }

      setExercises(prev =>
        prev.map(exercise =>
          exercise.id === id ? { ...updatedExercise, id } : exercise
        )
      );
      console.log('Exercise updated successfully');
    } catch (error) {
      console.error('Error in updateExercise:', error);
    }
  };

  const deleteExercise = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('exercise_templates')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting exercise:', error);
        return;
      }

      setExercises(prev => prev.filter(exercise => exercise.id !== id));
      console.log('Exercise deleted successfully');
    } catch (error) {
      console.error('Error in deleteExercise:', error);
    }
  };

  const getExercisesByWorkout = (workoutType: 'A' | 'B' | 'C') => {
    const filtered = exercises.filter(exercise => exercise.workoutType === workoutType);
    console.log(`getExercisesByWorkout for ${workoutType}:`, filtered.length, 'exercises found');
    console.log('All exercises:', exercises.length);
    return filtered;
  };

  const reorderExercise = async (id: string, direction: 'up' | 'down', workoutType: 'A' | 'B' | 'C') => {
    if (!user) return;
    
    console.log('Reordering exercise:', id, direction, workoutType);
    
    const currentWorkoutExercises = exercises.filter(ex => ex.workoutType === workoutType);
    const exerciseIndex = currentWorkoutExercises.findIndex(ex => ex.id === id);
    
    if (exerciseIndex === -1) {
      console.log('Exercise not found');
      return;
    }
    
    const targetIndex = direction === 'up' ? exerciseIndex - 1 : exerciseIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= currentWorkoutExercises.length) {
      console.log('Target index out of bounds:', targetIndex);
      return;
    }
    
    // Update database with new orders
    try {
      const reorderedExercises = [...currentWorkoutExercises];
      const [movedExercise] = reorderedExercises.splice(exerciseIndex, 1);
      reorderedExercises.splice(targetIndex, 0, movedExercise);
      
      // Update exercise orders in database
      for (let i = 0; i < reorderedExercises.length; i++) {
        const exercise = reorderedExercises[i];
        await supabase
          .from('exercise_templates')
          .update({ exercise_order: i })
          .eq('id', exercise.id)
          .eq('user_id', user.id);
      }
      
      // Update local state
      setExercises(prev => {
        const otherExercises = prev.filter(ex => ex.workoutType !== workoutType);
        return [...otherExercises, ...reorderedExercises];
      });
      
      console.log('Reordered successfully');
    } catch (error) {
      console.error('Error reordering exercises:', error);
    }
  };

  return {
    exercises,
    loading,
    addExercise,
    updateExercise,
    deleteExercise,
    getExercisesByWorkout,
    reorderExercise,
  };
};