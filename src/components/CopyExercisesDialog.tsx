import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Target } from "lucide-react";
import { Exercise } from "@/hooks/useSupabaseExercises";
import { useToast } from "@/hooks/use-toast";

interface CopyExercisesDialogProps {
  currentWorkoutType: 'A' | 'B' | 'C';
  getExercisesByWorkout: (workoutType: 'A' | 'B' | 'C') => Exercise[];
  onCopyExercises: (exercises: Omit<Exercise, 'id'>[]) => void;
}

export const CopyExercisesDialog = ({ 
  currentWorkoutType, 
  getExercisesByWorkout, 
  onCopyExercises 
}: CopyExercisesDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const { toast } = useToast();

  const workoutTypes = ['A', 'B', 'C'].filter(type => type !== currentWorkoutType) as ('A' | 'B' | 'C')[];
  
  const workoutNames = {
    'A': 'אימון A: חזה, כתפיים, יד אחורית ובטן',
    'B': 'אימון B: גב, יד קידמית ובטן', 
    'C': 'אימון C: רגליים, זרועות ובטן'
  };

  const toggleExercise = (exerciseId: string) => {
    setSelectedExercises(prev => 
      prev.includes(exerciseId) 
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const handleCopy = () => {
    if (selectedExercises.length === 0) {
      toast({
        title: "לא נבחרו תרגילים",
        description: "אנא בחר לפחות תרגיל אחד להעתקה",
        variant: "destructive"
      });
      return;
    }

    // Get all exercises and filter by selected IDs
    const allExercises = [...getExercisesByWorkout('A'), ...getExercisesByWorkout('B'), ...getExercisesByWorkout('C')];
    const exercisesToCopy = allExercises
      .filter(exercise => selectedExercises.includes(exercise.id))
      .map(exercise => ({
        name: exercise.name,
        targetMuscle: exercise.targetMuscle,
        machineNumber: exercise.machineNumber,
        seatHeight: exercise.seatHeight,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight,
        workoutType: currentWorkoutType
      }));

    onCopyExercises(exercisesToCopy);
    
    toast({
      title: "הועתקו בהצלחה!",
      description: `${exercisesToCopy.length} תרגילים הועתקו לאימון ${currentWorkoutType}`,
    });

    setSelectedExercises([]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 hebrew-text">
          <Copy className="w-4 h-4" />
          העתק תרגילים
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="hebrew-text">העתק תרגילים לאימון {currentWorkoutType}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue={workoutTypes[0]} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            {workoutTypes.map(workoutType => (
              <TabsTrigger key={workoutType} value={workoutType} className="hebrew-text">
                אימון {workoutType}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {workoutTypes.map(workoutType => {
            const exercises = getExercisesByWorkout(workoutType);
            
            return (
              <TabsContent key={workoutType} value={workoutType} className="space-y-4">
                <div className="text-sm text-muted-foreground hebrew-text">
                  {workoutNames[workoutType]}
                </div>
                
                {exercises.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="hebrew-text">אין תרגילים באימון {workoutType}</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {exercises.map(exercise => (
                      <div 
                        key={exercise.id}
                        className="flex items-center space-x-2 p-3 border border-border/50 rounded-lg hover:bg-accent/10 cursor-pointer"
                        onClick={() => toggleExercise(exercise.id)}
                      >
                        <Checkbox
                          checked={selectedExercises.includes(exercise.id)}
                        />
                        <div className="flex-1 hebrew-text">
                          <div className="font-medium">{exercise.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {exercise.targetMuscle}
                            {exercise.sets && exercise.reps && (
                              <span> • {exercise.sets} x {exercise.reps}</span>
                            )}
                            {exercise.weight && <span> • {exercise.weight} ק"ג</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>

        <div className="flex justify-between items-center pt-4">
          <div className="text-sm text-muted-foreground hebrew-text">
            נבחרו {selectedExercises.length} תרגילים
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="hebrew-text">
              ביטול
            </Button>
            <Button onClick={handleCopy} disabled={selectedExercises.length === 0} className="hebrew-text">
              העתק תרגילים ({selectedExercises.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};