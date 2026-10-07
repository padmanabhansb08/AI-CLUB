import { query } from '../../db';
import { StudentDashboardInsights, AdminAIInsights } from '../../types/ai';
import { AIRecommendationService } from './aiRecommendationService';
import { AIContextService } from './aiContextService';
import { AIUsageService } from './aiUsageService';
import { analyticsRepository } from '../../repositories/analyticsRepository';
import { parseDateRange } from '../analyticsService';

export class AIInsightService {
  /**
   * Generates grounded student dashboard insights
   */
  public static async getStudentDashboardInsights(memberId: string): Promise<StudentDashboardInsights> {
    const context = await AIContextService.buildStudentContext(memberId);

    // Fetch top recommendations
    const [courses, events, projects] = await Promise.all([
      AIRecommendationService.getCourseRecommendations(memberId, 2),
      AIRecommendationService.getEventRecommendations(memberId, 1),
      AIRecommendationService.getProjectRecommendations(memberId, 1),
    ]);

    // Next best action calculation based on real state
    let nextBestAction = 'Explore our featured course catalog to begin building technical skills.';

    if (context.activeCourseTitles.length > 0) {
      nextBestAction = `Resume learning: continue your lessons in "${context.activeCourseTitles[0]}".`;
    } else if (events.length > 0) {
      nextBestAction = `Register for upcoming event: "${events[0].title}" to collaborate with club members.`;
    } else if (projects.length > 0) {
      nextBestAction = `Explore project collaboration in "${projects[0].title}".`;
    }

    // Weekly highlights from real database records in the last 7 days
    const weeklyHighlights: string[] = [];
    if (context.coursesCompleted > 0) {
      weeklyHighlights.push(`${context.coursesCompleted} completed courses milestone`);
    }
    if (context.eventsAttended > 0) {
      weeklyHighlights.push(`${context.eventsAttended} workshop & technical event check-ins`);
    }
    if (context.projectTitles.length > 0) {
      weeklyHighlights.push(`Collaborating on ${context.projectTitles.length} active project(s)`);
    }
    if (weeklyHighlights.length === 0) {
      weeklyHighlights.push('Welcome to AI CLUB — explore courses and projects to build your portfolio');
    }

    const skillSummary = context.currentSkills.length > 0
      ? `Active technical profile: proficient in ${context.currentSkills.slice(0, 3).join(', ')}.`
      : 'Begin building your identity by adding technical skills in your profile.';

    return {
      recommendedCourses: courses,
      recommendedEvents: events,
      recommendedProjects: projects,
      nextBestAction,
      skillSummary,
      weeklyHighlights,
    };
  }

  /**
   * Generates executive AI insights for administrators from aggregated platform analytics
   */
  public static async getAdminAIInsights(): Promise<AdminAIInsights> {
    const dateRange = parseDateRange('30d');
    const [kpiRes, telemetry] = await Promise.all([
      analyticsRepository.getPlatformKPIs(dateRange),
      AIUsageService.getAdminTelemetry(),
    ]);

    const mem = kpiRes.members;
    const evt = kpiRes.events;
    const lrn = kpiRes.learning;
    const prj = kpiRes.projects;

    const observations: string[] = [
      `Active member base stands at ${mem.active} (${mem.newInPeriod} new joins in current 30-day window).`,
      `Event attendance conversion is healthy at ${evt.attendanceRate}% across ${evt.total} published events.`,
      `Course completion efficiency is currently ${lrn.completionRate}% with ${lrn.totalEnrollments} total enrollments.`,
      `Club collaboration includes ${prj.active} active projects across ${prj.activeTeams} teams.`,
    ];

    const areasToInvestigate: string[] = [
      lrn.completionRate < 50 
        ? 'Course completion rate is under 50%; consider adding milestone check-ins or course discussion channels.'
        : 'Curriculum completion rate is strong; consider introducing advanced capstone projects.',
      evt.attendanceRate < 70
        ? 'Attendance rate could be boosted by sending 24-hour reminder notifications before events.'
        : 'High event engagement observed; great time to announce upcoming club hackathons.',
    ];

    const executiveSummary = 
      `AI CLUB exhibits steady technical engagement with ${mem.total} registered members. Event attendance rate is at ${evt.attendanceRate}%, and ${prj.active} collaborative projects are underway. Telemetry indicates healthy platform activity.`;

    return {
      executiveSummary,
      observations,
      areasToInvestigate,
      generatedAt: new Date().toISOString(),
      telemetry: {
        totalRequests: telemetry.totalRequests,
        avgLatencyMs: telemetry.avgLatencyMs,
        errorRatePct: 100 - telemetry.successRatePct,
      },
    };
  }
}
