-- ==============================================================================
-- AI CLUB Supabase Migration: 001_core_schema.sql
-- Relational PostgreSQL Schema for AI CLUB Full-Stack Platform
-- ==============================================================================

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. Profiles (Application-Level Identity linked to auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  department VARCHAR(100) NOT NULL DEFAULT 'Computer Science',
  year INT NOT NULL DEFAULT 1 CHECK (year BETWEEN 1 AND 5),
  section VARCHAR(50) NOT NULL DEFAULT 'A',
  avatar_url TEXT,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  technical_interests TEXT[] DEFAULT '{}',
  github_url TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  role VARCHAR(50) NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('STUDENT', 'ADMIN', 'INSTRUCTOR', 'SUPER_ADMIN')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ------------------------------------------------------------------------------
-- 2. Membership Applications (Student Selection Workflow)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.membership_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  member_id UUID,
  application_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'TEST_REQUIRED' 
    CHECK (status IN ('DRAFT', 'TEST_REQUIRED', 'TEST_IN_PROGRESS', 'TEST_COMPLETED', 'UNDER_REVIEW', 'APPROVED', 'WAITLISTED', 'REJECTED', 'WITHDRAWN')),
  test_attempt_id UUID,
  final_score INT CHECK (final_score >= 0 AND final_score <= 25),
  score_percentage NUMERIC(5, 2) CHECK (score_percentage >= 0 AND score_percentage <= 100),
  passed BOOLEAN,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  admin_notes TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_membership_applications_user ON public.membership_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_membership_applications_status ON public.membership_applications(status);
CREATE INDEX IF NOT EXISTS idx_membership_applications_number ON public.membership_applications(application_number);
CREATE INDEX IF NOT EXISTS idx_membership_applications_score ON public.membership_applications(final_score DESC);

-- ------------------------------------------------------------------------------
-- 3. Club Memberships (Official Approved Active Members)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.club_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  member_id UUID,
  member_number VARCHAR(50) UNIQUE NOT NULL,
  application_id UUID UNIQUE REFERENCES public.membership_applications(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'INACTIVE')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_club_memberships_user ON public.club_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_club_memberships_number ON public.club_memberships(member_number);
CREATE INDEX IF NOT EXISTS idx_club_memberships_status ON public.club_memberships(status);

-- ------------------------------------------------------------------------------
-- 4. Assessment Questions Bank
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option VARCHAR(1) NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  category VARCHAR(100) NOT NULL,
  difficulty VARCHAR(50) NOT NULL DEFAULT 'MEDIUM' CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
  explanation TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_assessment_questions_cat ON public.assessment_questions(category);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_diff ON public.assessment_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_act ON public.assessment_questions(is_active);

-- ------------------------------------------------------------------------------
-- 5. Assessment Attempts (One active attempt per student with timer)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assessment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.membership_applications(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS' 
    CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'EXPIRED')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ NOT NULL,
  submitted_at TIMESTAMPTZ,
  question_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_questions INT NOT NULL DEFAULT 25,
  correct_answers INT DEFAULT 0,
  wrong_answers INT DEFAULT 0,
  unanswered INT DEFAULT 25,
  score INT DEFAULT 0 CHECK (score >= 0 AND score <= 25),
  percentage NUMERIC(5, 2) DEFAULT 0,
  passed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_assessment_attempts_app ON public.assessment_attempts(application_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_student ON public.assessment_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_status ON public.assessment_attempts(status);

-- Foreign key linking membership_applications to assessment_attempts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_app_test_attempt'
  ) THEN
    ALTER TABLE public.membership_applications
      ADD CONSTRAINT fk_app_test_attempt
      FOREIGN KEY (test_attempt_id) REFERENCES public.assessment_attempts(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 6. Assessment Attempt Questions (Relational Question Order Storage)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assessment_attempt_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.assessment_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.assessment_questions(id) ON DELETE RESTRICT,
  question_order INT NOT NULL CHECK (question_order BETWEEN 1 AND 25),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(attempt_id, question_id),
  UNIQUE(attempt_id, question_order)
);

CREATE INDEX IF NOT EXISTS idx_att_questions_attempt ON public.assessment_attempt_questions(attempt_id);

-- ------------------------------------------------------------------------------
-- 7. Assessment Answers (Auto-saved & Server-side Evaluated)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assessment_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.assessment_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.assessment_questions(id) ON DELETE RESTRICT,
  selected_option VARCHAR(1) CHECK (selected_option IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(attempt_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_assessment_answers_attempt ON public.assessment_answers(attempt_id);

-- ------------------------------------------------------------------------------
-- 8. Announcements
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'GENERAL',
  priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  target_audience VARCHAR(50) NOT NULL DEFAULT 'ALL_STUDENTS' CHECK (target_audience IN ('ALL_STUDENTS', 'APPLICANTS', 'APPROVED_MEMBERS', 'ADMINS')),
  status VARCHAR(50) NOT NULL DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  published_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_announcements_audience ON public.announcements(target_audience);
CREATE INDEX IF NOT EXISTS idx_announcements_status ON public.announcements(status);

-- ------------------------------------------------------------------------------
-- 9. Automatic Updated At Trigger Function
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
