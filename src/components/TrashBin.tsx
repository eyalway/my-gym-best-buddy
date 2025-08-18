import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Undo2, Calendar, Clock } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface DeletedWorkout {
  id: string;
  workout_type: string;
  workout_title: string;
  start_time: string;
  end_time: string | null;
  deleted_at: string;
  completed: boolean;
}

export default function TrashBin() {
  const { user } = useAuth();
  const [deletedWorkouts, setDeletedWorkouts] = useState<DeletedWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [isPermanentlyDeleting, setIsPermanentlyDeleting] = useState<string | null>(null);

  const fetchDeletedWorkouts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('id, workout_type, workout_title, start_time, end_time, deleted_at, completed')
        .eq('user_id', user.id)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) throw error;

      setDeletedWorkouts(data || []);
    } catch (error) {
      console.error('Error fetching deleted workouts:', error);
      toast({
        title: "שגיאה בטעינת הפח",
        description: "לא הצלחנו לטעון את האימונים המחוקים",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedWorkouts();
  }, [user]);

  const handleRestoreWorkout = async (workoutId: string) => {
    setIsRestoring(workoutId);
    try {
      const { error } = await supabase.rpc('restore_workout', {
        workout_id: workoutId
      });

      if (error) throw error;

      // Remove from local state
      setDeletedWorkouts(prev => prev.filter(w => w.id !== workoutId));

      toast({
        title: "האימון שוחזר בהצלחה! ✅",
        description: "האימון חזר לרשימת האימונים שלך",
      });

    } catch (error) {
      console.error('Error restoring workout:', error);
      toast({
        title: "שגיאה בשחזור האימון",
        description: "לא הצלחנו לשחזר את האימון",
        variant: "destructive",
      });
    } finally {
      setIsRestoring(null);
    }
  };

  const handlePermanentDelete = async (workoutId: string) => {
    setIsPermanentlyDeleting(workoutId);
    try {
      // First delete all workout exercises
      const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .delete()
        .eq('workout_id', workoutId);

      if (exercisesError) {
        throw exercisesError;
      }

      // Then permanently delete the workout
      const { error: workoutError } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId)
        .eq('user_id', user?.id);

      if (workoutError) {
        throw workoutError;
      }

      // Remove from local state
      setDeletedWorkouts(prev => prev.filter(w => w.id !== workoutId));

      toast({
        title: "האימון נמחק לצמיתות",
        description: "האימון הוסר לחלוטין מהמערכת",
      });

    } catch (error) {
      console.error('Error permanently deleting workout:', error);
      toast({
        title: "שגיאה במחיקה לצמיתות",
        description: "לא הצלחנו למחוק את האימון לצמיתות",
        variant: "destructive",
      });
    } finally {
      setIsPermanentlyDeleting(null);
    }
  };

  const getWorkoutTypeColor = (type: string) => {
    switch (type) {
      case 'A': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'B': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'C': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">טוען פח...</div>
      </div>
    );
  }

  if (deletedWorkouts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Trash2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">הפח ריק</h3>
          <p className="text-muted-foreground">אין אימונים מחוקים כרגע</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">פח אימונים מחוקים</h2>
        <Badge variant="secondary" className="text-sm">
          {deletedWorkouts.length} אימונים
        </Badge>
      </div>

      <div className="grid gap-4">
        {deletedWorkouts.map((workout) => (
          <Card key={workout.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{workout.workout_title}</CardTitle>
                  <Badge className={getWorkoutTypeColor(workout.workout_type)}>
                    אימון {workout.workout_type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestoreWorkout(workout.id)}
                    disabled={isRestoring === workout.id}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Undo2 className="w-4 h-4 ml-2" />
                    {isRestoring === workout.id ? 'משחזר...' : 'שחזר'}
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isPermanentlyDeleting === workout.id}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 ml-2" />
                        מחק לצמיתות
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>מחיקה לצמיתות</AlertDialogTitle>
                        <AlertDialogDescription>
                          האם אתה בטוח שברצונך למחוק את האימון "{workout.workout_title}" לצמיתות?
                          פעולה זו לא ניתנת לביטול ותמחק את כל נתוני האימון.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>ביטול</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handlePermanentDelete(workout.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          מחק לצמיתות
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(new Date(workout.start_time), 'dd/MM/yyyy', { locale: he })}
                  </span>
                </div>
                {workout.end_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      {Math.round(
                        (new Date(workout.end_time).getTime() - new Date(workout.start_time).getTime()) / (1000 * 60)
                      )} דקות
                    </span>
                  </div>
                )}
                <div className="col-span-2 text-xs">
                  נמחק ב-{format(new Date(workout.deleted_at), 'dd/MM/yyyy HH:mm', { locale: he })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}