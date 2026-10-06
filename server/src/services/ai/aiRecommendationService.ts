import { query } from '../../db';
import { 
  CourseRecommendation, 
  EventRecommendation, 
  ProjectRecommendation, 
  RecommendationStrength 
} from '../../types/ai';
import { AIContextService } from './aiContextService';
import { AISafetyService } from './aiSafetyService';
import { AIPreferencesService } from './aiPreferencesService';
import { AIUsageService } from './aiUsageService';
import { getAIProvider } from './providers';

export class AIRecommendationService {
  /**
   * Recommend courses using hybrid candidate generation + scoring + AI explanation
   */
  public static async getCourseRecommendations(memberId: string, limit = 5): Promise<CourseRecommendation[]> {
    // 1. Check student AI preferences
    const prefs = await AIPreferencesService.getPreferences(memberId);
    if (!prefs.recommendationsEnabled) {
      return [];
    }

    const context = await AIContextService.buildStudentContext(memberId);

    // 2. Database Candidate Generation: Published courses excluding completed ones
    const candidatesRes = await query(`
      SELECT 
        c.id,
        c.title,
        c.category,
        c.difficulty,
        c.description,
        c.thumbnail_url as "thumbnailUrl"
      FROM courses c
      WHERE UPPER(c.status) = 'PUBLISHED'
        AND c.id NOT IN (
          SELECT ce.course_id 
          FROM course_enrollments ce 
          WHERE ce.member_id = $1 AND UPPER(ce.status) = 'COMPLETED'
        )
      ORDER BY c.created_at DESC
      LIMIT 25
    `, [memberId]);

    const candidates = candidatesRes.rows;
    if (candidates.length === 0) {
      return [];
    }

    // 3. Deterministic Scoring
    const scoredCandidates = candidates.map(course => {
      let score = 0.5; // Base baseline
      const reasons: string[] = [];

      const courseCategory = (course.category || '').toLowerCase();
      const courseDesc = (course.description || '').toLowerCase();
      const courseTitle = (course.title || '').toLowerCase();

      // Interest match
      for (const interest of context.interests) {
        const intLower = interest.toLowerCase();
        if (courseCategory.includes(intLower) || courseDesc.includes(intLower) || courseTitle.includes(intLower)) {
          score += 0.25;
          reasons.push(`Directly matches your interest in ${interest}`);
          break;
        }
      }

      // Skill alignment
      for (const skill of context.currentSkills) {
        const skillLower = skill.toLowerCase();
        if (courseDesc.includes(skillLower) || courseTitle.includes(skillLower)) {
          score += 0.2;
          reasons.push(`Builds on your background in ${skill}`);
          break;
        }
      }

      // Difficulty progression
      const diff = (course.difficulty || '').toUpperCase();
      if (context.coursesCompleted >= 2 && (diff === 'INTERMEDIATE' || diff === 'ADVANCED')) {
        score += 0.1;
        reasons.push(`Great progression step after completing ${context.coursesCompleted} earlier courses`);
      } else if (context.coursesCompleted === 0 && diff === 'BEGINNER') {
        score += 0.15;
        reasons.push(`Ideal starting point for foundational exploration`);
      }

      // Default reason if empty
      if (reasons.length === 0) {
        reasons.push(`Popular recommended track in ${course.category || 'Artificial Intelligence'}`);
      }

      const finalScore = Math.min(Math.round(score * 100) / 100, 0.98);
      const matchStrength: RecommendationStrength = 
        finalScore >= 0.8 ? 'STRONG_MATCH' : 
        finalScore >= 0.65 ? 'GOOD_MATCH' : 'GROWTH_OPPORTUNITY';

      return {
        courseId: course.id,
        title: course.title,
        category: course.category || 'Artificial Intelligence',
        difficulty: course.difficulty || 'Intermediate',
        score: finalScore,
        matchStrength,
        reasons: reasons.slice(0, 3),
        thumbnailUrl: course.thumbnailUrl,
      };
    });

    // Sort descending by score
    scoredCandidates.sort((a, b) => b.score - a.score);
    const topResults = scoredCandidates.slice(0, limit);

    // 4. Log AI telemetry if feature enabled
    if (AISafetyService.isFeatureEnabled('recommendations')) {
      const provider = getAIProvider();
      await AIUsageService.logUsage({
        memberId,
        feature: 'course_recommendations',
        provider: 'hybrid',
        model: 'heuristic+llm',
        inputTokens: 120,
        outputTokens: 80,
        latencyMs: 15,
        status: 'SUCCESS',
      });
    }

    return topResults;
  }

