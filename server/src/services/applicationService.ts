import { applicationRepo } from '../repositories/applicationRepository';
import { assessmentRepo } from '../repositories/assessmentRepository';
import { notificationService } from './notificationService';
import { query } from '../db';
import { AppError, NotFoundError, BadRequestError, ForbiddenError } from '../errors/AppError';

function generateApplicationNumber(): string {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  return `AIC-${year}-${randomPart}`;
}

function generateMemberNumber(): string {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(10000 + Math.random() * 90000);
  return `AIC-M-${year}-${randomPart}`;
}

export const applicationService = {
  // 1. Get or initialize student application
  getMyApplication: async (userId: string) => {
    let app = await applicationRepo.findByUserId(userId);

    // If student doesn't have an application yet, initialize one
    if (!app) {
      const memberRes = await query(`SELECT id FROM members WHERE user_id = $1`, [userId]);
      const memberId = memberRes.rows[0]?.id || null;
      const appNumber = generateApplicationNumber();

      await applicationRepo.create({
        userId,
        memberId,
        applicationNumber: appNumber,
        status: memberId ? 'TEST_REQUIRED' : 'DRAFT',
      });

      app = await applicationRepo.findByUserId(userId);
    }

    // Attach latest test attempt details if exists
    let latestAttempt: any = null;
    if (app && app.test_attempt_id) {
      const attempt = await assessmentRepo.getAttemptById(app.test_attempt_id);
      if (attempt) {
        latestAttempt = {
          id: attempt.id,
          status: attempt.status,
          totalQuestions: attempt.total_questions,
          correctAnswers: attempt.correct_answers,
          wrongAnswers: attempt.wrong_answers,
          unanswered: attempt.unanswered,
          score: attempt.score,
          percentage: attempt.percentage,
          passed: attempt.passed,
          startedAt: attempt.started_at,
          submittedAt: attempt.submitted_at,
        };
      }
    }

    return {
      application: app,
      latestAttempt,
    };
  },

  // 2. Complete or update student profile details
  updateStudentProfile: async (
    userId: string,
    profile: {
      fullName: string;
      registerNumber: string;
      department: string;
      classSection: string;
      year: number;
      collegeEmail: string;
      phone?: string;
      bio?: string;
      skills?: string[];
      technicalInterests?: string[];
      githubUrl?: string;
      linkedinUrl?: string;
      portfolioUrl?: string;
    }
  ) => {
    // Check if another member has this register number
    const dupCheck = await query(
      `SELECT id FROM members WHERE (register_number = $1 OR college_email = $2) AND user_id != $3`,
      [profile.registerNumber, profile.collegeEmail, userId]
    );
    if (dupCheck.rowCount && dupCheck.rowCount > 0) {
      throw new BadRequestError('Register number or college email is already used by another student');
    }

    // Upsert member profile
    const memRes = await query(
      `INSERT INTO members (
        user_id, full_name, register_number, department, class_section, year, college_email, phone,
        bio, skills, technical_interests, github_url, linkedin_url, portfolio_url, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'Applicant')
      ON CONFLICT (register_number) 
      DO UPDATE SET
        full_name = EXCLUDED.full_name,
        department = EXCLUDED.department,
        class_section = EXCLUDED.class_section,
        year = EXCLUDED.year,
        college_email = EXCLUDED.college_email,
        phone = EXCLUDED.phone,
        bio = EXCLUDED.bio,
        skills = EXCLUDED.skills,
        technical_interests = EXCLUDED.technical_interests,
        github_url = EXCLUDED.github_url,
        linkedin_url = EXCLUDED.linkedin_url,
        portfolio_url = EXCLUDED.portfolio_url,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [
        userId,
        profile.fullName,
        profile.registerNumber,
        profile.department,
        profile.classSection,
        profile.year,
        profile.collegeEmail,
        profile.phone || null,
        profile.bio || null,
        profile.skills || [],
        profile.technicalInterests || [],
        profile.githubUrl || null,
        profile.linkedinUrl || null,
        profile.portfolioUrl || null,
      ]
    );
    const member = memRes.rows[0];

    // Ensure application exists and is TEST_REQUIRED
    let app = await applicationRepo.findByUserId(userId);
    if (!app) {
      const appNumber = generateApplicationNumber();
      app = await applicationRepo.create({
        userId,
        memberId: member.id,
        applicationNumber: appNumber,
        status: 'TEST_REQUIRED',
      });
    } else {
      if (app.status === 'DRAFT') {
        await applicationRepo.updateStatus(app.id, {
          status: 'TEST_REQUIRED',
        });
        app.status = 'TEST_REQUIRED';
      }
    }

    return {
      profile: member,
      application: app,
    };
  },

  // 3. Admin list applications
  listApplications: async (params: any) => {
    return await applicationRepo.listApplications(params);
  },

  // 4. Admin get single application detail
  getApplicationById: async (id: string) => {
    const app = await applicationRepo.findById(id);
    if (!app) {
      throw new NotFoundError('Application not found');
    }

    let attemptDetails = null;
    if (app.test_attempt_id) {
      const attempt = await assessmentRepo.getAttemptById(app.test_attempt_id);
      if (attempt) {
        attemptDetails = {
          id: attempt.id,
          status: attempt.status,
          totalQuestions: attempt.total_questions,
          correctAnswers: attempt.correct_answers,
          wrongAnswers: attempt.wrong_answers,
          unanswered: attempt.unanswered,
          score: attempt.score,
          percentage: attempt.percentage,
          passed: attempt.passed,
          startedAt: attempt.started_at,
          submittedAt: attempt.submitted_at,
          durationMinutes: attempt.submitted_at
            ? Math.round((new Date(attempt.submitted_at).getTime() - new Date(attempt.started_at).getTime()) / 60000)
            : null,
        };
      }
    }

    return {
      application: app,
      attempt: attemptDetails,
    };
  },

  // 5. Admin Decision Review (APPROVE / WAITLIST / REJECT)
  reviewApplication: async (
    applicationId: string,
    adminId: string,
    decision: 'APPROVED' | 'WAITLISTED' | 'REJECTED',
    notes?: string,
    rejectionReason?: string
  ) => {
    const app = await applicationRepo.findById(applicationId);
    if (!app) {
      throw new NotFoundError('Application not found');
    }

    if (decision === 'REJECTED' && !rejectionReason) {
      throw new BadRequestError('A rejection reason is required when rejecting an application');
    }

    const reviewedAt = new Date();

    if (decision === 'APPROVED') {
      // Idempotency: check if already approved
      const existingMembership = await applicationRepo.getMembershipByUserId(app.user_id);
      let memberNumber = existingMembership?.member_number;
      if (!memberNumber) {
        memberNumber = generateMemberNumber();
      }

      // Activate membership record
      const membership = await applicationRepo.activateClubMembership({
        userId: app.user_id,
        memberId: app.member_id,
        memberNumber,
        applicationId: app.id,
        approvedBy: adminId,
      });

      // Update application
      const updatedApp = await applicationRepo.updateStatus(app.id, {
        status: 'APPROVED',
        reviewedAt,
        reviewedBy: adminId,
        adminNotes: notes ?? undefined,
      });

      // Audit Log
      await query(
        `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, after_data)
         VALUES ($1, 'APPLICATION_APPROVED', 'membership_applications', $2, $3::jsonb)`,
        [adminId, app.id, JSON.stringify({ memberNumber, decision: 'APPROVED', notes })]
      );

      // Notification
      try {
        if (app.member_id) {
          await notificationService.createNotification({
            recipient_id: app.member_id,
            type: 'SYSTEM_ANNOUNCEMENT',
            title: 'Welcome to AI CLUB!',
            message: `Congratulations! Your membership application has been APPROVED. Your Member Number is ${memberNumber}. Club features are now fully unlocked!`,
            priority: 'HIGH',
          });
        }
      } catch (e) {
        console.warn('[reviewApplication] Notification failed:', e);
      }

      return {
        success: true,
        decision: 'APPROVED',
        application: updatedApp,
        membership,
        message: 'Application approved and club membership activated successfully.',
      };
    }

    if (decision === 'WAITLISTED') {
      const updatedApp = await applicationRepo.updateStatus(app.id, {
        status: 'WAITLISTED',
        reviewedAt,
        reviewedBy: adminId,
        adminNotes: notes ?? undefined,
      });

      // Audit Log
      await query(
        `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, after_data)
         VALUES ($1, 'APPLICATION_WAITLISTED', 'membership_applications', $2, $3::jsonb)`,
        [adminId, app.id, JSON.stringify({ decision: 'WAITLISTED', notes })]
      );

      // Notification
      try {
        if (app.member_id) {
          await notificationService.createNotification({
            recipient_id: app.member_id,
            type: 'SYSTEM_ANNOUNCEMENT',
            title: 'Application Waitlisted',
            message: 'Your AI CLUB application is currently on the waitlist. Administrators will review your selection during the next review cycle.',
            priority: 'NORMAL',
          });
        }
      } catch (e) {
        console.warn('[reviewApplication] Notification failed:', e);
      }

      return {
        success: true,
        decision: 'WAITLISTED',
        application: updatedApp,
        message: 'Application has been waitlisted.',
      };
    }

    if (decision === 'REJECTED') {
      const updatedApp = await applicationRepo.updateStatus(app.id, {
        status: 'REJECTED',
        reviewedAt,
        reviewedBy: adminId,
        adminNotes: notes ?? undefined,
        rejectionReason,
      });

      // Audit Log
      await query(
        `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, after_data)
         VALUES ($1, 'APPLICATION_REJECTED', 'membership_applications', $2, $3::jsonb)`,
        [adminId, app.id, JSON.stringify({ decision: 'REJECTED', rejectionReason, notes })]
      );

      // Notification
      try {
        if (app.member_id) {
          await notificationService.createNotification({
            recipient_id: app.member_id,
            type: 'SYSTEM_ANNOUNCEMENT',
            title: 'Application Status Updated',
            message: `Your AI CLUB application status has been updated: Not Selected. Reason: ${rejectionReason}`,
            priority: 'NORMAL',
          });
        }
      } catch (e) {
        console.warn('[reviewApplication] Notification failed:', e);
      }

      return {
        success: true,
        decision: 'REJECTED',
        application: updatedApp,
        message: 'Application has been marked as rejected with reason.',
      };
    }

    throw new BadRequestError('Invalid decision. Must be APPROVED, WAITLISTED, or REJECTED');
  },

  // 6. Admin selection analytics
  getAnalytics: async () => {
    return await applicationRepo.getAnalytics();
  },

  // 7. Admin summary counts
  getCounts: async () => {
    return await applicationRepo.getCounts();
  },
};
