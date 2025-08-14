import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface WorkoutStats {
  caloriesBurned: number;
  workoutTimeToday: number;
  workoutsThisWeek: number;
  personalBest: {
    exercise: string;
    weight: number;
  } | null;
}

export const useWorkoutStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<WorkoutStats>({
    caloriesBurned: 0,
    workoutTimeToday: 0,
    workoutsThisWeek: 0,
    personalBest: null,
  });
  const [loading, setLoading] = useState(true);

  const calculateStats = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Get today's date range
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

      // Get start of week (Sunday)
      const startOfWeek = new Date(today);
      const dayOfWeek = today.getDay();
      startOfWeek.setDate(today.getDate() - dayOfWeek);
      startOfWeek.setHours(0, 0, 0, 0);

      // Fetch today's completed workouts
      const { data: todayWorkouts } = await supabase
        .from('workouts')
        .select('start_time, end_time, workout_type')
        .eq('user_id', user.id)
        .eq('completed', true)
        .gte('start_time', startOfToday.toISOString())
        .lt('start_time', endOfToday.toISOString());

      // Fetch this week's completed workouts
      const { data: weekWorkouts } = await supabase
        .from('workouts')
        .select('id')
        .eq('user_id', user.id)
        .eq('completed', true)
        .gte('start_time', startOfWeek.toISOString());

      // Calculate today's workout time and calories
      let totalMinutesToday = 0;
      let totalCalories = 0;

      if (todayWorkouts) {
        todayWorkouts.forEach(workout => {
          if (workout.end_time && workout.start_time) {
            const startTime = new Date(workout.start_time);
            const endTime = new Date(workout.end_time);
            const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
            
            totalMinutesToday += durationMinutes;
            
            // Calculate calories based on workout type
            const caloriesPerMinute = workout.workout_type === 'C' ? 8 : 6; // C is legs workout (harder)
            totalCalories += durationMinutes * caloriesPerMinute;
          }
        });
      }

      // Get all exercises with weights for personal best (random selection)
      const { data: exercises } = await supabase
        .from('workout_exercises')
        .select('exercise_name, weight')
        .in('workout_id', 
          (await supabase
            .from('workouts')
            .select('id')
            .eq('user_id', user.id)
            .eq('completed', true)
          ).data?.map(w => w.id) || []
        )
        .not('weight', 'is', null)
        .neq('weight', '');

      // Find personal best from random exercise
      let personalBest = null;
      if (exercises && exercises.length > 0) {
        // Group by exercise name and find max weight for each
        const exerciseMaxWeights: { [key: string]: number } = {};
        
        exercises.forEach(exercise => {
          const weight = parseFloat(exercise.weight || '0');
          if (!isNaN(weight) && weight > 0) {
            if (!exerciseMaxWeights[exercise.exercise_name] || weight > exerciseMaxWeights[exercise.exercise_name]) {
              exerciseMaxWeights[exercise.exercise_name] = weight;
            }
          }
        });

        // Pick a random exercise for display
        const exerciseNames = Object.keys(exerciseMaxWeights);
        if (exerciseNames.length > 0) {
          const randomExercise = exerciseNames[Math.floor(Math.random() * exerciseNames.length)];
          personalBest = {
            exercise: randomExercise,
            weight: exerciseMaxWeights[randomExercise]
          };
        }
      }

      setStats({
        caloriesBurned: Math.round(totalCalories),
        workoutTimeToday: Math.round(totalMinutesToday),
        workoutsThisWeek: weekWorkouts?.length || 0,
        personalBest,
      });

    } catch (error) {
      console.error('Error calculating workout stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateStats();
  }, [user]);

  return { stats, loading, refetch: calculateStats };
};