import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WorkoutCard } from "@/components/WorkoutCard";
import { StatsCard } from "@/components/StatsCard";
import { ExerciseItem } from "@/components/ExerciseItem";
import { AddExerciseDialog } from "@/components/AddExerciseDialog";
import { EditExerciseDialog } from "@/components/EditExerciseDialog";
import { useExercises, Exercise } from "@/hooks/useExercises";
import { useToast } from "@/hooks/use-toast";
import { 
  Dumbbell, 
  Flame, 
  Clock, 
  Target, 
  TrendingUp, 
  Calendar,
  Play,
  Trophy,
  Settings
} from "lucide-react";
import fitnessHero from "@/assets/fitness-hero.jpg";

const Index = () => {
  const { toast } = useToast();
  const [currentWorkout, setCurrentWorkout] = useState<string | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<"A" | "B" | "C">("A");
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [isManagingExercises, setIsManagingExercises] = useState(false);

  // Use the exercises hook
  const { 
    addExercise, 
    updateExercise, 
    deleteExercise, 
    getExercisesByWorkout,
    reorderExercise 
  } = useExercises();

  const todayStats = [
    { title: "קלוריות נשרפו", value: "245", subtitle: "היום", icon: Flame, gradient: true },
    { title: "זמן אימון", value: "42", subtitle: "דקות", icon: Clock },
    { title: "אימונים השבוע", value: "3", subtitle: "מתוך 5", icon: Calendar },
    { title: "שיא אישי", value: "85", subtitle: "ק״ג בסקוואט", icon: Trophy, gradient: true },
  ];

  const workoutPlans = [
    {
      title: "אימון A: חזה, כתפיים, יד אחורית ובטן",
      duration: "60 דקות",
      calories: "350 קלוריות",
      exercises: getExercisesByWorkout('A').length,
      difficulty: "בינוני" as const,
      muscleGroups: ["חזה", "כתפיים", "יד אחורית", "בטן"]
    },
    {
      title: "אימון B: גב, יד קידמית ובטן",
      duration: "55 דקות", 
      calories: "320 קלוריות",
      exercises: getExercisesByWorkout('B').length,
      difficulty: "בינוני" as const,
      muscleGroups: ["גב", "יד קידמית", "בטן"]
    },
    {
      title: "אימון C: רגליים, זרועות ובטן",
      duration: "70 דקות",
      calories: "450 קלוריות", 
      exercises: getExercisesByWorkout('C').length,
      difficulty: "קשה" as const,
      muscleGroups: ["רגליים", "יד קידמית", "יד אחורית", "בטן"]
    },
  ];

  const handleStartWorkout = (workoutTitle: string) => {
    setCurrentWorkout(workoutTitle);
    toast({
      title: "אימון התחיל! 💪",
      description: `התחלת: ${workoutTitle}`,
    });
    console.log("Starting workout:", workoutTitle);
  };

  const handleEditExercise = (id: string) => {
    const exercise = getExercisesByWorkout(selectedWorkout).find(ex => ex.id === id);
    if (exercise) {
      setEditingExercise(exercise);
    }
  };

  const handleDeleteExercise = (id: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את התרגיל הזה?')) {
      deleteExercise(id);
    }
  };

  const currentExercises = getExercisesByWorkout(selectedWorkout);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div 
        className="relative h-64 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${fitnessHero})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/90" />
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-fitness-primary to-fitness-secondary bg-clip-text text-transparent">
            אימון היום שלך
          </h1>
          <p className="text-lg text-muted-foreground mb-6 max-w-md">
            בואו נבנה את הכוח והסיבולת שלך יחד
          </p>
          <Button variant="hero" size="lg" className="gap-2">
            <Play className="w-5 h-5" />
            התחל אימון מהיר
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Today's Stats */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-fitness-primary" />
            הסטטיסטיקות שלך היום
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {todayStats.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>
        </section>

        {/* Workout Plans */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-fitness-primary" />
            תוכניות אימון מומלצות
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workoutPlans.map((workout, index) => (
              <WorkoutCard 
                key={index} 
                {...workout}
                onStart={() => handleStartWorkout(workout.title)}
              />
            ))}
          </div>
        </section>

        {/* Exercise Management Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Target className="w-6 h-6 text-fitness-primary" />
              ניהול תרגילי אימון {selectedWorkout}
            </h2>
            <div className="flex items-center gap-3">
              <Button
                variant={isManagingExercises ? "default" : "outline"}
                onClick={() => setIsManagingExercises(!isManagingExercises)}
                size="sm"
                className="gap-2"
              >
                <Settings className="w-4 h-4" />
                {isManagingExercises ? "סיום עריכה" : "נהל תרגילים"}
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant={selectedWorkout === "A" ? "default" : "outline"} 
                  onClick={() => setSelectedWorkout("A")}
                  size="sm"
                >
                  אימון A
                </Button>
                <Button 
                  variant={selectedWorkout === "B" ? "default" : "outline"} 
                  onClick={() => setSelectedWorkout("B")}
                  size="sm"
                >
                  אימון B
                </Button>
                <Button 
                  variant={selectedWorkout === "C" ? "default" : "outline"} 
                  onClick={() => setSelectedWorkout("C")}
                  size="sm"
                >
                  אימון C
                </Button>
              </div>
            </div>
          </div>

          {isManagingExercises && (
            <div className="mb-4">
              <AddExerciseDialog 
                workoutType={selectedWorkout}
                onAddExercise={addExercise}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentExercises.map((exercise, index) => (
              <ExerciseItem 
                key={exercise.id}
                id={exercise.id}
                name={exercise.name}
                targetMuscle={exercise.targetMuscle}
                machineNumber={exercise.machineNumber}
                seatHeight={exercise.seatHeight}
                sets={exercise.sets}
                reps={exercise.reps}
                weight={exercise.weight}
                workoutType={selectedWorkout}
                showActions={isManagingExercises}
                onEdit={handleEditExercise}
                onDelete={handleDeleteExercise}
                onReorder={reorderExercise}
                isFirst={index === 0}
                isLast={index === currentExercises.length - 1}
                exerciseNumber={index + 1}
              />
            ))}
          </div>

          {currentExercises.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>אין עדיין תרגילים לאימון זה</p>
              {isManagingExercises && (
                <p className="text-sm mt-2">לחץ "הוסף תרגיל" כדי להתחיל</p>
              )}
            </div>
          )}
        </section>

        {/* Edit Exercise Dialog */}
        <EditExerciseDialog
          exercise={editingExercise}
          open={!!editingExercise}
          onOpenChange={(open) => !open && setEditingExercise(null)}
          onUpdateExercise={updateExercise}
        />

        {/* Quick Actions */}
        <section className="bg-gradient-to-r from-card/30 to-card/50 backdrop-blur-sm rounded-lg p-6 border border-border/30">
          <h3 className="text-xl font-bold mb-4">פעולות מהירות</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="gap-2">
              <Clock className="w-4 h-4" />
              טיימר אימון
            </Button>
            <Button variant="outline" className="gap-2">
              <Target className="w-4 h-4" />
              מעקב משקלים
            </Button>
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              תכנון שבועי
            </Button>
            <Button variant="outline" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              דוח התקדמות
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
