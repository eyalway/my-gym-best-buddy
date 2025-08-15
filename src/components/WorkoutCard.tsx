import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Flame, Target } from "lucide-react";

interface WorkoutCardProps {
  title: string;
  duration: string;
  calories: string;
  exercises: number;
  difficulty: "קל" | "בינוני" | "קשה";
  onStart: () => void;
}

export const WorkoutCard = ({ 
  title, 
  duration, 
  calories, 
  exercises, 
  difficulty, 
  onStart 
}: WorkoutCardProps) => {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "קל": return "text-fitness-success";
      case "בינוני": return "text-fitness-warning";
      case "קשה": return "text-fitness-primary";
      default: return "text-foreground";
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-foreground hebrew-text">{title}</CardTitle>
        <div className={`text-sm font-medium hebrew-text ${getDifficultyColor(difficulty)}`}>
          {difficulty}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span className="hebrew-text">{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4" />
            <span className="hebrew-text">{calories}</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            <span className="hebrew-text">{exercises} תרגילים</span>
          </div>
        </div>
        <Button 
          variant="default" 
          className="w-full hebrew-text"
          onClick={() => {
            console.log('Workout button clicked:', title);
            onStart();
          }}
        >
          התחל אימון
        </Button>
      </CardContent>
    </Card>
  );
};