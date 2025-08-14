import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Exercise } from "@/hooks/useExercises";

interface AddExerciseDialogProps {
  workoutType: 'A' | 'B' | 'C';
  onAddExercise: (exercise: Omit<Exercise, 'id'>) => void;
}

const muscleGroupsByWorkout = {
  'A': ['חזה', 'כתפיים', 'יד אחורית', 'בטן'],
  'B': ['גב', 'יד קידמית', 'בטן'],
  'C': ['רגליים', 'יד קידמית', 'יד אחורית', 'בטן']
};

export const AddExerciseDialog = ({ workoutType, onAddExercise }: AddExerciseDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    targetMuscle: '',
    sets: '',
    reps: '',
    weight: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.targetMuscle) return;

    onAddExercise({
      ...formData,
      workoutType
    });

    // Reset form
    setFormData({
      name: '',
      targetMuscle: '',
      sets: '',
      reps: '',
      weight: ''
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          הוסף תרגיל
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>הוסף תרגיל חדש לאימון {workoutType}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">שם התרגיל</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="לדוגמה: Bench Press"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="muscle">קבוצת שרירים</Label>
            <Select 
              value={formData.targetMuscle} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, targetMuscle: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר קבוצת שרירים" />
              </SelectTrigger>
              <SelectContent>
                {muscleGroupsByWorkout[workoutType].map(muscle => (
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              ביטול
            </Button>
            <Button type="submit" variant="workout">
              הוסף תרגיל
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};