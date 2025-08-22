UPDATE workouts 
SET start_time = '2025-08-21 14:30:00+00'::timestamptz,
    end_time = '2025-08-21 16:56:00+00'::timestamptz,
    updated_at = now()
WHERE id = 'e4baa46b-f6a4-4ead-8156-590946b28fb9';