import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Exercise } from "@/hooks/useExercises";

interface EditExerciseDialogProps {
  exercise: Exercise | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateExercise: (id: string, exercise: Omit<Exercise, 'id'>) => void;
}

const muscleGroupsByWorkout = {
  'A': ['חזה', 'כתפיים', 'יד אחורית', 'בטן'],
  'B': ['גב', 'יד קידמית', 'בטן'],
  'C': ['רגליים', 'יד קידמית', 'יד אחורית', 'בטן']
};

export const EditExerciseDialog = ({ 
  exercise, 
  open, 
  onOpenChange, 
  onUpdateExercise 
}: EditExerciseDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    targetMuscle: '',
    sets: '',
    reps: '',
    weight: '',
    workoutType: 'A' as 'A' | 'B' | 'C'
  });

  useEffect(() => {
    if (exercise) {
      setFormData({
        name: exercise.name,
        targetMuscle: exercise.targetMuscle,
        sets: exercise.sets || '',
        reps: exercise.reps || '',
        weight: exercise.weight || '',
        workoutType: exercise.workoutType
      });
    }
  }, [exercise]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exercise || !formData.name || !formData.targetMuscle) return;

    onUpdateExercise(exercise.id, {
      name: formData.name,
      targetMuscle: formData.targetMuscle,
      sets: formData.sets,
      reps: formData.reps,
      weight: formData.weight,
      workoutType: formData.workoutType
    });

    onOpenChange(false);
  };

  if (!exercise) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ערוך תרגיל</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">שם התרגיל</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="workoutType">סוג אימון</Label>
            <Select 
              value={formData.workoutType} 
              onValueChange={(value: 'A' | 'B' | 'C') => setFormData(prev => ({ ...prev, workoutType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">אימון A - חזה, כתפיים, יד אחורית ובטן</SelectItem>
                <SelectItem value="B">אימון B - גב, יד קידמית ובטן</SelectItem>
                <SelectItem value="C">אימון C - רגליים, זרועות ובטן</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="muscle">קבוצת שרירים</Label>
            <Select 
              value={formData.targetMuscle} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, targetMuscle: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {muscleGroupsByWorkout[formData.workoutType].map(muscle => (
                  <SelectItem key={muscle} value={muscle}>{muscle}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="sets">סטים</Label>
              <Input
                id="sets"
                value={formData.sets}
                onChange={(e) => setFormData(prev => ({ ...prev, sets: e.target.value }))}
                placeholder="4"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reps">חזרות</Label>
              <Input
                id="reps"
                value={formData.reps}
                onChange={(e) => setFormData(prev => ({ ...prev, reps: e.target.value }))}
                placeholder="8-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weight">משקל (ק"ג)</Label>
              <Input
                id="weight"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                placeholder="70"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ביטול
            </Button>
            <Button type="submit" variant="workout">
              שמור שינויים
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};