import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { WorkoutCard } from "@/components/WorkoutCard";
import { StatsCard } from "@/components/StatsCard";
import { ExerciseItem } from "@/components/ExerciseItem";
import { AddExerciseDialog } from "@/components/AddExerciseDialog";
import { EditExerciseDialog } from "@/components/EditExerciseDialog";
import { UserButton } from "@/components/UserButton";
import { useSupabaseExercises, Exercise } from "@/hooks/useSupabaseExercises";
import { useWorkoutStats } from "@/hooks/useWorkoutStats";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  Dumbbell, 
  Flame, 
  Clock, 
  Target, 
  TrendingUp, 
  Calendar,
  Play,
  Trophy,
  Settings,
  Sparkles
} from "lucide-react";
import fitnessHero from "@/assets/fitness-hero.jpg";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { stats, loading: statsLoading } = useWorkoutStats();

  // Force RTL on mobile with JavaScript + VISIBLE DEBUG
  useEffect(() => {
    const isMobile = window.innerWidth <= 1024;
    
    // Show debug info on screen
    const debugInfo = `
      Width: ${window.innerWidth}px
      Height: ${window.innerHeight}px
      Mobile detected: ${isMobile}
      User agent: ${navigator.userAgent.substring(0, 50)}...
    `;
    
    // Create debug overlay
    const debugDiv = document.createElement('div');
    debugDiv.innerHTML = `
      <div style="
        position: fixed; 
        top: 10px; 
        right: 10px; 
        background: red; 
        color: white; 
        padding: 10px; 
        z-index: 9999; 
        font-size: 12px;
        border-radius: 5px;
        max-width: 250px;
      ">
        <strong>DEBUG INFO:</strong><br>
        ${debugInfo.replace(/\n/g, '<br>')}
      </div>
    `;
    document.body.appendChild(debugDiv);
    
    // Remove debug after 5 seconds
    setTimeout(() => {
      document.body.removeChild(debugDiv);
    }, 5000);
    
    if (isMobile) {
      // Force RTL on document
      document.documentElement.dir = 'rtl';
      document.body.dir = 'rtl';
      document.documentElement.style.direction = 'rtl';
      document.body.style.direction = 'rtl';
      
      // Add mobile RTL class
      document.body.classList.add('mobile-rtl-forced');
      
      // Force all flex containers to be RTL
      const flexElements = document.querySelectorAll('.flex');
      flexElements.forEach(el => {
        (el as HTMLElement).style.flexDirection = 'row-reverse';
        (el as HTMLElement).style.direction = 'rtl';
      });
      
      // Show visual indicator that JS ran
      document.body.style.border = '3px solid red';
      setTimeout(() => {
        document.body.style.border = '';
      }, 3000);
    }
  }, []);

  const [currentWorkout, setCurrentWorkout] = useState<string | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<"A" | "B" | "C">("A");
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [isManagingExercises, setIsManagingExercises] = useState(false);

  // Default exercises to add for new users
  const DEFAULT_EXERCISES = [
    // Workout A - חזה, כתפיים, יד אחורית ובטן
    { name: 'פרפרית בישיבה', targetMuscle: 'חזה', machineNumber: '1', seatHeight: '5', sets: '4', reps: '8-12', weight: '70', workoutType: 'A' as const },
    { name: 'לחיצת חזה במכונה', targetMuscle: 'חזה', machineNumber: '2', seatHeight: '4', sets: '3', reps: '10-12', weight: '60', workoutType: 'A' as const },
    { name: 'לחיצת חזה משופע', targetMuscle: 'חזה', machineNumber: '3', seatHeight: '6', sets: '4', reps: '8-10', weight: '45', workoutType: 'A' as const },
    { name: 'לחיצת כתפיים במכונה', targetMuscle: 'כתפיים', machineNumber: '4', seatHeight: '5', sets: '4', reps: '10-12', weight: '40', workoutType: 'A' as const },
    { name: 'הרמת כתפיים צדדית', targetMuscle: 'כתפיים', machineNumber: '5', seatHeight: '4', sets: '3', reps: '12-15', weight: '12', workoutType: 'A' as const },
    { name: 'הרמת כתפיים אחורית', targetMuscle: 'כתפיים', machineNumber: '6', seatHeight: '4', sets: '3', reps: '12-15', weight: '10', workoutType: 'A' as const },
    { name: 'דחיפת טריצפס במכונה', targetMuscle: 'יד אחורית', machineNumber: '7', seatHeight: '5', sets: '4', reps: '10-12', weight: '35', workoutType: 'A' as const },
    { name: 'הרחקת זרועות עליונה', targetMuscle: 'יד אחורית', machineNumber: '8', seatHeight: '4', sets: '3', reps: '10-12', weight: '25', workoutType: 'A' as const },
    { name: 'דיפס על מכונה', targetMuscle: 'יד אחורית', machineNumber: '9', seatHeight: '5', sets: '3', reps: '8-12', weight: '20', workoutType: 'A' as const },
    { name: 'קראנץ\'ים על מכונה', targetMuscle: 'בטן', machineNumber: '10', seatHeight: '4', sets: '4', reps: '15-20', weight: '30', workoutType: 'A' as const },
    { name: 'פלאנק', targetMuscle: 'בטן', sets: '3', reps: '30-60 שניות', workoutType: 'A' as const },
    { name: 'רוסיאן טוויסט', targetMuscle: 'בטן', sets: '3', reps: '20-30', workoutType: 'A' as const },

    // Workout B - גב, יד קידמית ובטן
    { name: 'Pull-ups', targetMuscle: 'גב', sets: '4', reps: '6-10', workoutType: 'B' as const },
    { name: 'Barbell Rows', targetMuscle: 'גב', machineNumber: '6', seatHeight: '5', sets: '4', reps: '8-10', weight: '60', workoutType: 'B' as const },
    { name: 'Lat Pulldowns', targetMuscle: 'גב', machineNumber: '7', seatHeight: '6', sets: '3', reps: '10-12', weight: '50', workoutType: 'B' as const },
    { name: 'Bicep Curls', targetMuscle: 'יד קידמית', machineNumber: '8', seatHeight: '4', sets: '4', reps: '10-12', weight: '15', workoutType: 'B' as const },
    { name: 'Hammer Curls', targetMuscle: 'יד קידמית', sets: '3', reps: '10-12', weight: '12', workoutType: 'B' as const },
    { name: 'Cable Curls', targetMuscle: 'יד קידמית', machineNumber: '9', seatHeight: '5', sets: '3', reps: '12-15', weight: '25', workoutType: 'B' as const },
    { name: 'Dead Bug', targetMuscle: 'בטן', sets: '3', reps: '10 לכל צד', workoutType: 'B' as const },
    { name: 'Mountain Climbers', targetMuscle: 'בטן', sets: '3', reps: '20-30', workoutType: 'B' as const },

    // Workout C - רגליים, זרועות ובטן
    { name: 'Squats', targetMuscle: 'רגליים', machineNumber: '10', seatHeight: '7', sets: '4', reps: '10-15', weight: '80', workoutType: 'C' as const },
    { name: 'Romanian Deadlift', targetMuscle: 'רגליים', sets: '4', reps: '8-10', weight: '70', workoutType: 'C' as const },
    { name: 'Walking Lunges', targetMuscle: 'רגליים', sets: '3', reps: '12 לכל רגל', workoutType: 'C' as const },
    { name: 'Calf Raises', targetMuscle: 'רגליים', machineNumber: '11', seatHeight: '6', sets: '4', reps: '15-20', weight: '40', workoutType: 'C' as const },
    { name: 'Bicep Curls', targetMuscle: 'יד קידמית', machineNumber: '8', seatHeight: '4', sets: '3', reps: '10-12', weight: '15', workoutType: 'C' as const },
    { name: 'Close-Grip Push-ups', targetMuscle: 'יד אחורית', sets: '3', reps: '8-12', workoutType: 'C' as const },
    { name: 'Leg Raises', targetMuscle: 'בטן', sets: '3', reps: '12-15', workoutType: 'C' as const },
    { name: 'Bicycle Crunches', targetMuscle: 'בטן', sets: '3', reps: '20 לכל צד', workoutType: 'C' as const },
  ];

  // Use the exercises hook
  const { 
    addExercise, 
    updateExercise, 
    deleteExercise, 
    getExercisesByWorkout,
    reorderExercise,
    loading 
  } = useSupabaseExercises();

  // Generate dynamic stats based on real data
  const todayStats = [
    { 
      title: "קלוריות נשרפו", 
      value: statsLoading ? "..." : stats.caloriesBurned.toString(), 
      subtitle: "היום", 
      icon: Flame, 
      gradient: true 
    },
    { 
      title: "זמן אימון", 
      value: statsLoading ? "..." : stats.workoutTimeToday.toString(), 
      subtitle: "דקות", 
      icon: Clock 
    },
    { 
      title: "אימונים השבוע", 
      value: statsLoading ? "..." : stats.workoutsThisWeek.toString(), 
      subtitle: "השבוע", 
      icon: Calendar 
    },
    { 
      title: "שיא אישי", 
      value: statsLoading ? "..." : (stats.personalBest ? stats.personalBest.weight.toString() : "0"), 
      subtitle: stats.personalBest ? `ק״ג ב${stats.personalBest.exercise}` : "אין נתונים", 
      icon: Trophy, 
      gradient: true 
    },
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

  const handleStartWorkout = (workoutTitle: string, workoutType: 'A' | 'B' | 'C') => {
    console.log('handleStartWorkout called with:', workoutTitle, workoutType);
    setCurrentWorkout(workoutTitle);
    console.log('About to navigate to:', `/workout/${workoutType}`);
    navigate(`/workout/${workoutType}`);
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

  const handleAddDefaultExercises = async () => {
    try {
      for (const exercise of DEFAULT_EXERCISES) {
        await addExercise(exercise);
      }
      toast({
        title: "הוספו בהצלחה!",
        description: "תרגילי דיפולט נוספו לכל האימונים",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן להוסיף את התרגילים",
        variant: "destructive",
      });
    }
  };

  const currentExercises = getExercisesByWorkout(selectedWorkout);

  return (
    <div className="min-h-screen bg-background text-right" dir="rtl">
      {/* Header */}
      <div className="bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 mobile-rtl-container">
          <div className="flex items-center gap-2 flex-row-reverse">
            <Dumbbell className="h-6 w-6 text-fitness-primary" />
            <span className="font-bold text-lg">מערכת כושר</span>
          </div>
          <UserButton />
        </div>
      </div>

      {/* Hero Section */}
      <div 
        className="relative h-64 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${fitnessHero})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/90" />
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 text-right">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-fitness-primary to-fitness-secondary bg-clip-text text-transparent">
            {profile?.full_name ? `שלום ${profile.full_name}!` : 'אימון היום שלך'}
          </h1>
          <p className="text-lg text-muted-foreground mb-6 max-w-md">
            בואו נבנה את הכוח והסיבולת שלך יחד
          </p>
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
            {workoutPlans.map((workout, index) => {
              const workoutType = index === 0 ? 'A' : index === 1 ? 'B' : 'C';
              return (
                <WorkoutCard 
                  key={index} 
                  {...workout}
                  onStart={() => handleStartWorkout(workout.title, workoutType)}
                />
              );
            })}
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
            <div className="text-center py-12 text-muted-foreground">
              <Target className="w-16 h-16 mx-auto mb-6 opacity-50" />
              <h3 className="text-xl font-semibold mb-4 text-foreground">אין עדיין תרגילים לאימון {selectedWorkout}</h3>
              <div className="space-y-4 max-w-md mx-auto">
                <p className="text-sm">
                  בכדי להוסיף תרגילים, בחר באחת מהאפשרויות הבאות:
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <Button 
                    variant="default" 
                    className="gap-2 w-full sm:w-auto"
                    onClick={() => setIsManagingExercises(true)}
                  >
                    <Settings className="w-4 h-4" />
                    נהל תרגילים ידנית
                  </Button>
                  <span className="text-xs text-muted-foreground">או</span>
                  <Button 
                    variant="default" 
                    className="gap-2 w-full sm:w-auto"
                    onClick={handleAddDefaultExercises}
                  >
                    <Sparkles className="w-4 h-4" />
                    הוסף תרגילי דיפולט
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  תרגילי הדיפולט יוסיפו מגוון תרגילים מוכנים לכל האימונים
                </p>
              </div>
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
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => navigate('/weekly-planner')}
            >
              <Calendar className="w-4 h-4" />
              תכנון שבועי
            </Button>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => navigate('/analytics')}
            >
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
