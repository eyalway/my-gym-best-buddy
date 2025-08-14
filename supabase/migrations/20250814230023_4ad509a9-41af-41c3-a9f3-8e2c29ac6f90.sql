-- Remove duplicate exercise templates by keeping only the one with the highest exercise_order for each unique combination
WITH ranked_exercises AS (
  SELECT *,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, workout_type, exercise_name, target_muscle 
      ORDER BY exercise_order DESC, created_at DESC
    ) as rn
  FROM exercise_templates
)
DELETE FROM exercise_templates 
WHERE id IN (
  SELECT id FROM ranked_exercises WHERE rn > 1
);

-- Update exercise_order to be sequential starting from 1 for each workout_type
WITH ordered_exercises AS (
  SELECT id, workout_type, user_id,
    ROW_NUMBER() OVER (PARTITION BY user_id, workout_type ORDER BY exercise_order) as new_order
  FROM exercise_templates
)
UPDATE exercise_templates 
SET exercise_order = ordered_exercises.new_order
FROM ordered_exercises
WHERE exercise_templates.id = ordered_exercises.id;