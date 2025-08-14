import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface ExerciseItemProps {
  id: string;
  name: string;
  targetMuscle: string;
  sets?: string;
  reps?: string;
  weight?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export const ExerciseItem = ({ 
  id,
  name, 
  targetMuscle, 
  sets, 
  reps, 
  weight,
  onEdit,
  onDelete,
  showActions = false
}: ExerciseItemProps) => {
  return (
    <Card className="bg-card/30 backdrop-blur-sm border-border/30 hover:bg-card/50 transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-foreground">{name}</h4>
            <Badge variant="secondary" className="mt-1 text-xs">
              {targetMuscle}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            {(sets || reps || weight) && (
              <div className="text-right text-sm text-muted-foreground">
                {sets && <div>{sets} סטים</div>}
                {reps && <div>{reps} חזרות</div>}
                {weight && <div>{weight} ק"ג</div>}
              </div>
            )}
            {showActions && (
              <div className="flex gap-1">
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