import { query } from '../../db';

export interface LogAIUsageParams {
  memberId?: string;
  feature: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  status?: string;
  estimatedCost?: number;
}

export class AIUsageService {
  /**
   * Record AI execution telemetry into ai_usage table
   */
  public static async logUsage(params: LogAIUsageParams): Promise<void> {
    try {
      // Estimated cost calculation based on standard rates ($0.15/1M input, $0.60/1M output)
      const cost = params.estimatedCost ?? 
        ((params.inputTokens * 0.00000015) + (params.outputTokens * 0.0000006));

      await query(
        `INSERT INTO ai_usage 
          (member_id, feature, provider, model, input_tokens, output_tokens, latency_ms, status, estimated_cost)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          params.memberId || null,
          params.feature,
          params.provider,
          params.model,
          params.inputTokens,
          params.outputTokens,
          params.latencyMs,
          params.status || 'SUCCESS',
          cost,
        ]
      );
    } catch (err) {
      // Observability failures should never crash primary user requests
      console.error('[AIUsageService] Error logging telemetry:', err);
    }
  }

  /**
   * Get aggregated AI analytics for administrators
   */
  public static async getAdminTelemetry(): Promise<{
    totalRequests: number;
    successRatePct: number;
    avgLatencyMs: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalEstimatedCost: number;
    byFeature: Array<{ feature: string; count: number }>;
  }> {
    const res = await query(`
      SELECT 
        COUNT(*)::int as total_requests,
        ROUND((COUNT(*) FILTER (WHERE status = 'SUCCESS')::numeric / GREATEST(COUNT(*), 1)::numeric) * 100)::int as success_rate,
        ROUND(COALESCE(AVG(latency_ms), 0))::int as avg_latency,
        COALESCE(SUM(input_tokens), 0)::int as total_input_tokens,
        COALESCE(SUM(output_tokens), 0)::int as total_output_tokens,
        COALESCE(SUM(estimated_cost), 0)::numeric(10, 4) as total_cost
      FROM ai_usage
    `);

    const byFeatureRes = await query(`
      SELECT feature, COUNT(*)::int as count
      FROM ai_usage
      GROUP BY feature
      ORDER BY count DESC
    `);

    const row = res.rows[0] || {};
    return {
      totalRequests: row.total_requests || 0,
      successRatePct: row.success_rate || 100,
      avgLatencyMs: row.avg_latency || 0,
      totalInputTokens: row.total_input_tokens || 0,
      totalOutputTokens: row.total_output_tokens || 0,
      totalEstimatedCost: parseFloat(row.total_cost || '0'),
      byFeature: byFeatureRes.rows || [],
    };
  }
}
