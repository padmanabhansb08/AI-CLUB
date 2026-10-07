export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          email: string;
          phone: string | null;
          department: string;
          year: number;
          section: string;
          avatar_url: string | null;
          bio: string | null;
          github_url: string | null;
          linkedin_url: string | null;
          portfolio_url: string | null;
          role: 'STUDENT' | 'ADMIN' | 'INSTRUCTOR' | 'SUPER_ADMIN';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          email: string;
          phone?: string | null;
          department?: string;
          year?: number;
          section?: string;
          avatar_url?: string | null;
          bio?: string | null;
          github_url?: string | null;
          linkedin_url?: string | null;
          portfolio_url?: string | null;
          role?: 'STUDENT' | 'ADMIN' | 'INSTRUCTOR' | 'SUPER_ADMIN';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          department?: string;
          year?: number;
          section?: string;
          avatar_url?: string | null;
          bio?: string | null;
          github_url?: string | null;
          linkedin_url?: string | null;
          portfolio_url?: string | null;
          role?: 'STUDENT' | 'ADMIN' | 'INSTRUCTOR' | 'SUPER_ADMIN';
          created_at?: string;
          updated_at?: string;
        };
      };
      membership_applications: {
        Row: {
          id: string;
          user_id: string;
          application_number: string;
          status:
            | 'DRAFT'
            | 'TEST_REQUIRED'
            | 'TEST_IN_PROGRESS'
            | 'TEST_COMPLETED'
            | 'UNDER_REVIEW'
            | 'APPROVED'
            | 'WAITLISTED'
            | 'REJECTED'
            | 'WITHDRAWN';
          test_attempt_id: string | null;
          final_score: number | null;
          final_percentage: number | null;
          passed: boolean | null;
          submitted_at: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          admin_notes: string | null;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_number: string;
          status?:
            | 'DRAFT'
            | 'TEST_REQUIRED'
            | 'TEST_IN_PROGRESS'
            | 'TEST_COMPLETED'
            | 'UNDER_REVIEW'
            | 'APPROVED'
            | 'WAITLISTED'
            | 'REJECTED'
            | 'WITHDRAWN';
          test_attempt_id?: string | null;
          final_score?: number | null;
          final_percentage?: number | null;
          passed?: boolean | null;
          submitted_at?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          admin_notes?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          application_number?: string;
          status?:
            | 'DRAFT'
            | 'TEST_REQUIRED'
            | 'TEST_IN_PROGRESS'
            | 'TEST_COMPLETED'
            | 'UNDER_REVIEW'
            | 'APPROVED'
            | 'WAITLISTED'
            | 'REJECTED'
            | 'WITHDRAWN';
          test_attempt_id?: string | null;
          final_score?: number | null;
          final_percentage?: number | null;
          passed?: boolean | null;
          submitted_at?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          admin_notes?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      club_memberships: {
        Row: {
          id: string;
          user_id: string;
          member_number: string;
          application_id: string | null;
          status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
          joined_at: string;
          approved_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          member_number: string;
          application_id?: string | null;
          status?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
          joined_at?: string;
          approved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          member_number?: string;
          application_id?: string | null;
          status?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
          joined_at?: string;
          approved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      assessment_questions: {
        Row: {
          id: string;
          question: string;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          correct_option: string;
          category: string;
          difficulty: string;
          explanation: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question: string;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          correct_option: string;
          category: string;
          difficulty?: string;
          explanation?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          question?: string;
          option_a?: string;
          option_b?: string;
          option_c?: string;
          option_d?: string;
          correct_option?: string;
          category?: string;
          difficulty?: string;
          explanation?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      assessment_attempts: {
        Row: {
          id: string;
          application_id: string;
          student_id: string;
          status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED';
          started_at: string;
          expires_at: string;
          submitted_at: string | null;
          total_questions: number;
          correct_answers: number;
          wrong_answers: number;
          unanswered: number;
          score: number;
          percentage: number;
          passed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          student_id: string;
          status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED';
          started_at?: string;
          expires_at: string;
          submitted_at?: string | null;
          total_questions?: number;
          correct_answers?: number;
          wrong_answers?: number;
          unanswered?: number;
          score?: number;
          percentage?: number;
          passed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          student_id?: string;
          status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED';
          started_at?: string;
          expires_at?: string;
          submitted_at?: string | null;
          total_questions?: number;
          correct_answers?: number;
          wrong_answers?: number;
          unanswered?: number;
          score?: number;
          percentage?: number;
          passed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      assessment_attempt_questions: {
        Row: {
          id: string;
          attempt_id: string;
          question_id: string;
          question_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          attempt_id: string;
          question_id: string;
          question_order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          attempt_id?: string;
          question_id?: string;
          question_order?: number;
          created_at?: string;
        };
      };
      assessment_answers: {
        Row: {
          id: string;
          attempt_id: string;
          question_id: string;
          selected_option: string | null;
          is_correct: boolean | null;
          answered_at: string;
        };
        Insert: {
          id?: string;
          attempt_id: string;
          question_id: string;
          selected_option?: string | null;
          is_correct?: boolean | null;
          answered_at?: string;
        };
        Update: {
          id?: string;
          attempt_id?: string;
          question_id?: string;
          selected_option?: string | null;
          is_correct?: boolean | null;
          answered_at?: string;
        };
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          content: string;
          category: string;
          priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
          target_audience: 'ALL_STUDENTS' | 'APPLICANTS' | 'APPROVED_MEMBERS' | 'ADMINS';
          status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
          published_at: string | null;
          expires_at: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          category: string;
          priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
          target_audience?: 'ALL_STUDENTS' | 'APPLICANTS' | 'APPROVED_MEMBERS' | 'ADMINS';
          status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
          published_at?: string | null;
          expires_at?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          category?: string;
          priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
          target_audience?: 'ALL_STUDENTS' | 'APPLICANTS' | 'APPROVED_MEMBERS' | 'ADMINS';
          status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
          published_at?: string | null;
          expires_at?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          event_type: string;
          status: 'draft' | 'published' | 'cancelled' | 'completed';
          start_at: string;
          end_at: string;
          location: string | null;
          meeting_url: string | null;
          capacity: number | null;
          registration_count: number;
          registration_open_at: string | null;
          registration_close_at: string | null;
          organizer: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          event_type: string;
          status?: 'draft' | 'published' | 'cancelled' | 'completed';
          start_at: string;
          end_at: string;
          location?: string | null;
          meeting_url?: string | null;
          capacity?: number | null;
          registration_count?: number;
          registration_open_at?: string | null;
          registration_close_at?: string | null;
          organizer?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          event_type?: string;
          status?: 'draft' | 'published' | 'cancelled' | 'completed';
          start_at?: string;
          end_at?: string;
          location?: string | null;
          meeting_url?: string | null;
          capacity?: number | null;
          registration_count?: number;
          registration_open_at?: string | null;
          registration_close_at?: string | null;
          organizer?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      event_registrations: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          registration_status: 'REGISTERED' | 'CANCELLED' | 'WAITLISTED' | 'ATTENDED';
          registered_at: string;
          cancelled_at: string | null;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          registration_status?: 'REGISTERED' | 'CANCELLED' | 'WAITLISTED' | 'ATTENDED';
          registered_at?: string;
          cancelled_at?: string | null;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string;
          registration_status?: 'REGISTERED' | 'CANCELLED' | 'WAITLISTED' | 'ATTENDED';
          registered_at?: string;
          cancelled_at?: string | null;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string;
          domain: string;
          difficulty: string;
          instructor_name: string;
          instructor_title: string;
          status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description: string;
          domain: string;
          difficulty?: string;
          instructor_name: string;
          instructor_title: string;
          status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string;
          domain?: string;
          difficulty?: string;
          instructor_name?: string;
          instructor_title?: string;
          status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          title: string;
          slug: string;
          short_description: string;
          overview: string | null;
          domain: string;
          difficulty: string;
          status: 'DRAFT' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
          github_repo_url: string | null;
          demo_url: string | null;
          max_team_size: number;
          progress_percentage: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          short_description: string;
          overview?: string | null;
          domain: string;
          difficulty?: string;
          status?: 'DRAFT' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
          github_repo_url?: string | null;
          demo_url?: string | null;
          max_team_size?: number;
          progress_percentage?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          short_description?: string;
          overview?: string | null;
          domain?: string;
          difficulty?: string;
          status?: 'DRAFT' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
          github_repo_url?: string | null;
          demo_url?: string | null;
          max_team_size?: number;
          progress_percentage?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string;
          category: string;
          icon: string;
          points: number;
          criteria_type: string;
          criteria_config: Json;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description: string;
          category: string;
          icon?: string;
          points?: number;
          criteria_type: string;
          criteria_config?: Json;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string;
          category?: string;
          icon?: string;
          points?: number;
          criteria_type?: string;
          criteria_config?: Json;
          is_active?: boolean;
          created_at?: string;
        };
      };
      member_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          earned_at: string;
          progress: Json;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          earned_at?: string;
          progress?: Json;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_id?: string;
          earned_at?: string;
          progress?: Json;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          data: Json;
          is_read: boolean;
          read_at: string | null;
          priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          data?: Json;
          is_read?: boolean;
          read_at?: string | null;
          priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          data?: Json;
          is_read?: boolean;
          read_at?: string | null;
          priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          metadata?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      student_assessment_questions: {
        Row: {
          id: string;
          question: string;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          category: string;
          difficulty: string;
          is_active: boolean;
        };
      };
    };
    Functions: {
      approve_membership_application: {
        Args: {
          p_application_id: string;
          p_admin_id: string;
          p_notes?: string;
        };
        Returns: {
          success: boolean;
          member_number: string;
          membership_id: string;
        };
      };
    };
  };
}
