-- ==============================================================================
-- AI CLUB Supabase Migration: 002_views_and_functions.sql
-- Security Views and Atomic Transaction Functions
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Student Assessment Questions Safe View
-- CRITICAL SECURITY RULE: NEVER expose correct_option to students!
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.student_assessment_questions AS
SELECT
  id,
  question,
  option_a,
  option_b,
  option_c,
  option_d,
  category,
  difficulty,
  is_active
FROM public.assessment_questions
WHERE is_active = true;

-- ------------------------------------------------------------------------------
-- 2. Application Number Generator (AIC-YYYY-XXXXXX)
-- ------------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.seq_application_number START WITH 100001;

CREATE OR REPLACE FUNCTION public.generate_application_number()
RETURNS TEXT AS $$
DECLARE
  v_year TEXT;
  v_seq INT;
  v_num TEXT;
BEGIN
  v_year := to_char(CURRENT_DATE, 'YYYY');
  v_seq := nextval('public.seq_application_number');
  v_num := 'AIC-' || v_year || '-' || lpad(v_seq::text, 6, '0');
  RETURN v_num;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 3. Member Number Generator (AIC-M-YYYY-XXXXX)
-- ------------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.seq_member_number START WITH 10001;

CREATE OR REPLACE FUNCTION public.generate_member_number()
RETURNS TEXT AS $$
DECLARE
  v_year TEXT;
  v_seq INT;
  v_num TEXT;
BEGIN
  v_year := to_char(CURRENT_DATE, 'YYYY');
  v_seq := nextval('public.seq_member_number');
  v_num := 'AIC-M-' || v_year || '-' || lpad(v_seq::text, 5, '0');
  RETURN v_num;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 4. Atomic Membership Approval Transaction Function
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.approve_membership_application(
  p_application_id UUID,
  p_admin_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_app RECORD;
  v_member_number TEXT;
  v_membership_id UUID;
  v_existing_membership RECORD;
BEGIN
  -- 1. Lock application row for atomic transaction
  SELECT * INTO v_app
  FROM public.membership_applications
  WHERE id = p_application_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application with ID % not found', p_application_id;
  END IF;

  IF v_app.status = 'APPROVED' THEN
    SELECT id, member_number INTO v_existing_membership
    FROM public.club_memberships
    WHERE user_id = v_app.user_id;

    RETURN jsonb_build_object(
      'success', true,
      'already_approved', true,
      'member_number', v_existing_membership.member_number,
      'membership_id', v_existing_membership.id
    );
  END IF;

  -- 2. Determine unique member number
  SELECT * INTO v_existing_membership
  FROM public.club_memberships
  WHERE user_id = v_app.user_id;

  IF FOUND THEN
    v_member_number := v_existing_membership.member_number;
    v_membership_id := v_existing_membership.id;

    UPDATE public.club_memberships
    SET status = 'ACTIVE',
        approved_by = p_admin_id,
        application_id = p_application_id,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = v_membership_id;
  ELSE
    v_member_number := public.generate_member_number();
    
    INSERT INTO public.club_memberships (
      user_id,
      member_id,
      member_number,
      application_id,
      status,
      joined_at,
      approved_by
    )
    VALUES (
      v_app.user_id,
      v_app.member_id,
      v_member_number,
      p_application_id,
      'ACTIVE',
      CURRENT_TIMESTAMP,
      p_admin_id
    )
    RETURNING id INTO v_membership_id;
  END IF;

  -- 3. Update application status
  UPDATE public.membership_applications
  SET status = 'APPROVED',
      reviewed_at = CURRENT_TIMESTAMP,
      reviewed_by = p_admin_id,
      admin_notes = COALESCE(p_notes, admin_notes),
      updated_at = CURRENT_TIMESTAMP
  WHERE id = p_application_id;

  -- 4. Audit Log entry
  INSERT INTO public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  VALUES (
    p_admin_id,
    'APPLICATION_APPROVED',
    'membership_applications',
    p_application_id,
    jsonb_build_object(
      'member_number', v_member_number,
      'membership_id', v_membership_id,
      'user_id', v_app.user_id,
      'score', v_app.final_score
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'member_number', v_member_number,
    'membership_id', v_membership_id,
    'application_id', p_application_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
