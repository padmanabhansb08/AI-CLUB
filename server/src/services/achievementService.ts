import { achievementRepo } from '../repositories/achievementRepository';
import { notificationService } from './notificationService';
import { query } from '../db';
import { AppError } from '../errors/AppError';
import type {
  AchievementItem,
  AchievementProgressItem,
  MemberAchievementItem,
} from '../types/achievements';

export const achievementService = {
  // Query metric values for a member
  async getMemberMetrics(memberId: string): Promise<Record<string, number>> {
    const [
      eventRegRes,
      attendanceRes,
      courseEnrRes,
      courseCompRes,
      lessonCompRes,
      projCountRes,
      projCompRes,
      teamPartRes,
      milestoneCompRes,
    ] = await Promise.all([
      query(`SELECT COUNT(*) as count FROM event_registrations WHERE member_id = $1`, [memberId]),
      query(`SELECT COUNT(*) as count FROM event_attendance WHERE member_id = $1 AND status = 'PRESENT'`, [memberId]),
      query(`SELECT COUNT(*) as count FROM course_enrollments WHERE member_id = $1`, [memberId]),
      query(`SELECT COUNT(*) as count FROM course_enrollments WHERE member_id = $1 AND status = 'COMPLETED'`, [memberId]),
      query(`SELECT COUNT(*) as count FROM lesson_progress WHERE member_id = $1 AND status = 'COMPLETED'`, [memberId]),
      query(`SELECT COUNT(*) as count FROM project_memberships WHERE member_id = $1 AND status = 'ACTIVE'`, [memberId]),
      query(
        `SELECT COUNT(p.id) as count
         FROM project_memberships pm
         JOIN projects p ON p.id = pm.project_id
         WHERE pm.member_id = $1 AND pm.status = 'ACTIVE' AND p.status = 'COMPLETED'`,
        [memberId]
      ),
      query(`SELECT COUNT(*) as count FROM project_team_members WHERE member_id = $1 AND status = 'ACTIVE'`, [memberId]),
      query(
        `SELECT COUNT(pm.id) as count
         FROM project_milestones pm
         JOIN project_memberships mem ON mem.project_id = pm.project_id
         WHERE mem.member_id = $1 AND mem.status = 'ACTIVE' AND pm.status = 'COMPLETED'`,
        [memberId]
      ),
    ]);

    return {
      EVENT_COUNT: parseInt(eventRegRes.rows[0]?.count || '0', 10),
      EVENT_ATTENDANCE_COUNT: parseInt(attendanceRes.rows[0]?.count || '0', 10),
      COURSE_ENROLLMENT_COUNT: parseInt(courseEnrRes.rows[0]?.count || '0', 10),
      COURSE_COMPLETION_COUNT: parseInt(courseCompRes.rows[0]?.count || '0', 10),
      LESSON_COMPLETION_COUNT: parseInt(lessonCompRes.rows[0]?.count || '0', 10),
      PROJECT_COUNT: parseInt(projCountRes.rows[0]?.count || '0', 10),
      PROJECT_COMPLETION_COUNT: parseInt(projCompRes.rows[0]?.count || '0', 10),
      TEAM_PARTICIPATION_COUNT: parseInt(teamPartRes.rows[0]?.count || '0', 10),
      MILESTONE_COMPLETION_COUNT: parseInt(milestoneCompRes.rows[0]?.count || '0', 10),
      HACKATHON_PARTICIPATION: 0,
    };
  },

  // Centralized idempotent evaluator
  async evaluateMemberAchievements(memberId: string): Promise<AchievementItem[]> {
    if (!memberId) return [];

    const [allAchievementsRes, memberAchievements, metrics] = await Promise.all([
      achievementRepo.findAll(1, 100, { is_active: true }),
      achievementRepo.getMemberAchievements(memberId),
      achievementService.getMemberMetrics(memberId),
    ]);

    const alreadyEarnedSet = new Set(memberAchievements.map((ma) => ma.achievement_id));
    const newlyAwardedAchievements: AchievementItem[] = [];

    for (const ach of allAchievementsRes.items) {
      if (alreadyEarnedSet.has(ach.id)) continue;

      const criteriaType = ach.criteria_type;
      const target = (ach.criteria_config && ach.criteria_config.target) || 1;
      const currentVal = metrics[criteriaType] || 0;

      if (currentVal >= target) {
        const { newlyAwarded } = await achievementRepo.awardAchievementTransactional(
          memberId,
          ach.id,
          { currentVal, target, evaluatedAt: new Date().toISOString() }
        );

        if (newlyAwarded) {
          newlyAwardedAchievements.push(ach);

          // Trigger persistent notification safely
          try {
            await notificationService.createNotification({
              recipient_id: memberId,
              type: 'ACHIEVEMENT_EARNED',
              title: 'Achievement Unlocked!',
              message: `You earned the "${ach.name}" achievement (+${ach.points} points)!`,
              data: { achievementId: ach.id, points: ach.points, slug: ach.slug },
              priority: 'NORMAL',
            });
          } catch (notifErr) {
            console.error('[evaluateMemberAchievements] Error sending notification:', notifErr);
          }
        }
      }
    }

    return newlyAwardedAchievements;
  },

  // Get all achievements with optional member contextual progress
  async getAllAchievements(
    params: { page?: number; limit?: number; category?: string; search?: string } = {},
    memberId?: string
  ) {
    const res = await achievementRepo.findAll(params.page || 1, params.limit || 50, {
      category: params.category,
      search: params.search,
      is_active: true,
    });

    if (!memberId) {
      return res;
    }

    const [memberAchievements, metrics] = await Promise.all([
      achievementRepo.getMemberAchievements(memberId),
      achievementService.getMemberMetrics(memberId),
    ]);

    const earnedMap = new Map<string, string>();
    memberAchievements.forEach((ma) => earnedMap.set(ma.achievement_id, ma.earned_at));

    const enriched = res.items.map((ach) => {
      const earned = earnedMap.has(ach.id);
      const earned_at = earnedMap.get(ach.id) || null;
      const target = (ach.criteria_config && ach.criteria_config.target) || 1;
      const current = metrics[ach.criteria_type] || 0;
      const progress_percentage = earned ? 100 : Math.min(100, Math.round((current / target) * 100));

      return {
        ...ach,
        earned,
        earned_at,
        current_progress: earned ? target : current,
        target_progress: target,
        progress_percentage,
      };
    });

    return {
      ...res,
      items: enriched,
    };
  },

  // Get single achievement by ID or Slug
  async getAchievementById(idOrSlug: string, memberId?: string) {
    let ach = await achievementRepo.findById(idOrSlug);
    if (!ach) {
      ach = await achievementRepo.findBySlug(idOrSlug);
    }
    if (!ach) {
      throw new AppError(404, 'ACHIEVEMENT_NOT_FOUND', 'Achievement not found');
    }

    if (!memberId) {
      return ach;
    }

    const [memberAch, metrics] = await Promise.all([
      achievementRepo.getMemberAchievement(memberId, ach.id),
      achievementService.getMemberMetrics(memberId),
    ]);

    const earned = !!memberAch;
    const target = (ach.criteria_config && ach.criteria_config.target) || 1;
    const current = metrics[ach.criteria_type] || 0;
    const progress_percentage = earned ? 100 : Math.min(100, Math.round((current / target) * 100));

    return {
      ...ach,
      earned,
      earned_at: memberAch ? memberAch.earned_at : null,
      current_progress: earned ? target : current,
      target_progress: target,
      progress_percentage,
    };
  },

  // Get member's unlocked achievements
  async getMemberAchievements(memberId: string): Promise<MemberAchievementItem[]> {
    return await achievementRepo.getMemberAchievements(memberId);
  },

  // Get full achievement progress map for student
  async getMemberProgress(memberId: string): Promise<AchievementProgressItem[]> {
    const [allRes, memberAchievements, metrics] = await Promise.all([
      achievementRepo.findAll(1, 100, { is_active: true }),
      achievementRepo.getMemberAchievements(memberId),
      achievementService.getMemberMetrics(memberId),
    ]);

    const earnedMap = new Map<string, string>();
    memberAchievements.forEach((ma) => earnedMap.set(ma.achievement_id, ma.earned_at));

    return allRes.items.map((ach) => {
      const earned = earnedMap.has(ach.id);
      const earned_at = earnedMap.get(ach.id) || null;
      const target = (ach.criteria_config && ach.criteria_config.target) || 1;
      const current = metrics[ach.criteria_type] || 0;
      const percentage = earned ? 100 : Math.min(100, Math.round((current / target) * 100));

      return {
        achievement: {
          ...ach,
          earned,
          earned_at,
          current_progress: earned ? target : current,
          target_progress: target,
          progress_percentage: percentage,
        },
        progress: {
          current: earned ? target : current,
          target,
          percentage,
        },
        earned,
        earned_at,
      };
    });
  },

  // Member points & counts
  async getMemberStats(memberId: string) {
    return await achievementRepo.getMemberStats(memberId);
  },

  // Admin: Create
  async createAchievement(data: any): Promise<AchievementItem> {
    if (!data.name && !data.title) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Achievement name is required');
    }
    if (!data.description) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Achievement description is required');
    }
    return await achievementRepo.create(data);
  },

  // Admin: Update
  async updateAchievement(id: string, data: any): Promise<AchievementItem> {
    const existing = await achievementRepo.findById(id);
    if (!existing) {
      throw new AppError(404, 'ACHIEVEMENT_NOT_FOUND', 'Achievement not found');
    }
    return await achievementRepo.update(id, data);
  },

  // Admin: Activate/Deactivate
  async activateAchievement(id: string): Promise<AchievementItem> {
    const existing = await achievementRepo.findById(id);
    if (!existing) throw new AppError(404, 'ACHIEVEMENT_NOT_FOUND', 'Achievement not found');
    return await achievementRepo.setActiveStatus(id, true);
  },

  async deactivateAchievement(id: string): Promise<AchievementItem> {
    const existing = await achievementRepo.findById(id);
    if (!existing) throw new AppError(404, 'ACHIEVEMENT_NOT_FOUND', 'Achievement not found');
    return await achievementRepo.setActiveStatus(id, false);
  },

  // Admin: Delete
  async deleteAchievement(id: string): Promise<void> {
    const existing = await achievementRepo.findById(id);
    if (!existing) throw new AppError(404, 'ACHIEVEMENT_NOT_FOUND', 'Achievement not found');
    await achievementRepo.delete(id);
  },

  // Admin: Stats
  async getAchievementStats(id: string) {
    const existing = await achievementRepo.findById(id);
    if (!existing) throw new AppError(404, 'ACHIEVEMENT_NOT_FOUND', 'Achievement not found');
    const stats = await achievementRepo.getAchievementStats(id);
    return { achievement: existing, ...stats };
  },

  async getAdminGlobalStats() {
    return await achievementRepo.getGlobalStats();
  },
};
