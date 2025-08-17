
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { StatsCard } from '@/components/StatsCard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  Calendar, 
  Dumbbell, 
  Clock, 
  Flame, 
  Trophy, 
  BarChart3,
  ArrowRight,
  Target,
  Activity,
  Trash2
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface WorkoutData {
  id: string;
  workout_type: string;
  workout_title: string;
  start_time: string;
  end_time: string | null;
  completed: boolean;
  exercises: Array<{
    exercise_name: string;
    weight: string | null;
    sets: string | null;
    reps: string | null;
    completed: boolean;
  }>;
}

interface ExerciseProgress {
  exercise_name: string;
  weight: number;
  date: string;
  workout_type: string;
}

const Analytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [workouts, setWorkouts] = useState<WorkoutData[]>([]);
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>([]);
  const [availableExercises, setAvailableExercises] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [deleteWorkoutId, setDeleteWorkoutId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      // Clear existing data before fetching
      setWorkouts([]);
      setExerciseProgress([]);
      setAvailableExercises([]);
      setSelectedExercise('');
      
      fetchWorkoutData();
      fetchExerciseProgress();
    }
  }, [user, selectedPeriod]);

  useEffect(() => {
    if (selectedExercise && user) {
      fetchExerciseProgress();
    }
  }, [selectedExercise, user, selectedPeriod]);

  const fetchWorkoutData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const daysAgo = parseInt(selectedPeriod);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      console.log('Fetching workouts for user:', user.id);
      console.log('Start date:', startDate.toISOString());
      
      // Debug: Check current user auth state
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      console.log('Current authenticated user:', currentUser?.id);
      console.log('Are they the same?', user.id === currentUser?.id);

      const { data: workoutsData, error } = await supabase
        .from('workouts')
        .select(`
          id,
          workout_type,
          workout_title,
          start_time,
          end_time,
          completed,
          workout_exercises (
            exercise_name,
            weight,
            sets,
            reps,
            completed
          )
        `)
        .eq('user_id', user.id)
        .gte('start_time', startDate.toISOString())
        .order('start_time', { ascending: false });

      console.log('Workouts data:', workoutsData);
      console.log('Workouts error:', error);

      if (error) {
        console.error('Error fetching workouts:', error);
        setWorkouts([]);
        return;
      }

      const transformedData = (workoutsData || []).map(workout => ({
        ...workout,
        exercises: workout.workout_exercises || []
      }));

      console.log('Transformed workouts:', transformedData);
      setWorkouts(transformedData);
    } catch (error) {
      console.error('Error fetching workout data:', error);
      setWorkouts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExerciseProgress = async () => {
    if (!user) return;
    
    try {
      const daysAgo = parseInt(selectedPeriod);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      console.log('Fetching exercise progress for user:', user.id);

      // First get current exercise templates to filter by
      const { data: currentExercises, error: exerciseError } = await supabase
        .from('exercise_templates')
        .select('exercise_name')
        .eq('user_id', user.id);

      console.log('Current exercises:', currentExercises);
      console.log('Exercise templates error:', exerciseError);

      if (exerciseError) {
        console.error('Error fetching current exercises:', exerciseError);
        setAvailableExercises([]);
        setExerciseProgress([]);
        return;
      }

      const currentExerciseNames = (currentExercises || []).map(ex => ex.exercise_name);

      if (currentExerciseNames.length === 0) {
        console.log('No exercise templates found');
        setAvailableExercises([]);
        setExerciseProgress([]);
        return;
      }

      const { data: exerciseData, error } = await supabase
        .from('workout_exercises')
        .select(`
          exercise_name,
          weight,
          created_at,
          workouts!inner (
            user_id,
            start_time,
            workout_type,
            completed
          )
        `)
        .eq('workouts.user_id', user.id)
        .eq('workouts.completed', true)
        .gte('workouts.start_time', startDate.toISOString())
        .in('exercise_name', currentExerciseNames)
        .not('weight', 'is', null)
        .order('created_at', { ascending: true });

      console.log('Exercise data:', exerciseData);
      console.log('Exercise data error:', error);

      if (error) {
        console.error('Error fetching exercise progress:', error);
        setAvailableExercises([]);
        setExerciseProgress([]);
        return;
      }

      if (exerciseData && exerciseData.length > 0) {
        // Get unique exercise names from filtered data
        const exercises = [...new Set(exerciseData.map(item => item.exercise_name))];
        setAvailableExercises(exercises);
        
        // Set default selected exercise if none selected
        if (!selectedExercise && exercises.length > 0) {
          setSelectedExercise(exercises[0]);
        }

        // Transform data for charts
        const progressData: ExerciseProgress[] = exerciseData
          .filter(item => item.weight && parseFloat(item.weight) > 0)
          .map(item => ({
            exercise_name: item.exercise_name,
            weight: parseFloat(item.weight!),
            date: item.workouts.start_time,
            workout_type: item.workouts.workout_type
          }));

        setExerciseProgress(progressData);
      } else {
        console.log('No exercise data found');
        setAvailableExercises([]);
        setExerciseProgress([]);
      }
    } catch (error) {
      console.error('Error fetching exercise progress:', error);
      setAvailableExercises([]);
      setExerciseProgress([]);
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      // First delete all workout exercises
      const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .delete()
        .eq('workout_id', workoutId);

      if (exercisesError) {
        throw exercisesError;
      }

      // Then delete the workout
      const { error: workoutError } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId)
        .eq('user_id', user.id);

      if (workoutError) {
        throw workoutError;
      }

      // Update local state
      setWorkouts(prev => prev.filter(w => w.id !== workoutId));
      setDeleteWorkoutId(null);

      toast({
        title: "האימון נמחק בהצלחה! 🗑️",
        description: "נתוני האימון הוסרו מהמערכת",
      });

      // Refresh data to update stats
      fetchWorkoutData();
      fetchExerciseProgress();

    } catch (error) {
      console.error('Error deleting workout:', error);
      toast({
        title: "שגיאה במחיקת האימון",
        description: "לא הצלחנו למחוק את נתוני האימון",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate stats
  const completedWorkouts = workouts.filter(w => w.completed);
  const totalWorkouts = workouts.length;
  const totalExercises = workouts.reduce((sum, w) => sum + w.exercises.length, 0);
  const completedExercises = workouts.reduce((sum, w) => 
    sum + w.exercises.filter(e => e.completed).length, 0
  );

  // Calculate total workout time
  const totalMinutes = completedWorkouts.reduce((sum, workout) => {
    if (workout.end_time) {
      const start = new Date(workout.start_time);
      const end = new Date(workout.end_time);
      return sum + Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    }
    return sum;
  }, 0);

  // Prepare chart data
  const chartData = workouts
    .filter(w => w.completed)
    .slice(0, 10)
    .reverse()
    .map((workout, index) => {
      const duration = workout.end_time 
        ? Math.round((new Date(workout.end_time).getTime() - new Date(workout.start_time).getTime()) / (1000 * 60))
        : 0;
      
      return {
        name: `אימון ${index + 1}`,
        date: new Date(workout.start_time).toLocaleDateString('he-IL'),
        duration,
        exercises: workout.exercises.filter(e => e.completed).length,
        type: workout.workout_type
      };
    });

  // Workout type distribution
  const workoutTypeData = ['A', 'B', 'C'].map(type => ({
    type: `אימון ${type}`,
    count: completedWorkouts.filter(w => w.workout_type === type).length
  }));

  // Exercise progress data for selected exercise
  const selectedExerciseData = exerciseProgress
    .filter(item => item.exercise_name === selectedExercise)
    .map((item, index) => ({
      name: `אימון ${index + 1}`,
      date: new Date(item.date).toLocaleDateString('he-IL'),
      weight: item.weight,
      workout_type: item.workout_type
    }));

  const stats = [
    { 
      title: "אימונים הושלמו", 
      value: completedWorkouts.length.toString(), 
      subtitle: `מתוך ${totalWorkouts}`, 
      icon: Trophy, 
      gradient: true 
    },
    { 
      title: "זמן כולל", 
      value: Math.round(totalMinutes / 60).toString(), 
      subtitle: "שעות אימון", 
      icon: Clock 
    },
    { 
      title: "תרגילים הושלמו", 
      value: completedExercises.toString(), 
      subtitle: `מתוך ${totalExercises}`, 
      icon: Target 
    },
    { 
      title: "קלוריות נשרפו", 
      value: (completedWorkouts.length * 300).toString(), 
      subtitle: "משוער", 
      icon: Flame, 
      gradient: true 
    },
  ];

  const chartConfig = {
    duration: {
      label: "משך (דקות)",
      color: "hsl(var(--fitness-primary))",
    },
    exercises: {
      label: "תרגילים",
      color: "hsl(var(--fitness-secondary))",
    },
  };

  console.log('Current state:', {
    workouts: workouts.length,
    exerciseProgress: exerciseProgress.length,
    availableExercises: availableExercises.length,
    isLoading
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-fitness-primary/5 via-background to-fitness-secondary/5 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-fitness-primary/20">
              <TrendingUp className="h-6 w-6 text-fitness-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">מעקב ונתונים</h1>
              <p className="text-sm sm:text-base text-muted-foreground">עקוב אחר ההתקדמות שלך</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 ימים</SelectItem>
                <SelectItem value="30">30 ימים</SelectItem>
                <SelectItem value="90">90 ימים</SelectItem>
                <SelectItem value="180">6 חודשים</SelectItem>
                <SelectItem value="365">שנה</SelectItem>
                <SelectItem value="730">שנתיים</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" onClick={() => navigate('/')} className="w-full sm:w-auto">
              <ArrowRight className="w-4 h-4 ml-2" />
              חזרה לבית
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Charts and Data */}
        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="progress" className="text-xs sm:text-sm">התקדמות</TabsTrigger>
            <TabsTrigger value="exercises" className="text-xs sm:text-sm">תרגילים</TabsTrigger>
            <TabsTrigger value="workouts" className="text-xs sm:text-sm">סוגי אימונים</TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm">היסטוריה</TabsTrigger>
          </TabsList>
          
          <TabsContent value="progress" className="space-y-6">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-fitness-primary" />
                  התקדמות אימונים (10 אימונים אחרונים)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 overflow-hidden">
                {chartData.length > 0 ? (
                  <div className="w-full overflow-hidden">
                    <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full">
                      <LineChart 
                        data={chartData} 
                        margin={{ 
                          top: 10, 
                          right: isMobile ? 2 : 15, 
                          left: isMobile ? 2 : 10, 
                          bottom: 10 
                        }}
                        width={isMobile ? undefined : undefined}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          fontSize={isMobile ? 9 : 12}
                          tickLine={false}
                          axisLine={false}
                          interval="preserveStartEnd"
                          textAnchor="middle"
                          height={isMobile ? 30 : 40}
                        />
                        <YAxis 
                          fontSize={isMobile ? 9 : 12}
                          tickLine={false}
                          axisLine={false}
                          width={isMobile ? 20 : 40}
                        />
                        <ChartTooltip 
                          content={<ChartTooltipContent />}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="duration" 
                          stroke="var(--color-duration)" 
                          strokeWidth={2}
                          dot={{ fill: "var(--color-duration)", r: isMobile ? 3 : 4 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="exercises" 
                          stroke="var(--color-exercises)" 
                          strokeWidth={2}
                          dot={{ fill: "var(--color-exercises)", r: isMobile ? 3 : 4 }}
                        />
                      </LineChart>
                    </ChartContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>אין עדיין נתוני אימונים להצגה</p>
                      <p className="text-sm mt-2">התחל אימון כדי לראות את ההתקדמות שלך</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exercises" className="space-y-6">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-fitness-primary" />
                  התקדמות משקלים בתרגילים
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-3 sm:p-6">
                {availableExercises.length > 0 ? (
                  <>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <label className="text-sm font-medium whitespace-nowrap">בחר תרגיל:</label>
                      <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                        <SelectTrigger className="w-full sm:w-64">
                          <SelectValue placeholder="בחר תרגיל" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableExercises.map((exercise) => (
                            <SelectItem key={exercise} value={exercise}>
                              {exercise}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {selectedExerciseData.length > 0 ? (
                      <div className="w-full overflow-hidden" style={{ maxWidth: isMobile ? '280px' : '100%' }}>
                        <ChartContainer config={{
                          weight: {
                            label: "משקל (ק״ג)",
                            color: "hsl(var(--fitness-primary))",
                          }
                        }} className="h-[250px] sm:h-[300px] w-full">
                          <LineChart 
                            data={selectedExerciseData} 
                            margin={{ 
                              top: 10, 
                              right: isMobile ? 5 : 15, 
                              left: isMobile ? 5 : 10, 
                              bottom: isMobile ? 25 : 40 
                            }}
                            width={isMobile ? 280 : undefined}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              fontSize={isMobile ? 8 : 12}
                              tickLine={false}
                              axisLine={false}
                              angle={isMobile ? 0 : -45}
                              textAnchor={isMobile ? "middle" : "end"}
                              height={isMobile ? 25 : 60}
                              interval={isMobile ? "preserveStartEnd" : 0}
                            />
                            <YAxis 
                              fontSize={isMobile ? 8 : 12}
                              tickLine={false}
                              axisLine={false}
                              width={isMobile ? 25 : 40}
                            />
                            <ChartTooltip 
                              content={<ChartTooltipContent />}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="weight" 
                              stroke="var(--color-weight)" 
                              strokeWidth={2}
                              dot={{ fill: "var(--color-weight)", r: isMobile ? 3 : 4 }}
                            />
                          </LineChart>
                        </ChartContainer>
                      </div>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>אין נתוני משקלים עבור התרגיל הנבחר</p>
                          <p className="text-sm mt-2">התחל לתעד משקלים באימונים</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>אין עדיין תרגילים עם נתוני משקלים</p>
                      <p className="text-sm mt-2">התחל אימון ותעד משקלים כדי לראות התקדמות</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workouts" className="space-y-6">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-fitness-primary" />
                  התפלגות סוגי אימונים
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                {workoutTypeData.some(d => d.count > 0) ? (
                  <div className="w-full overflow-hidden" style={{ maxWidth: isMobile ? '280px' : '100%' }}>
                    <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full">
                      <BarChart 
                        data={workoutTypeData} 
                        margin={{ 
                          top: 10, 
                          right: isMobile ? 5 : 15, 
                          left: isMobile ? 5 : 10, 
                          bottom: 10 
                        }}
                        width={isMobile ? 280 : undefined}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="type" 
                          fontSize={isMobile ? 10 : 12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          fontSize={isMobile ? 10 : 12}
                          tickLine={false}
                          axisLine={false}
                          width={isMobile ? 25 : 40}
                        />
                        <ChartTooltip 
                          content={<ChartTooltipContent />}
                        />
                        <Bar 
                          dataKey="count" 
                          fill="var(--color-duration)" 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ChartContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>אין עדיין נתוני אימונים להצגה</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-fitness-primary" />
                  היסטוריית אימונים
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                {workouts.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {workouts.map((workout) => (
                      <div key={workout.id} className="p-3 sm:p-4 border border-border/50 rounded-lg bg-card/30">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                          <h3 className="font-medium text-foreground text-sm sm:text-base">{workout.workout_title}</h3>
                           <div className="flex items-center gap-2">
                             <span className={`px-2 py-1 text-xs rounded-full ${
                               workout.completed 
                                 ? 'bg-green-500/20 text-green-700 dark:text-green-300' 
                                 : 'bg-orange-500/20 text-orange-700 dark:text-orange-300'
                             }`}>
                               {workout.completed ? 'הושלם' : 'לא הושלם'}
                             </span>
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => setDeleteWorkoutId(workout.id)}
                               className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                             >
                               <Trash2 className="h-4 w-4" />
                             </Button>
                           </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">תאריך:</span>
                            <br />
                            {new Date(workout.start_time).toLocaleDateString('he-IL')}
                          </div>
                          <div>
                            <span className="font-medium">שעה:</span>
                            <br />
                            {new Date(workout.start_time).toLocaleTimeString('he-IL', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                          <div>
                            <span className="font-medium">תרגילים:</span>
                            <br />
                            {workout.exercises.filter(e => e.completed).length} / {workout.exercises.length}
                          </div>
                          <div>
                            <span className="font-medium">משך:</span>
                            <br />
                            {workout.end_time 
                              ? `${Math.round((new Date(workout.end_time).getTime() - new Date(workout.start_time).getTime()) / (1000 * 60))} דקות`
                              : 'לא הושלם'
                            }
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>אין עדיין היסטוריית אימונים</p>
                    <p className="text-sm mt-2">התחל אימון כדי לראות את ההיסטוריה שלך</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Workout Confirmation Dialog */}
        <AlertDialog open={!!deleteWorkoutId} onOpenChange={() => setDeleteWorkoutId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>מחיקת נתוני אימון</AlertDialogTitle>
              <AlertDialogDescription>
                האם אתה בטוח שאתה רוצה למחוק את נתוני האימון? 
                <br />
                פעולה זו תמחק את כל הנתונים השמורים עבור האימון הזה ולא ניתן לבטל אותה.
                <br />
                <strong>התרגילים עצמם לא יימחקו - רק הנתונים מהאימון הספציפי הזה.</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ביטול</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteWorkoutId && handleDeleteWorkout(deleteWorkoutId)}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'מוחק...' : 'כן, מחק'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Analytics;
