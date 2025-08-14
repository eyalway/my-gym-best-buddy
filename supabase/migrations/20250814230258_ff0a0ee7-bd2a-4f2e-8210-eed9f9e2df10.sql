-- Add the 4 missing exercises back to workout A
INSERT INTO exercise_templates (user_id, exercise_name, target_muscle, sets, reps, weight, workout_type, exercise_order) VALUES
('cc913cdc-c8eb-4620-a2b1-c7c52cfabf81', 'הרמת מרפקים עם מוט W', 'כתפיים', '4', '8-10', '27.5', 'A', 9),
('cc913cdc-c8eb-4620-a2b1-c7c52cfabf81', 'פשיטת מרפק מכונה', 'יד אחורית', '4', '10-12', '72.5', 'A', 10),
('cc913cdc-c8eb-4620-a2b1-c7c52cfabf81', 'פשיטת מרפק עם כבל', 'יד אחורית', '3', '10-12', '36.5', 'A', 11),
('cc913cdc-c8eb-4620-a2b1-c7c52cfabf81', 'כפיפות בטן שיפוע שלילי', 'בטן', '3', '12-15', NULL, 'A', 12);