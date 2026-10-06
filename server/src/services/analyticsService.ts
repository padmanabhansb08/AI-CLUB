import { analyticsRepository, DateRange } from '../repositories/analyticsRepository';
import { ValidationError } from '../errors/AppError';

export function parseDateRange(range?: string, from?: string, to?: string): DateRange {
  const now = new Date();
  let fromDate: Date;
  let toDate: Date = now;
  const normalizedRange = (range || '30d').toLowerCase();

  switch (normalizedRange) {
    case 'today': {
      fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      toDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    }
    case '7d': {
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    }
    case '30d': {
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    }
    case '90d': {
      fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    }
    case 'this_year': {
      fromDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
      break;
    }
    case 'custom': {
      if (!from || !to) {
        throw new ValidationError('Both "from" and "to" parameters are required for custom date range');
      }
      fromDate = new Date(from);
      toDate = new Date(to);
      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        throw new ValidationError('Invalid date format for "from" or "to"');
      }
      if (fromDate > toDate) {
        throw new ValidationError('"from" date must be earlier than "to" date');
      }
      break;
    }
    default: {
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    }
  }

  return {
    range: normalizedRange,
    from: fromDate.toISOString(),
    to: toDate.toISOString(),
  };
}

export const analyticsService = {
  getDashboardKPIs: async (range?: string, from?: string, to?: string) => {
    const dr = parseDateRange(range, from, to);
    return await analyticsRepository.getPlatformKPIs(dr);
  },

  getMemberAnalytics: async (range?: string, from?: string, to?: string) => {
    const dr = parseDateRange(range, from, to);
    return await analyticsRepository.getMemberAnalytics(dr);
  },

  getEventAnalytics: async (range?: string, from?: string, to?: string) => {
    const dr = parseDateRange(range, from, to);
    return await analyticsRepository.getEventAnalytics(dr);
  },

  getProjectAnalytics: async (range?: string, from?: string, to?: string) => {
    const dr = parseDateRange(range, from, to);
    return await analyticsRepository.getProjectAnalytics(dr);
  },

  getCourseAnalytics: async (range?: string, from?: string, to?: string) => {
    const dr = parseDateRange(range, from, to);
    return await analyticsRepository.getCourseAnalytics(dr);
  },

  getAchievementAnalytics: async (range?: string, from?: string, to?: string) => {
    const dr = parseDateRange(range, from, to);
    return await analyticsRepository.getAchievementAnalytics(dr);
  },

  getEngagementAnalytics: async (range?: string, from?: string, to?: string) => {
    const dr = parseDateRange(range, from, to);
    return await analyticsRepository.getEngagementAnalytics(dr);
  },
};
