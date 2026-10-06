import { query } from '../../db';
import { AIPreferences } from '../../types/ai';

export class AIPreferencesService {
  /**
   * Get student's AI preferences, initializing default opt-ins if none exist yet
   */
  public static async getPreferences(memberId: string): Promise<AIPreferences> {
    const res = await query(
      `SELECT 
        member_id as "memberId",
        recommendations_enabled as "recommendationsEnabled",
        assistant_enabled as "assistantEnabled",
        learning_insights_enabled as "learningInsightsEnabled",
        weekly_summary_enabled as "weeklySummaryEnabled",
        updated_at as "updatedAt"
       FROM ai_preferences
       WHERE member_id = $1`,
      [memberId]
    );

    if (res.rows.length > 0) {
      return res.rows[0];
    }

    // Insert default preferences if not yet present
    const insertRes = await query(
      `INSERT INTO ai_preferences (member_id)
       VALUES ($1)
       ON CONFLICT (member_id) DO UPDATE SET updated_at = NOW()
       RETURNING 
        member_id as "memberId",
        recommendations_enabled as "recommendationsEnabled",
        assistant_enabled as "assistantEnabled",
        learning_insights_enabled as "learningInsightsEnabled",
        weekly_summary_enabled as "weeklySummaryEnabled",
        updated_at as "updatedAt"`,
      [memberId]
    );

    return insertRes.rows[0];
  }

  /**
   * Update student's AI preferences
   */
  public static async updatePreferences(
    memberId: string,
    prefs: Partial<{
      recommendationsEnabled: boolean;
      assistantEnabled: boolean;
      learningInsightsEnabled: boolean;
      weeklySummaryEnabled: boolean;
    }>
  ): Promise<AIPreferences> {
    // Ensure row exists
    await this.getPreferences(memberId);

    const res = await query(
      `UPDATE ai_preferences
       SET 
        recommendations_enabled = COALESCE($1, recommendations_enabled),
        assistant_enabled = COALESCE($2, assistant_enabled),
        learning_insights_enabled = COALESCE($3, learning_insights_enabled),
        weekly_summary_enabled = COALESCE($4, weekly_summary_enabled),
        updated_at = NOW()
       WHERE member_id = $5
       RETURNING 
        member_id as "memberId",
        recommendations_enabled as "recommendationsEnabled",
        assistant_enabled as "assistantEnabled",
        learning_insights_enabled as "learningInsightsEnabled",
        weekly_summary_enabled as "weeklySummaryEnabled",
        updated_at as "updatedAt"`,
      [
        prefs.recommendationsEnabled,
        prefs.assistantEnabled,
        prefs.learningInsightsEnabled,
        prefs.weeklySummaryEnabled,
        memberId,
      ]
    );

    return res.rows[0];
  }
}
