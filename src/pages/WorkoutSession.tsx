import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useExercises } from "@/hooks/useExercises";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, ArrowLeft, CheckCircle, Home } from "lucide-react";

const WorkoutSession = () => {
  const { workoutType } = useParams<{ workoutType: 'A' | 'B' | 'C' }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getExercisesByWorkout } = useExercises();
  
  console.log('WorkoutSession loaded with workoutType:', workoutType);
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());

  const exercises = workoutType ? getExercisesByWorkout(workoutType) : [];
  const currentExercise = exercises[currentExerciseIndex];
  const progress = exercises.length > 0 ? ((currentExerciseIndex + 1) / exercises.length) * 100 : 0;

  console.log('Exercises found:', exercises.length);

  useEffect(() => {
    console.log('useEffect - workoutType:', workoutType, 'exercises.length:', exercises.length);
    if (!workoutType || exercises.length === 0) {
      console.log('Redirecting back to home - no workoutType or no exercises');
      navigate('/');
      return;
    }
  }, [workoutType, exercises.length, navigate]);

  const handleNextExercise = () => {
    setCompletedExercises(prev => new Set([...prev, currentExerciseIndex]));
    
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      toast({
        title: "תרגיל הושלם! 💪",
        description: `עוברים לתרגיל הבא`,
      });
    } else {
      // Workout completed
      toast({
        title: "כל הכבוד! 🎉",
        description: "סיימת את האימון בהצלחה!",
      });
      navigate('/');
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
      setCompletedExercises(prev => {
        const newSet = new Set(prev);
        newSet.delete(currentExerciseIndex - 1);
        return newSet;
      });
    }
  };

  const handleEndWorkout = () => {
    navigate('/');
    toast({
      title: "האימון הופסק",
      description: "תמיד אפשר לחזור ולהמשיך!",
    });
  };

  if (!currentExercise) {
    return null;
  }

  const workoutTitles = {
    A: "אימון A: חזה, כתפיים, יד אחורית ובטן",
    B: "אימון B: גב, יד קידמית ובטן", 
    C: "אימון C: רגליים, זרועות ובטן"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fitness-primary/5 via-background to-fitness-secondary/5 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={handleEndWorkout}>
              <Home className="w-4 h-4 ml-2" />
              חזרה לבית
            </Button>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              תרגיל {currentExerciseIndex + 1} מתוך {exercises.length}
            </Badge>
          </div>
          
          <h1 className="text-2xl font-bold text-foreground">
            {workoutTitles[workoutType!]}
          </h1>
          
          <Progress value={progress} className="w-full h-3" />
        </div>

        {/* Current Exercise Card */}
        <Card className="bg-card/80 backdrop-blur-sm border-2 border-fitness-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-fitness-primary mb-2">
              {currentExercise.name}
            </CardTitle>
            <div className="flex justify-center items-center gap-4 text-lg">
              <Badge variant="outline" className="px-4 py-2">
                {currentExercise.sets} סטים
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                {currentExercise.reps} חזרות
              </Badge>
              {currentExercise.weight && (
                <Badge variant="outline" className="px-4 py-2">
                  {currentExercise.weight} ק״ג
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                onClick={handlePreviousExercise}
                disabled={currentExerciseIndex === 0}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 ml-2" />
                תרגיל קודם
              </Button>
              
              <Button
                onClick={handleNextExercise}
                className="flex-1 bg-fitness-primary hover:bg-fitness-primary/90"
              >
                {currentExerciseIndex === exercises.length - 1 ? (
                  <>
                    <CheckCircle className="w-4 h-4 ml-2" />
                    סיים אימון
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 ml-2" />
                    תרגיל הבא
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Exercise List Preview */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">כל התרגילים באימון</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {exercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                    index === currentExerciseIndex
                      ? 'bg-fitness-primary/20 border-2 border-fitness-primary/50'
                      : completedExercises.has(index)
                      ? 'bg-fitness-success/20 border border-fitness-success/30'
                      : 'bg-muted/30 border border-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === currentExerciseIndex
                        ? 'bg-fitness-primary text-white'
                        : completedExercises.has(index)
                        ? 'bg-fitness-success text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {completedExercises.has(index) ? '✓' : index + 1}
                    </div>
                    <span className={`font-medium ${
                      index === currentExerciseIndex ? 'text-fitness-primary' : 'text-foreground'
                    }`}>
                      {exercise.name}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {exercise.sets}×{exercise.reps}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkoutSession;