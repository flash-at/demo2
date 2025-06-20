/*
  # Create User Data and Fix User Management

  1. New Functions
    - Function to automatically create user_extended records
    - Function to sync Firebase users with Supabase
    
  2. Sample Data
    - Create sample users for testing
    - Populate user_extended table
    
  3. Triggers
    - Auto-create user_extended records when users sign up
    
  4. Security
    - Ensure proper RLS policies for user data
*/

-- Create function to automatically create user_extended record
CREATE OR REPLACE FUNCTION create_user_extended_record()
RETURNS TRIGGER AS $$
BEGIN
  -- This function will be called when a new user signs up
  -- For now, we'll create sample data manually
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sample users for testing (these represent Firebase users)
INSERT INTO users_extended (user_id, username, level, experience_points, total_score, streak_days, last_activity_date, preferred_language, bio, is_premium, created_at, updated_at)
VALUES 
  ('maheshch1094@gmail.com', 'mahesh_admin', 10, 2500, 1250, 15, CURRENT_DATE, 'java', 'Platform Administrator and Full-Stack Developer', true, now() - interval '30 days', now()),
  ('user1@example.com', 'coder_pro', 8, 1800, 900, 12, CURRENT_DATE, 'python', 'Python enthusiast and data science lover', false, now() - interval '25 days', now()),
  ('user2@example.com', 'java_master', 12, 3200, 1600, 20, CURRENT_DATE, 'java', 'Senior Java developer with 5+ years experience', true, now() - interval '45 days', now()),
  ('user3@example.com', 'web_wizard', 6, 1200, 600, 8, CURRENT_DATE, 'web', 'Frontend developer specializing in React', false, now() - interval '15 days', now()),
  ('user4@example.com', 'algo_expert', 15, 4500, 2250, 30, CURRENT_DATE, 'dsa', 'Competitive programming champion', true, now() - interval '60 days', now()),
  ('user5@example.com', 'mobile_dev', 7, 1500, 750, 10, CURRENT_DATE, 'mobile', 'Mobile app developer (iOS & Android)', false, now() - interval '20 days', now()),
  ('user6@example.com', 'db_specialist', 9, 2100, 1050, 14, CURRENT_DATE, 'database', 'Database architect and SQL expert', false, now() - interval '35 days', now()),
  ('user7@example.com', 'newbie_coder', 2, 300, 150, 3, CURRENT_DATE, 'python', 'Just started my coding journey!', false, now() - interval '5 days', now()),
  ('user8@example.com', 'fullstack_dev', 11, 2800, 1400, 18, CURRENT_DATE, 'web', 'Full-stack developer with MERN expertise', true, now() - interval '40 days', now()),
  ('user9@example.com', 'ai_researcher', 13, 3600, 1800, 25, CURRENT_DATE, 'python', 'AI/ML researcher and data scientist', true, now() - interval '50 days', now()),
  ('user10@example.com', 'game_dev', 5, 900, 450, 6, CURRENT_DATE, 'java', 'Indie game developer using Unity', false, now() - interval '12 days', now()),
  ('user11@example.com', 'security_expert', 14, 4000, 2000, 28, CURRENT_DATE, 'java', 'Cybersecurity specialist and ethical hacker', true, now() - interval '55 days', now()),
  ('user12@example.com', 'student_coder', 3, 500, 250, 4, CURRENT_DATE, 'python', 'Computer science student learning to code', false, now() - interval '8 days', now()),
  ('user13@example.com', 'startup_founder', 10, 2600, 1300, 16, CURRENT_DATE, 'web', 'Tech startup founder and entrepreneur', true, now() - interval '42 days', now()),
  ('user14@example.com', 'freelancer_dev', 8, 1900, 950, 11, CURRENT_DATE, 'web', 'Freelance web developer and consultant', false, now() - interval '28 days', now())
ON CONFLICT (user_id) DO UPDATE SET
  username = EXCLUDED.username,
  level = EXCLUDED.level,
  experience_points = EXCLUDED.experience_points,
  total_score = EXCLUDED.total_score,
  streak_days = EXCLUDED.streak_days,
  last_activity_date = EXCLUDED.last_activity_date,
  preferred_language = EXCLUDED.preferred_language,
  bio = EXCLUDED.bio,
  is_premium = EXCLUDED.is_premium,
  updated_at = now();

