import { useState, useEffect } from 'react';

export interface Exercise {
  id: string;
  name: string;
  targetMuscle: string;
  sets?: string;
  reps?: string;
  weight?: string;
  workoutType: 'A' | 'B' | 'C';
}

const DEFAULT_EXERCISES: Exercise[] = [
  // Workout A - חזה, כתפיים, יד אחורית ובטן
  { id: '1', name: 'Bench Press', targetMuscle: 'חזה', sets: '4', reps: '8-12', weight: '70', workoutType: 'A' },
  { id: '2', name: 'Incline Dumbbell Press', targetMuscle: 'חזה', sets: '3', reps: '10-12', weight: '25', workoutType: 'A' },
  { id: '3', name: 'Shoulder Press', targetMuscle: 'כתפיים', sets: '4', reps: '8-10', weight: '45', workoutType: 'A' },
  { id: '4', name: 'Lateral Raises', targetMuscle: 'כתפיים', sets: '3', reps: '12-15', weight: '12', workoutType: 'A' },
  { id: '5', name: 'Tricep Dips', targetMuscle: 'יד אחורית', sets: '3', reps: '10-12', workoutType: 'A' },
  { id: '6', name: 'Overhead Tricep Extension', targetMuscle: 'יד אחורית', sets: '3', reps: '10-12', weight: '20', workoutType: 'A' },
  { id: '7', name: 'Plank', targetMuscle: 'בטן', sets: '3', reps: '30-60 שניות', workoutType: 'A' },
  { id: '8', name: 'Russian Twists', targetMuscle: 'בטן', sets: '3', reps: '20-30', workoutType: 'A' },

  // Workout B - גב, יד קידמית ובטן
  { id: '9', name: 'Pull-ups', targetMuscle: 'גב', sets: '4', reps: '6-10', workoutType: 'B' },
  { id: '10', name: 'Barbell Rows', targetMuscle: 'גב', sets: '4', reps: '8-10', weight: '60', workoutType: 'B' },
  { id: '11', name: 'Lat Pulldowns', targetMuscle: 'גב', sets: '3', reps: '10-12', weight: '50', workoutType: 'B' },
  { id: '12', name: 'Bicep Curls', targetMuscle: 'יד קידמית', sets: '4', reps: '10-12', weight: '15', workoutType: 'B' },
  { id: '13', name: 'Hammer Curls', targetMuscle: 'יד קידמית', sets: '3', reps: '10-12', weight: '12', workoutType: 'B' },
  { id: '14', name: 'Cable Curls', targetMuscle: 'יד קידמית', sets: '3', reps: '12-15', weight: '25', workoutType: 'B' },
  { id: '15', name: 'Dead Bug', targetMuscle: 'בטן', sets: '3', reps: '10 לכל צד', workoutType: 'B' },
  { id: '16', name: 'Mountain Climbers', targetMuscle: 'בטן', sets: '3', reps: '20-30', workoutType: 'B' },

  // Workout C - רגליים, זרועות ובטן
  { id: '17', name: 'Squats', targetMuscle: 'רגליים', sets: '4', reps: '10-15', weight: '80', workoutType: 'C' },
  { id: '18', name: 'Romanian Deadlift', targetMuscle: 'רגליים', sets: '4', reps: '8-10', weight: '70', workoutType: 'C' },
  { id: '19', name: 'Walking Lunges', targetMuscle: 'רגליים', sets: '3', reps: '12 לכל רגל', workoutType: 'C' },
  { id: '20', name: 'Calf Raises', targetMuscle: 'רגליים', sets: '4', reps: '15-20', weight: '40', workoutType: 'C' },
  { id: '21', name: 'Bicep Curls', targetMuscle: 'יד קידמית', sets: '3', reps: '10-12', weight: '15', workoutType: 'C' },
  { id: '22', name: 'Close-Grip Push-ups', targetMuscle: 'יד אחורית', sets: '3', reps: '8-12', workoutType: 'C' },
  { id: '23', name: 'Leg Raises', targetMuscle: 'בטן', sets: '3', reps: '12-15', workoutType: 'C' },
  { id: '24', name: 'Bicycle Crunches', targetMuscle: 'בטן', sets: '3', reps: '20 לכל צד', workoutType: 'C' },
];

export const useExercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);

  // Load exercises from localStorage on mount
  useEffect(() => {
    const savedExercises = localStorage.getItem('fitness-exercises');
    if (savedExercises) {
      setExercises(JSON.parse(savedExercises));
    } else {
      setExercises(DEFAULT_EXERCISES);
    }
  }, []);

  // Save exercises to localStorage whenever exercises change
  useEffect(() => {
    if (exercises.length > 0) {
      localStorage.setItem('fitness-exercises', JSON.stringify(exercises));
    }
  }, [exercises]);

  const addExercise = (exercise: Omit<Exercise, 'id'>) => {
    const newExercise: Exercise = {
      ...exercise,
      id: Date.now().toString(),
    };
    setExercises(prev => [...prev, newExercise]);
  };

  const updateExercise = (id: string, updatedExercise: Omit<Exercise, 'id'>) => {
    setExercises(prev =>
      prev.map(exercise =>
        exercise.id === id ? { ...updatedExercise, id } : exercise
      )
    );
  };

  const deleteExercise = (id: string) => {
    setExercises(prev => prev.filter(exercise => exercise.id !== id));
  };

  const getExercisesByWorkout = (workoutType: 'A' | 'B' | 'C') => {
    return exercises.filter(exercise => exercise.workoutType === workoutType);
  };

  return {
    exercises,
    addExercise,
    updateExercise,
    deleteExercise,
    getExercisesByWorkout,
  };
};