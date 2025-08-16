import { Exercise } from "@/hooks/useSupabaseExercises";

// חישוב זמן אימון על בסיס מספר התרגילים
export const calculateWorkoutDuration = (exercises: Exercise[]): string => {
  if (exercises.length === 0) return "0 דקות";
  
  // זמן בסיסי לתרגיל (כולל מנוחה): 4-6 דקות
  const baseTimePerExercise = 5;
  const warmupTime = 10; // חימום
  const cooldownTime = 5; // התרגעות
  
  const totalMinutes = warmupTime + (exercises.length * baseTimePerExercise) + cooldownTime;
  return `${totalMinutes} דקות`;
};

// חישוב קלוריות על בסיס התרגילים
export const calculateCalories = (exercises: Exercise[]): string => {
  if (exercises.length === 0) return "0 קלוריות";
  
  let totalCalories = 0;
  
  exercises.forEach(exercise => {
    const sets = parseInt(exercise.sets || "0");
    const weight = parseFloat(exercise.weight || "0");
    const repsStr = exercise.reps || "0";
    
    // חילוץ מספר החזרות (טיפול במקרים כמו "8-12")
    const repsMatch = repsStr.match(/\d+/);
    const reps = repsMatch ? parseInt(repsMatch[0]) : 0;
    
    // נוסחה משוערת לקלוריות: (משקל * חזרות * סטים) / 10
    const exerciseCalories = (weight * reps * sets) / 10;
    totalCalories += exerciseCalories;
  });
  
  // הוספת קלוריות בסיסיות לחימום וקרדיו
  const baseCalories = 50;
  
  return `${Math.round(totalCalories + baseCalories)} קלוריות`;
};

// חישוב רמת קושי על בסיס התרגילים
export const calculateDifficulty = (exercises: Exercise[]): "קל" | "בינוני" | "קשה" | "מתקדם" => {
  if (exercises.length === 0) return "קל";
  
  let difficultyScore = 0;
  
  exercises.forEach(exercise => {
    const sets = parseInt(exercise.sets || "0");
    const weight = parseFloat(exercise.weight || "0");
    const repsStr = exercise.reps || "0";
    
    // חילוץ מספר החזרות
    const repsMatch = repsStr.match(/\d+/);
    const reps = repsMatch ? parseInt(repsMatch[0]) : 0;
    
    // ניקוד קושי לפי משקל, חזרות וסטים
    const exerciseScore = (weight * 0.1) + (reps * 0.2) + (sets * 2);
    difficultyScore += exerciseScore;
  });
  
  // חישוב ממוצע קושי לתרגיל
  const avgDifficulty = difficultyScore / exercises.length;
  
  if (avgDifficulty < 10) return "קל";
  if (avgDifficulty < 20) return "בינוני";
  if (avgDifficulty < 35) return "קשה";
  return "מתקדם";
};