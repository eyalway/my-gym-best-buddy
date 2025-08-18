import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WorkoutHistory {
  id: string;
  workout_type: string;
  workout_title: string;
  start_time: string;
  end_time: string | null;
  completed: boolean;
  duration_minutes: number | null;
}

export const useWorkoutHistory = () => {
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkoutHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('id, workout_type, workout_title, start_time, end_time, completed')
        .eq('completed', true)
        .not('end_time', 'is', null)
        .is('deleted_at', null) // Only show non-deleted workouts
        .order('start_time', { ascending: false })
        .limit(50); // נביא 50 אימונים אחרונים

      if (error) throw error;

      const historyWithDuration = data?.map(workout => ({
        ...workout,
        duration_minutes: workout.end_time 
          ? Math.round((new Date(workout.end_time).getTime() - new Date(workout.start_time).getTime()) / (1000 * 60))
          : null
      })) || [];

      setWorkoutHistory(historyWithDuration);
    } catch (error) {
      console.error('Error fetching workout history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkoutHistory();
  }, []);

  const getAverageWorkoutDuration = (workoutType: 'A' | 'B' | 'C'): number | null => {
    const workoutsOfType = workoutHistory
      .filter(w => w.workout_type === workoutType && w.duration_minutes !== null)
      .slice(0, 10); // 10 אימונים אחרונים

    if (workoutsOfType.length === 0) return null;

    const totalMinutes = workoutsOfType.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);
    return Math.round(totalMinutes / workoutsOfType.length);
  };

  return {
    workoutHistory,
    loading,
    getAverageWorkoutDuration,
    refetch: fetchWorkoutHistory
  };
};