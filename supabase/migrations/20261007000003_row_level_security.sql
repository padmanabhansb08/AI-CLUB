-- ==============================================================================
-- AI CLUB Supabase Migration: 003_row_level_security.sql
-- Mandatory Row Level Security Policies across all application tables
-- ==============================================================================

-- Helper function to check if current authenticated user is an administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 1. Profiles RLS
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 2. Membership Applications RLS
-- ------------------------------------------------------------------------------
ALTER TABLE public.membership_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own application"
  ON public.membership_applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Students can create their own application"
  ON public.membership_applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update draft application, admins can update any"
  ON public.membership_applications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (
    (auth.uid() = user_id AND status IN ('DRAFT', 'TEST_REQUIRED', 'TEST_IN_PROGRESS'))
    OR public.is_admin()
  );

-- ------------------------------------------------------------------------------
-- 3. Club Memberships RLS
-- ------------------------------------------------------------------------------
ALTER TABLE public.club_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Memberships are viewable by authenticated users"
  ON public.club_memberships FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert or update club memberships"
  ON public.club_memberships FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 4. Assessment Questions RLS
-- CRITICAL SECURITY RULE: Raw table with correct answers is RESTRICTED to admins!
-- Students must query through the student_assessment_questions safe view!
-- ------------------------------------------------------------------------------
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to assessment questions"
  ON public.assessment_questions FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 5. Assessment Attempts RLS
-- ------------------------------------------------------------------------------
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own attempts, admins can view all"
  ON public.assessment_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id OR public.is_admin());

CREATE POLICY "Students can insert their own attempt"
  ON public.assessment_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their active attempt, admins can update all"
  ON public.assessment_attempts FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id OR public.is_admin())
  WITH CHECK (auth.uid() = student_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 6. Assessment Attempt Questions RLS
-- ------------------------------------------------------------------------------
ALTER TABLE public.assessment_attempt_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students view attempt questions for their attempt"
  ON public.assessment_attempt_questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.assessment_attempts
      WHERE id = attempt_id AND (student_id = auth.uid() OR public.is_admin())
    )
  );

-- ------------------------------------------------------------------------------
-- 7. Assessment Answers RLS
-- ------------------------------------------------------------------------------
ALTER TABLE public.assessment_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own answers"
  ON public.assessment_answers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.assessment_attempts
      WHERE id = attempt_id AND (student_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Students can insert their own answers during active attempt"
  ON public.assessment_answers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assessment_attempts
      WHERE id = attempt_id AND student_id = auth.uid() AND status = 'IN_PROGRESS'
    )
  );

CREATE POLICY "Students can update their answers during active attempt"
  ON public.assessment_answers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.assessment_attempts
      WHERE id = attempt_id AND student_id = auth.uid() AND status = 'IN_PROGRESS'
    )
  );

-- ------------------------------------------------------------------------------
-- 8. Announcements RLS
-- ------------------------------------------------------------------------------
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published announcements are viewable by targeted audiences"
  ON public.announcements FOR SELECT
  TO authenticated
  USING (
    status = 'PUBLISHED'
    OR public.is_admin()
  );

CREATE POLICY "Admins have full management of announcements"
  ON public.announcements FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 9. Notifications RLS
-- ------------------------------------------------------------------------------
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can mark their own notifications as read"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 10. Audit Logs RLS (Append-only, Admin readable)
-- ------------------------------------------------------------------------------
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Authenticated operations can append audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);
