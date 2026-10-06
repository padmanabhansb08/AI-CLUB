import { query } from '../../db';
import { AISafetyService } from './aiSafetyService';

export interface AISearchResultItem {
  type: 'COURSE' | 'EVENT' | 'PROJECT';
  id: string;
  title: string;
  snippet: string;
  category?: string;
  url: string;
  score: number;
}

export class AISearchService {
  /**
   * Search across published courses, events, and projects using query tokens
   */
  public static async search(searchTerm: string, limit = 10): Promise<AISearchResultItem[]> {
    const sanitized = AISafetyService.sanitizePrompt(searchTerm, 100);
    if (!sanitized || sanitized.trim().length === 0) {
      return [];
    }

    const likeTerm = `%${sanitized.trim()}%`;
    const results: AISearchResultItem[] = [];

    // 1. Search Courses
    const coursesRes = await query(`
      SELECT id, title, category, description, difficulty
      FROM courses
      WHERE UPPER(status) = 'PUBLISHED'
        AND (title ILIKE $1 OR description ILIKE $1 OR category ILIKE $1)
      LIMIT $2
    `, [likeTerm, limit]);

    for (const c of coursesRes.rows) {
      results.push({
        type: 'COURSE',
        id: c.id,
        title: c.title,
        snippet: c.description ? c.description.slice(0, 140) + '...' : 'Interactive AI CLUB Course',
        category: c.category,
        url: `/courses/${c.id}`,
        score: c.title.toLowerCase().includes(sanitized.toLowerCase()) ? 0.95 : 0.8,
      });
    }

    // 2. Search Events
    const eventsRes = await query(`
      SELECT id, title, event_type as "eventType", description
      FROM events
      WHERE UPPER(status) = 'PUBLISHED'
        AND (title ILIKE $1 OR description ILIKE $1 OR event_type ILIKE $1)
      LIMIT $2
    `, [likeTerm, limit]);

    for (const e of eventsRes.rows) {
      results.push({
        type: 'EVENT',
        id: e.id,
        title: e.title,
        snippet: e.description ? e.description.slice(0, 140) + '...' : `AI CLUB ${e.eventType} event`,
        category: e.eventType,
        url: `/events/${e.id}`,
        score: e.title.toLowerCase().includes(sanitized.toLowerCase()) ? 0.92 : 0.78,
      });
    }

    // 3. Search Projects
    const projectsRes = await query(`
      SELECT id, title, category, description
      FROM projects
      WHERE UPPER(status) IN ('OPEN', 'IN_PROGRESS', 'PUBLISHED')
        AND (title ILIKE $1 OR description ILIKE $1 OR category ILIKE $1)
      LIMIT $2
    `, [likeTerm, limit]);

    for (const p of projectsRes.rows) {
      results.push({
        type: 'PROJECT',
        id: p.id,
        title: p.title,
        snippet: p.description ? p.description.slice(0, 140) + '...' : 'Collaborative AI Initiative',
        category: p.category,
        url: `/projects/${p.id}`,
        score: p.title.toLowerCase().includes(sanitized.toLowerCase()) ? 0.9 : 0.75,
      });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }
}
