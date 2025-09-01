import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Clock, Calendar, Dumbbell } from "lucide-react";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";
import { format } from "date-fns";
import { he } from "date-fns/locale";

const History = () => {
  const { workoutHistory, loading } = useWorkoutHistory();

  const getWorkoutTypeColor = (workoutType: string) => {
    switch (workoutType) {
      case 'A': return 'bg-red-500/20 text-red-700 border-red-500/30';
      case 'B': return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'C': return 'bg-green-500/20 text-green-700 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const formatDuration = (minutes: number | null): string => {
    if (!minutes) return 'לא ידוע';
    if (minutes < 60) return `${minutes} דקות`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}:${remainingMinutes.toString().padStart(2, '0')} שעות`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
            היסטוריית אימונים
          </h1>
          <p className="text-muted-foreground">
            כל האימונים שהשלמת בעבר - {workoutHistory.length} אימונים סה"כ
          </p>
        </div>

        {/* Workout History List */}
        {workoutHistory.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Dumbbell className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold mb-2">אין עדיין היסטוריה</h3>
              <p className="text-muted-foreground">
                השלם את האימון הראשון שלך כדי לראות אותו כאן
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {workoutHistory.map((workout) => (
              <Card key={workout.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {workout.workout_title}
                        <ArrowRight className="w-4 h-4" />
                      </CardTitle>
                      <CardDescription>
                        {format(new Date(workout.start_time), 'EEEE, d MMMM yyyy', { locale: he })}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${getWorkoutTypeColor(workout.workout_type)} border`}
                    >
                      אימון {workout.workout_type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(workout.duration_minutes)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          התחיל ב-{format(new Date(workout.start_time), 'HH:mm', { locale: he })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;