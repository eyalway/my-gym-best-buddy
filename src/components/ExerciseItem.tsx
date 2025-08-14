
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ChevronUp, ChevronDown } from "lucide-react";

interface ExerciseItemProps {
  id: string;
  name: string;
  targetMuscle: string;
  machineNumber?: string;
  seatHeight?: string;
  sets?: string;
  reps?: string;
  weight?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onReorder?: (id: string, direction: 'up' | 'down', workoutType: 'A' | 'B' | 'C') => void;
  showActions?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  exerciseNumber?: number;
}

export const ExerciseItem = ({ 
  id,
  name, 
  targetMuscle, 
  machineNumber,
  seatHeight,
  sets, 
  reps, 
  weight,
  onEdit,
  onDelete,
  onReorder,
  showActions = false,
  isFirst = false,
  isLast = false,
  workoutType,
  exerciseNumber
}: ExerciseItemProps & { workoutType: 'A' | 'B' | 'C' }) => {
  return (
    <Card className="bg-card/30 backdrop-blur-sm border-border/30 hover:bg-card/50 transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {exerciseNumber && (
              <div className="flex-shrink-0 w-8 h-8 bg-fitness-primary/20 text-fitness-primary rounded-full flex items-center justify-center font-bold text-sm">
                {exerciseNumber}
              </div>
            )}
            <div className="flex-1">
              <h4 className="font-medium text-foreground">{name}</h4>
              <Badge variant="secondary" className="mt-1 text-xs">
                {targetMuscle}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {(machineNumber || seatHeight || sets || reps || weight) && (
              <div className="text-right text-sm text-muted-foreground space-y-1">
                <div className="flex gap-4">
                  {machineNumber && <span>מכשיר: {machineNumber}</span>}
                  {seatHeight && <span>כיסא: {seatHeight}</span>}
                </div>
                <div className="flex gap-4">
                  {sets && <span>{sets} סטים</span>}
                  {reps && <span>{reps} חזרות</span>}
                  {weight && <span>{weight} ק"ג</span>}
                </div>
              </div>
            )}
            {showActions && (
              <div className="flex gap-1">
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReorder?.(id, 'up', workoutType)}
                    disabled={isFirst}
                    className="h-6 w-6 p-0 hover:bg-fitness-accent/20 hover:text-fitness-accent disabled:opacity-30"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReorder?.(id, 'down', workoutType)}
                    disabled={isLast}
                    className="h-6 w-6 p-0 hover:bg-fitness-accent/20 hover:text-fitness-accent disabled:opacity-30"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit?.(id)}
                  className="h-8 w-8 p-0 hover:bg-fitness-accent/20 hover:text-fitness-accent"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete?.(id)}
                  className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
