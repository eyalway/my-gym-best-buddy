import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Copy, Check } from "lucide-react";
import { Exercise } from "@/hooks/useSupabaseExercises";

interface CopyExercisesDialogProps {
  currentWorkoutType: 'A' | 'B' | 'C';
  getExercisesByWorkout: (workoutType: 'A' | 'B' | 'C') => Exercise[];
  onCopyExercises: (exercises: Omit<Exercise, 'id'>[]) => Promise<void>;
}

export const CopyExercisesDialog = ({ 
  currentWorkoutType, 
  getExercisesByWorkout, 
  onCopyExercises 
}: CopyExercisesDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'A' | 'B' | 'C'>(
    currentWorkoutType === 'A' ? 'B' : 'A'
  );
  const [isLoading, setIsLoading] = useState(false);

  const workoutTabs = [
    { value: 'A', label: 'אימון A', disabled: currentWorkoutType === 'A' },
    { value: 'B', label: 'אימון B', disabled: currentWorkoutType === 'B' },
    { value: 'C', label: 'אימון C', disabled: currentWorkoutType === 'C' },
  ];

  const handleExerciseToggle = (exerciseId: string) => {
    setSelectedExercises(prev => 
      prev.includes(exerciseId) 
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const handleCopySelected = async () => {
    if (selectedExercises.length === 0) return;

    setIsLoading(true);
    try {
      const exercisesToCopy = getExercisesByWorkout(activeTab)
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

      await onCopyExercises(exercisesToCopy);
      setSelectedExercises([]);
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const availableTabs = workoutTabs.filter(tab => !tab.disabled);
  const currentTabExercises = getExercisesByWorkout(activeTab);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Copy className="w-4 h-4" />
          העתק תרגילים
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-right">
            העתק תרגילים לאימון {currentWorkoutType}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-full">
          <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value as 'A' | 'B' | 'C');
            setSelectedExercises([]);
          }}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              {availableTabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {availableTabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="flex-1 overflow-hidden">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground text-right">
                      בחר תרגילים מ{tab.label} להעתקה:
                    </p>
                    <Badge variant="secondary">
                      {selectedExercises.length} נבחרו
                    </Badge>
                  </div>
                  
                  <div className="border rounded-lg max-h-96 overflow-y-auto">
                    {currentTabExercises.length === 0 ? (
                      <div className="p-6 text-center text-muted-foreground">
                        אין תרגילים ב{tab.label}
                      </div>
                    ) : (
                      <div className="space-y-2 p-4">
                        {currentTabExercises.map((exercise) => (
                          <div 
                            key={exercise.id}
                            className="flex items-center space-x-2 space-x-reverse p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <Checkbox
                              id={exercise.id}
                              checked={selectedExercises.includes(exercise.id)}
                              onCheckedChange={() => handleExerciseToggle(exercise.id)}
                            />
                            <div className="flex-1 text-right">
                              <div className="font-medium">{exercise.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {exercise.targetMuscle}
                                {exercise.machineNumber && ` • מכונה ${exercise.machineNumber}`}
                                {exercise.sets && exercise.reps && ` • ${exercise.sets}×${exercise.reps}`}
                                {exercise.weight && ` • ${exercise.weight} ק״ג`}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              ביטול
            </Button>
            <Button 
              onClick={handleCopySelected} 
              disabled={selectedExercises.length === 0 || isLoading}
              className="gap-2"
            >
              {isLoading ? (
                "מעתיק..."
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  העתק {selectedExercises.length} תרגילים
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};