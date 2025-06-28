/*
  # Update activities table for course tracking

  1. Changes
    - Add new activity types for course-related actions
  2. Functions
    - Create function to log course activity
*/

-- Create function to log course activity if it doesn't exist
CREATE OR REPLACE FUNCTION log_course_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activities (user_id, action, description, metadata)
    VALUES (
      NEW.user_id,
      'course_enrolled',
      'Enrolled in a course',
      jsonb_build_object(
        'course_id', NEW.course_id,
        'lesson_id', NEW.lesson_id
      )
    );
  ELSIF TG_OP = 'UPDATE' AND NEW.is_completed = true AND OLD.is_completed = false THEN
    INSERT INTO activities (user_id, action, description, metadata)
    VALUES (
      NEW.user_id,
      'lesson_completed',
      'Completed a lesson',
      jsonb_build_object(
        'course_id', NEW.course_id,
        'lesson_id', NEW.lesson_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user_progress
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'user_progress_activity_trigger'
  ) THEN
    CREATE TRIGGER user_progress_activity_trigger
    AFTER INSERT OR UPDATE ON user_progress
    FOR EACH ROW
    EXECUTE FUNCTION log_course_activity();
  END IF;
END $$;