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

const Analytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<WorkoutData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  useEffect(() => {
    if (user) {
      fetchWorkoutData();
    }
  }, [user, selectedPeriod]);

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
    <div className="min-h-screen bg-gradient-to-br from-fitness-primary/5 via-background to-fitness-secondary/5 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-fitness-primary/20">
              <TrendingUp className="h-6 w-6 text-fitness-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">מעקב ונתונים</h1>
              <p className="text-muted-foreground">עקוב אחר ההתקדמות שלך</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 ימים</SelectItem>
                <SelectItem value="30">30 ימים</SelectItem>
                <SelectItem value="90">90 ימים</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowRight className="w-4 h-4 ml-2" />
              חזרה לבית
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Charts and Data */}
        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="progress">התקדמות</TabsTrigger>
            <TabsTrigger value="workouts">סוגי אימונים</TabsTrigger>
            <TabsTrigger value="history">היסטוריה</TabsTrigger>
          </TabsList>
          
          <TabsContent value="progress" className="space-y-6">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-fitness-primary" />
                  התקדמות אימונים (10 אימונים אחרונים)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <ChartTooltip 
                          content={<ChartTooltipContent />}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="duration" 
                          stroke="var(--color-duration)" 
                          strokeWidth={2}
                          dot={{ fill: "var(--color-duration)" }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="exercises" 
                          stroke="var(--color-exercises)" 
                          strokeWidth={2}
                          dot={{ fill: "var(--color-exercises)" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
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

          <TabsContent value="workouts" className="space-y-6">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-fitness-primary" />
                  התפלגות סוגי אימונים
                </CardTitle>
              </CardHeader>
              <CardContent>
                {workoutTypeData.some(d => d.count > 0) ? (
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={workoutTypeData}>
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
              <CardContent>
                {workouts.length > 0 ? (
                  <div className="space-y-4">
                    {workouts.map((workout) => (
                      <div key={workout.id} className="p-4 border border-border/50 rounded-lg bg-card/30">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-foreground">{workout.workout_title}</h3>
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
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
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