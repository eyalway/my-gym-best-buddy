-- Delete duplicate exercises completely, keep only unique combinations
DELETE FROM exercise_templates 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, workout_type, exercise_name, target_muscle, sets, reps, weight) id
  FROM exercise_templates 
  ORDER BY user_id, workout_type, exercise_name, target_muscle, sets, reps, weight, created_at DESC
);

-- Re-sequence exercise_order to be clean
WITH updated_orders AS (
  SELECT id, 
    ROW_NUMBER() OVER (PARTITION BY user_id, workout_type ORDER BY exercise_order, created_at) as new_order
  FROM exercise_templates
)
UPDATE exercise_templates 
SET exercise_order = updated_orders.new_order
FROM updated_orders
WHERE exercise_templates.id = updated_orders.id;