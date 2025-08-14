import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WorkoutCard } from "@/components/WorkoutCard";
import { StatsCard } from "@/components/StatsCard";
import { ExerciseItem } from "@/components/ExerciseItem";
import { 
  Dumbbell, 
  Flame, 
  Clock, 
  Target, 
  TrendingUp, 
  Calendar,
  Play,
  Trophy
} from "lucide-react";
import fitnessHero from "@/assets/fitness-hero.jpg";

const Index = () => {
  const [currentWorkout, setCurrentWorkout] = useState<string | null>(null);

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
      exercises: 12,
      difficulty: "בינוני" as const,
      muscleGroups: ["חזה", "כתפיים", "יד אחורית", "בטן"]
    },
    {
      title: "אימון B: גב, יד קידמית ובטן",
      duration: "55 דקות", 
      calories: "320 קלוריות",
      exercises: 10,
      difficulty: "בינוני" as const,
      muscleGroups: ["גב", "יד קידמית", "בטן"]
    },
    {
      title: "אימון C: רגליים, זרועות ובטן",
      duration: "70 דקות",
      calories: "450 קלוריות", 
      exercises: 14,
      difficulty: "קשה" as const,
      muscleGroups: ["רגליים", "יד קידמית", "יד אחורית", "בטן"]
    },
  ];

  const exercisesByWorkout = {
    "A": [
      { name: "Bench Press", targetMuscle: "חזה", sets: "4", reps: "8-12", weight: "70" },
      { name: "Incline Dumbbell Press", targetMuscle: "חזה", sets: "3", reps: "10-12", weight: "25" },
      { name: "Shoulder Press", targetMuscle: "כתפיים", sets: "4", reps: "8-10", weight: "45" },
      { name: "Lateral Raises", targetMuscle: "כתפיים", sets: "3", reps: "12-15", weight: "12" },
      { name: "Tricep Dips", targetMuscle: "יד אחורית", sets: "3", reps: "10-12" },
      { name: "Overhead Tricep Extension", targetMuscle: "יד אחורית", sets: "3", reps: "10-12", weight: "20" },
      { name: "Plank", targetMuscle: "בטן", sets: "3", reps: "30-60 שניות" },
      { name: "Russian Twists", targetMuscle: "בטן", sets: "3", reps: "20-30" },
    ],
    "B": [
      { name: "Pull-ups", targetMuscle: "גב", sets: "4", reps: "6-10" },
      { name: "Barbell Rows", targetMuscle: "גב", sets: "4", reps: "8-10", weight: "60" },
      { name: "Lat Pulldowns", targetMuscle: "גב", sets: "3", reps: "10-12", weight: "50" },
      { name: "Bicep Curls", targetMuscle: "יד קידמית", sets: "4", reps: "10-12", weight: "15" },
      { name: "Hammer Curls", targetMuscle: "יד קידמית", sets: "3", reps: "10-12", weight: "12" },
      { name: "Cable Curls", targetMuscle: "יד קידמית", sets: "3", reps: "12-15", weight: "25" },
      { name: "Dead Bug", targetMuscle: "בטן", sets: "3", reps: "10 לכל צד" },
      { name: "Mountain Climbers", targetMuscle: "בטן", sets: "3", reps: "20-30" },
    ],
    "C": [
      { name: "Squats", targetMuscle: "רגליים", sets: "4", reps: "10-15", weight: "80" },
      { name: "Romanian Deadlift", targetMuscle: "רגליים", sets: "4", reps: "8-10", weight: "70" },
      { name: "Walking Lunges", targetMuscle: "רגליים", sets: "3", reps: "12 לכל רגל" },
      { name: "Calf Raises", targetMuscle: "רגליים", sets: "4", reps: "15-20", weight: "40" },
      { name: "Bicep Curls", targetMuscle: "יד קידמית", sets: "3", reps: "10-12", weight: "15" },
      { name: "Close-Grip Push-ups", targetMuscle: "יד אחורית", sets: "3", reps: "8-12" },
      { name: "Leg Raises", targetMuscle: "בטן", sets: "3", reps: "12-15" },
      { name: "Bicycle Crunches", targetMuscle: "בטן", sets: "3", reps: "20 לכל צד" },
    ]
  };

  const [selectedWorkout, setSelectedWorkout] = useState<"A" | "B" | "C">("A");

  const handleStartWorkout = (workoutTitle: string) => {
    setCurrentWorkout(workoutTitle);
    // כאן תהיה לוגיקה להתחלת אימון
  };

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

        {/* Exercise Selector and List */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Target className="w-6 h-6 text-fitness-primary" />
              תרגילי אימון {selectedWorkout}
            </h2>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exercisesByWorkout[selectedWorkout].map((exercise, index) => (
              <ExerciseItem key={index} {...exercise} />
            ))}
          </div>
        </section>

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