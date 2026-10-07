import { config } from '../../config';

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

export class AISafetyService {
  private static userBuckets = new Map<string, RateLimitBucket>();

  /**
   * Check in-memory rate limit for an authenticated student
   */
  public static checkRateLimit(memberId: string, limit = 30, windowMs = 60000): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const bucket = this.userBuckets.get(memberId);

    if (!bucket || now > bucket.resetAt) {
      this.userBuckets.set(memberId, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: limit - 1 };
    }

    if (bucket.count >= limit) {
      return { allowed: false, remaining: 0 };
    }

    bucket.count += 1;
    return { allowed: true, remaining: limit - bucket.count };
  }

  /**
   * Clear rate limit bucket for testing
   */
  public static resetRateLimit(memberId?: string) {
    if (memberId) {
      this.userBuckets.delete(memberId);
    } else {
      this.userBuckets.clear();
    }
  }

  /**
   * Sanitize user prompt to prevent prompt injection and delimit untrusted text
   */
  public static sanitizePrompt(input: string, maxLength = 3000): string {
    if (!input || typeof input !== 'string') return '';
    let cleaned = input.trim();

    if (cleaned.length > maxLength) {
      cleaned = cleaned.slice(0, maxLength);
    }

    // Neutralize dangerous override patterns
    cleaned = cleaned.replace(/system\s*prompt\s*override/gi, '[filtered_instruction]');
    cleaned = cleaned.replace(/ignore\s+(all\s+)?(previous|prior)\s+instructions/gi, '[filtered_instruction]');
    cleaned = cleaned.replace(/reveal\s+(api\s+key|jwt|password|secret)/gi, '[filtered_query]');

    return cleaned;
  }

  /**
   * Wrap untrusted content with boundary fences
   */
  public static fenceUntrustedContent(label: string, content: string): string {
    return `<<<START_${label}>>>\n${content}\n<<<END_${label}>>>`;
  }

  /**
   * Validate that entity IDs in AI recommendations match valid candidates
   */
  public static validateCandidateIds(recommendedIds: string[], validCandidateIds: Set<string>): string[] {
    return recommendedIds.filter(id => validCandidateIds.has(id));
  }

  /**
   * Check if a feature is enabled by global config flags
   */
  public static isFeatureEnabled(featureName: 'recommendations' | 'assistant' | 'skillAnalysis' | 'adminInsights'): boolean {
    if (!config.AI_ENABLED) return false;

    switch (featureName) {
      case 'recommendations':
        return config.AI_RECOMMENDATIONS_ENABLED;
      case 'assistant':
        return config.AI_ASSISTANT_ENABLED;
      case 'skillAnalysis':
        return config.AI_SKILL_ANALYSIS_ENABLED;
      case 'adminInsights':
        return config.AI_ADMIN_INSIGHTS_ENABLED;
      default:
        return true;
    }
  }
}