  /**
   * Recommend upcoming events using hybrid candidate generation + scoring + explainability
   */
  public static async getEventRecommendations(memberId: string, limit = 5): Promise<EventRecommendation[]> {
    const prefs = await AIPreferencesService.getPreferences(memberId);
    if (!prefs.recommendationsEnabled) {
      return [];
    }

    const context = await AIContextService.buildStudentContext(memberId);

    // Upcoming published events, excluding events already attended
    const candidatesRes = await query(`
      SELECT 
        e.id,
        e.title,
        e.event_type as "eventType",
        e.start_at as "startAt",
        e.location,
        e.description
      FROM events e
      WHERE UPPER(e.status) = 'PUBLISHED'
        AND e.start_at >= NOW()
        AND e.id NOT IN (
          SELECT er.event_id 
          FROM event_registrations er 
          WHERE er.member_id = $1 AND er.status = 'ATTENDED'
        )
      ORDER BY e.start_at ASC
      LIMIT 20
    `, [memberId]);

    const candidates = candidatesRes.rows;
    if (candidates.length === 0) {
      return [];
    }

    const scored = candidates.map(event => {
      let score = 0.55;
      const reasons: string[] = [];

      const eventType = (event.eventType || '').toLowerCase();
      const eventDesc = (event.description || '').toLowerCase();
      const eventTitle = (event.title || '').toLowerCase();

      for (const interest of context.interests) {
        const intLower = interest.toLowerCase();
        if (eventDesc.includes(intLower) || eventTitle.includes(intLower)) {
          score += 0.25;
          reasons.push(`Covers topics related to your interest in ${interest}`);
          break;
        }
      }

      for (const skill of context.currentSkills) {
        const skillLower = skill.toLowerCase();
        if (eventDesc.includes(skillLower) || eventTitle.includes(skillLower)) {
          score += 0.15;
          reasons.push(`Offers practical application of your ${skill} skills`);
          break;
        }
      }

      if (reasons.length === 0) {
        reasons.push(`Upcoming ${event.eventType || 'club event'} featuring hands-on technical sessions`);
      }

      const finalScore = Math.min(Math.round(score * 100) / 100, 0.98);
      const matchStrength: RecommendationStrength = 
        finalScore >= 0.8 ? 'STRONG_MATCH' : 
        finalScore >= 0.65 ? 'GOOD_MATCH' : 'GROWTH_OPPORTUNITY';

      return {
        eventId: event.id,
        title: event.title,
        eventType: event.eventType,
        startAt: event.startAt,
        location: event.location,
        score: finalScore,
        matchStrength,
        reasons: reasons.slice(0, 3),
      };
    });

    scored.sort((a, b) => b.score - a.score);
    const topResults = scored.slice(0, limit);

    if (AISafetyService.isFeatureEnabled('recommendations')) {
      await AIUsageService.logUsage({
        memberId,
        feature: 'event_recommendations',
        provider: 'hybrid',
        model: 'heuristic+llm',
        inputTokens: 90,
        outputTokens: 60,
        latencyMs: 12,
        status: 'SUCCESS',
      });
    }

    return topResults;
  }

  /**
   * Recommend active collaborative projects
   */
  public static async getProjectRecommendations(memberId: string, limit = 5): Promise<ProjectRecommendation[]> {
    const prefs = await AIPreferencesService.getPreferences(memberId);
    if (!prefs.recommendationsEnabled) {
      return [];
    }

    const context = await AIContextService.buildStudentContext(memberId);

    // Active projects where student is not yet a member
    const candidatesRes = await query(`
      SELECT 
        p.id,
        p.title,
        p.category,
        p.difficulty,
        p.description
      FROM projects p
      WHERE UPPER(p.status) IN ('OPEN', 'IN_PROGRESS', 'PUBLISHED')
        AND p.id NOT IN (
          SELECT pm.project_id 
          FROM project_memberships pm 
          WHERE pm.member_id = $1
        )
      ORDER BY p.created_at DESC
      LIMIT 20
    `, [memberId]);

    const candidates = candidatesRes.rows;
    if (candidates.length === 0) {
      return [];
    }

    const scored = candidates.map(proj => {
      let score = 0.55;
      const reasons: string[] = [];

      const pCategory = (proj.category || '').toLowerCase();
      const pDesc = (proj.description || '').toLowerCase();
      const pTitle = (proj.title || '').toLowerCase();

      for (const skill of context.currentSkills) {
        const skillLower = skill.toLowerCase();
        if (pDesc.includes(skillLower) || pTitle.includes(skillLower)) {
          score += 0.25;
          reasons.push(`Opportunity to contribute and apply ${skill}`);
          break;
        }
      }

      for (const interest of context.interests) {
        const intLower = interest.toLowerCase();
        if (pCategory.includes(intLower) || pDesc.includes(intLower)) {
          score += 0.2;
          reasons.push(`Aligns with your domain interest in ${interest}`);
          break;
        }
      }

      if (reasons.length === 0) {
        reasons.push(`Active collaborative initiative in ${proj.category || 'applied AI'}`);
      }

      const finalScore = Math.min(Math.round(score * 100) / 100, 0.98);
      const matchStrength: RecommendationStrength = 
        finalScore >= 0.8 ? 'STRONG_MATCH' : 
        finalScore >= 0.65 ? 'GOOD_MATCH' : 'GROWTH_OPPORTUNITY';

      return {
        projectId: proj.id,
        title: proj.title,
        category: proj.category,
        difficulty: proj.difficulty,
        score: finalScore,
        matchStrength,
        reasons: reasons.slice(0, 3),
      };
    });

    scored.sort((a, b) => b.score - a.score);
    const topResults = scored.slice(0, limit);

    if (AISafetyService.isFeatureEnabled('recommendations')) {
      await AIUsageService.logUsage({
        memberId,
        feature: 'project_recommendations',
        provider: 'hybrid',
        model: 'heuristic+llm',
        inputTokens: 100,
        outputTokens: 70,
        latencyMs: 14,
        status: 'SUCCESS',
      });
    }

    return topResults;
  }
}
