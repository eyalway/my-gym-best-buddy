import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatsCard } from '@/components/StatsCard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
  Activity
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
  const [workouts, setWorkouts] = useState<WorkoutData[]>([]);
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>([]);
  const [availableExercises, setAvailableExercises] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  useEffect(() => {
    if (user) {
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

      if (error) {
        console.error('Error fetching workouts:', error);
        return;
      }

      const transformedData = (workoutsData || []).map(workout => ({
        ...workout,
        exercises: workout.workout_exercises || []
      }));

      setWorkouts(transformedData);
    } catch (error) {
      console.error('Error fetching workout data:', error);
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
        .not('weight', 'is', null)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching exercise progress:', error);
        return;
      }

      if (exerciseData) {
        // Get unique exercise names
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
      }
    } catch (error) {
      console.error('Error fetching exercise progress:', error);
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
              </SelectContent>
            </Select>
            <Button variant="ghost" onClick={() => navigate('/')} className="w-full sm:w-auto">
              <ArrowRight className="w-4 h-4 ml-2" />
              חזרה לבית
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
              <CardContent className="p-3 sm:p-6">
                {chartData.length > 0 ? (
                  <>
                    {/* Mobile - simple text data */}
                    <div className="block sm:hidden">
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium mb-3">אימונים אחרונים:</h4>
                        {chartData.slice(0, 5).map((workout, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded text-sm">
                            <span className="font-medium">{workout.name}</span>
                            <div className="flex gap-4 text-muted-foreground text-xs">
                              <span>{workout.duration} דק׳</span>
                              <span>{workout.exercises} תרגילים</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Desktop - full chart */}
                    <div className="hidden sm:block">
                      <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart 
                            data={chartData} 
                            margin={{ top: 10, right: 15, left: 10, bottom: 10 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="name" 
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                              interval="preserveStartEnd"
                              textAnchor="middle"
                              height={40}
                            />
                            <YAxis 
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                              width={40}
                            />
                            <ChartTooltip 
                              content={<ChartTooltipContent />}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="duration" 
                              stroke="var(--color-duration)" 
                              strokeWidth={2}
                              dot={{ fill: "var(--color-duration)", r: 4 }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="exercises" 
                              stroke="var(--color-exercises)" 
                              strokeWidth={2}
                              dot={{ fill: "var(--color-exercises)", r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </>
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
                      <>
                        {/* Mobile - simple data */}
                        <div className="block sm:hidden">
                          <h4 className="text-sm font-medium mb-3">התקדמות ב{selectedExercise}:</h4>
                          <div className="space-y-2">
                            {selectedExerciseData.slice(-5).map((data, index) => (
                              <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded text-sm">
                                <span className="font-medium">{data.date}</span>
                                <span className="text-fitness-primary font-bold">{data.weight} ק״ג</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Desktop - full chart */}
                        <div className="hidden sm:block">
                          <ChartContainer config={{
                            weight: {
                              label: "משקל (ק״ג)",
                              color: "hsl(var(--fitness-primary))",
                            }
                          }} className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart 
                                data={selectedExerciseData} 
                                margin={{ top: 10, right: 15, left: 10, bottom: 40 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                  dataKey="date" 
                                  fontSize={12}
                                  tickLine={false}
                                  axisLine={false}
                                  angle={-45}
                                  textAnchor="end"
                                  height={60}
                                />
                                <YAxis 
                                  fontSize={12}
                                  tickLine={false}
                                  axisLine={false}
                                  width={40}
                                  label={{ value: 'משקל (ק״ג)', angle: -90, position: 'insideLeft' }}
                                />
                                <ChartTooltip 
                                  content={({ active, payload, label }) => {
                                    if (active && payload && payload.length > 0) {
                                      return (
                                        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                                          <p className="font-medium">{`תאריך: ${label}`}</p>
                                          <p className="text-fitness-primary">
                                            {`משקל: ${payload[0].value} ק״ג`}
                                          </p>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="weight" 
                                  stroke="hsl(var(--fitness-primary))" 
                                  strokeWidth={3}
                                  dot={{ fill: "hsl(var(--fitness-primary))", strokeWidth: 2, r: 6 }}
                                  activeDot={{ r: 8 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </div>
                      </>
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
                  <>
                    {/* Mobile - simple data */}
                    <div className="block sm:hidden">
                      <h4 className="text-sm font-medium mb-3">סוגי אימונים:</h4>
                      <div className="space-y-2">
                        {workoutTypeData.map((data, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded text-sm">
                            <span className="font-medium">{data.type}</span>
                            <span className="text-fitness-primary font-bold">{data.count} אימונים</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Desktop - full chart */}
                    <div className="hidden sm:block">
                      <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart 
                            data={workoutTypeData} 
                            margin={{ top: 10, right: 15, left: 10, bottom: 10 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="type" 
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis 
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                              width={40}
                            />
                            <ChartTooltip 
                              content={<ChartTooltipContent />}
                            />
                            <Bar 
                              dataKey="count" 
                              fill="hsl(var(--fitness-primary))"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </>
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
      </div>
    </div>
  );
};

export default Analytics;