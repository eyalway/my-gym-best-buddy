import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ExerciseItemProps {
  name: string;
  targetMuscle: string;
  sets?: string;
  reps?: string;
  weight?: string;
}

export const ExerciseItem = ({ 
  name, 
  targetMuscle, 
  sets, 
  reps, 
  weight 
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
          {(sets || reps || weight) && (
            <div className="text-right text-sm text-muted-foreground">
              {sets && <div>{sets} סטים</div>}
              {reps && <div>{reps} חזרות</div>}
              {weight && <div>{weight} ק"ג</div>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};