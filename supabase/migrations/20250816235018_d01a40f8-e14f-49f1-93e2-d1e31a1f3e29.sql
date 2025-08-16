-- מחיקת היסטוריית אימונים (אבל לא התרגילים עצמם)
-- מחיקה של workout_exercises תחילה בגלל foreign key constraints
DELETE FROM workout_exercises 
WHERE workout_id IN (
  SELECT id FROM workouts 
  WHERE user_id = auth.uid()
);

-- מחיקה של workouts
DELETE FROM workouts 
WHERE user_id = auth.uid();