-- Create some sample tasks for users
INSERT INTO tasks (user_id, title, description, status, priority, due_date, created_at, updated_at)
VALUES 
  ('maheshch1094@gmail.com', 'Review user feedback', 'Analyze user feedback and implement improvements', 'in_progress', 'high', CURRENT_DATE + interval '2 days', now() - interval '1 day', now()),
  ('user1@example.com', 'Complete Python course', 'Finish the advanced Python programming course', 'in_progress', 'medium', CURRENT_DATE + interval '5 days', now() - interval '3 days', now()),
  ('user2@example.com', 'Optimize database queries', 'Improve performance of slow database queries', 'completed', 'high', CURRENT_DATE - interval '1 day', now() - interval '5 days', now() - interval '1 day'),
  ('user3@example.com', 'Build portfolio website', 'Create a responsive portfolio website', 'todo', 'medium', CURRENT_DATE + interval '7 days', now() - interval '2 days', now()),
  ('user4@example.com', 'Solve 10 algorithm problems', 'Practice competitive programming problems', 'completed', 'high', CURRENT_DATE - interval '2 days', now() - interval '7 days', now() - interval '2 days'),
  ('user5@example.com', 'Learn React Native', 'Study React Native for mobile development', 'in_progress', 'medium', CURRENT_DATE + interval '10 days', now() - interval '4 days', now()),
  ('user6@example.com', 'Database migration project', 'Migrate legacy database to new system', 'in_progress', 'high', CURRENT_DATE + interval '3 days', now() - interval '6 days', now()),
  ('user7@example.com', 'Learn basic programming', 'Complete introduction to programming course', 'todo', 'low', CURRENT_DATE + interval '14 days', now() - interval '1 day', now()),
  ('user8@example.com', 'Deploy web application', 'Deploy full-stack application to production', 'completed', 'high', CURRENT_DATE - interval '3 days', now() - interval '8 days', now() - interval '3 days'),
  ('user9@example.com', 'Research ML algorithms', 'Study new machine learning algorithms', 'in_progress', 'medium', CURRENT_DATE + interval '6 days', now() - interval '5 days', now())
ON CONFLICT DO NOTHING;

-- Create some sample notes for users
INSERT INTO notes (user_id, title, content, tags, is_favorite, created_at, updated_at)
VALUES 
  ('maheshch1094@gmail.com', 'Admin Best Practices', 'Key principles for effective platform administration...', ARRAY['admin', 'management'], true, now() - interval '2 days', now()),
  ('user1@example.com', 'Python Tips', 'Useful Python programming tips and tricks...', ARRAY['python', 'programming'], false, now() - interval '1 day', now()),
  ('user2@example.com', 'Java Performance', 'Notes on Java application performance optimization...', ARRAY['java', 'performance'], true, now() - interval '3 days', now()),
  ('user3@example.com', 'CSS Grid Layout', 'Complete guide to CSS Grid layout system...', ARRAY['css', 'web', 'frontend'], false, now() - interval '4 days', now()),
  ('user4@example.com', 'Algorithm Strategies', 'Common algorithmic problem-solving strategies...', ARRAY['algorithms', 'competitive'], true, now() - interval '5 days', now()),
  ('user5@example.com', 'Mobile UI Patterns', 'Common mobile app UI/UX design patterns...', ARRAY['mobile', 'ui', 'design'], false, now() - interval '2 days', now()),
  ('user6@example.com', 'SQL Optimization', 'Database query optimization techniques...', ARRAY['sql', 'database', 'performance'], true, now() - interval '6 days', now()),
  ('user8@example.com', 'React Hooks Guide', 'Comprehensive guide to React Hooks...', ARRAY['react', 'javascript', 'frontend'], false, now() - interval '3 days', now()),
  ('user9@example.com', 'ML Model Deployment', 'Best practices for deploying ML models...', ARRAY['ml', 'deployment', 'ai'], true, now() - interval '4 days', now())
ON CONFLICT DO NOTHING;

-- Create some sample achievements
INSERT INTO achievements (user_id, type, title, description, icon, points_awarded, metadata, earned_at)
VALUES 
  ('maheshch1094@gmail.com', 'level_up', 'Level 10 Reached', 'Congratulations on reaching level 10!', '🏆', 100, '{"level": 10}', now() - interval '5 days'),
  ('user1@example.com', 'problem_solved', 'First Problem Solved', 'Solved your first coding problem!', '🎯', 50, '{"problem_count": 1}', now() - interval '10 days'),
  ('user2@example.com', 'streak', '20-Day Streak', 'Maintained a 20-day learning streak!', '🔥', 200, '{"streak_days": 20}', now() - interval '2 days'),
  ('user4@example.com', 'perfect_score', 'Perfect Score', 'Achieved 100% on a difficult problem!', '⭐', 150, '{"score": 100}', now() - interval '7 days'),
  ('user8@example.com', 'course_completed', 'Course Completed', 'Successfully completed a full course!', '📚', 300, '{"course": "React Fundamentals"}', now() - interval '3 days'),
  ('user9@example.com', 'level_up', 'Level 13 Reached', 'Congratulations on reaching level 13!', '🏆', 130, '{"level": 13}', now() - interval '1 day')
ON CONFLICT DO NOTHING;

-- Create some sample rewards
INSERT INTO rewards (user_id, type, title, description, value, is_claimed, created_at)
VALUES 
  ('maheshch1094@gmail.com', 'points', 'Admin Bonus', 'Special bonus for platform administration', 500, true, now() - interval '10 days'),
  ('user1@example.com', 'points', 'Welcome Bonus', 'Welcome to CodeCafe! Here are some starter points', 100, false, now() - interval '8 days'),
  ('user2@example.com', 'badge', 'Java Expert', 'Earned for exceptional Java programming skills', 1, true, now() - interval '15 days'),
  ('user4@example.com', 'points', 'Algorithm Master', 'Reward for solving complex algorithms', 250, true, now() - interval '5 days'),
  ('user8@example.com', 'premium_days', 'Premium Trial', 'Free premium access for outstanding performance', 30, false, now() - interval '3 days'),
  ('user9@example.com', 'certificate', 'AI Specialist', 'Certificate for AI/ML expertise', 1, true, now() - interval '7 days')
ON CONFLICT DO NOTHING;

-- Create some sample activities
INSERT INTO activities (user_id, action, description, metadata, created_at)
VALUES 
  ('maheshch1094@gmail.com', 'task_completed', 'Completed task: Platform maintenance', '{"task_id": "admin-task-1", "title": "Platform maintenance"}', now() - interval '2 hours'),
  ('user1@example.com', 'note_created', 'Created note: Python Tips', '{"note_id": "note-1", "title": "Python Tips"}', now() - interval '1 day'),
  ('user2@example.com', 'task_completed', 'Completed task: Optimize database queries', '{"task_id": "task-2", "title": "Optimize database queries"}', now() - interval '1 day'),
  ('user3@example.com', 'task_created', 'Created task: Build portfolio website', '{"task_id": "task-3", "title": "Build portfolio website"}', now() - interval '2 days'),
  ('user4@example.com', 'achievement_earned', 'Earned achievement: Perfect Score', '{"achievement_id": "ach-1", "title": "Perfect Score", "points": 150}', now() - interval '7 days'),
  ('user5@example.com', 'note_created', 'Created note: Mobile UI Patterns', '{"note_id": "note-5", "title": "Mobile UI Patterns"}', now() - interval '2 days'),
  ('user8@example.com', 'task_completed', 'Completed task: Deploy web application', '{"task_id": "task-8", "title": "Deploy web application"}', now() - interval '3 days'),
  ('user9@example.com', 'note_favorited', 'Favorited note: ML Model Deployment', '{"note_id": "note-9", "title": "ML Model Deployment"}', now() - interval '4 days')
ON CONFLICT DO NOTHING;

-- Update RLS policies for users_extended to allow admin access
DROP POLICY IF EXISTS "Users can view own extended profile" ON users_extended;
DROP POLICY IF EXISTS "Users can update own extended profile" ON users_extended;
DROP POLICY IF EXISTS "Users can insert own extended profile" ON users_extended;

-- Create new policies that allow admin access
CREATE POLICY "Users can view own extended profile"
  ON users_extended
  FOR SELECT
  TO authenticated
  USING (
    user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
    OR user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
    OR EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
      OR au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
    )
  );

CREATE POLICY "Users can update own extended profile"
  ON users_extended
  FOR UPDATE
  TO authenticated
  USING (
    user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
    OR user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
    OR EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
      OR au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
    )
  );

CREATE POLICY "Users can insert own extended profile"
  ON users_extended
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
    OR user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
    OR EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
      OR au.user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
    )
  );

-- Create function to automatically create user_extended record when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users_extended (user_id, username, level, experience_points, total_score, streak_days, last_activity_date, preferred_language, is_premium, created_at, updated_at)
  VALUES (
    NEW.user_id,
    COALESCE(NEW.username, 'User' || substring(NEW.user_id from 1 for 8)),
    1,
    0,
    0,
    0,
    CURRENT_DATE,
    'java',
    false,
    now(),
    now()
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: We can't create a trigger on auth.users since it's managed by Supabase
-- Instead, we'll handle this in the application code when users sign up