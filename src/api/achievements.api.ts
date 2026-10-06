import { apiClient } from './client';
import type {
  AchievementItem,
  MemberAchievementItem,
  AchievementProgressItem,
  MemberAchievementStats,
  AdminAchievementStats,
  AdminGlobalAchievementStats,
} from '../types/achievements';

export interface AchievementSearchParams {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedAchievementsResponse {
  items: AchievementItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const achievementsApi = {
  // Public / Student Catalog
  getAchievements: async (params: AchievementSearchParams = {}): Promise<PaginatedAchievementsResponse> => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'ALL') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiClient.get<any>(`/achievements${qs}`);
    const items = res?.data || (Array.isArray(res) ? res : []);
    const pagination = res?.pagination || {
      page: params.page || 1,
      limit: params.limit || 50,
      total: items.length,
      totalPages: 1,
    };
    return { items, pagination };
  },

  getAchievement: async (idOrSlug: string): Promise<AchievementItem> => {
    const res = await apiClient.get<any>(`/achievements/${idOrSlug}`);
    return res?.data ?? res;
  },

  getMyAchievements: async (): Promise<MemberAchievementItem[]> => {
    const res = await apiClient.get<any>('/achievements/me');
    return res?.data ?? (Array.isArray(res) ? res : []);
  },

  getMyProgress: async (): Promise<AchievementProgressItem[]> => {
    const res = await apiClient.get<any>('/achievements/me/progress');
    return res?.data ?? (Array.isArray(res) ? res : []);
  },

  getMyStats: async (): Promise<MemberAchievementStats> => {
    const res = await apiClient.get<any>('/achievements/me/stats');
    return res?.data ?? { totalEarned: 0, totalPoints: 0, totalActiveAchievements: 0, inProgressCount: 0 };
  },

  evaluateMyAchievements: async (): Promise<{ newlyAwardedCount: number; newlyAwarded: AchievementItem[] }> => {
    const res = await apiClient.post<any>('/achievements/me/evaluate', {});
    return res?.data ?? { newlyAwardedCount: 0, newlyAwarded: [] };
  },

  getMemberAchievements: async (memberId: string): Promise<MemberAchievementItem[]> => {
    const res = await apiClient.get<any>(`/members/${memberId}/achievements`);
    return res?.data ?? (Array.isArray(res) ? res : []);
  },

  // Admin APIs
  createAchievement: async (data: Partial<AchievementItem>): Promise<AchievementItem> => {
    const res = await apiClient.post<any>('/admin/achievements', data);
    return res?.data ?? res;
  },

  updateAchievement: async (id: string, data: Partial<AchievementItem>): Promise<AchievementItem> => {
    const res = await apiClient.patch<any>(`/admin/achievements/${id}`, data);
    return res?.data ?? res;
  },

  activateAchievement: async (id: string): Promise<AchievementItem> => {
    const res = await apiClient.post<any>(`/admin/achievements/${id}/activate`, {});
    return res?.data ?? res;
  },

  deactivateAchievement: async (id: string): Promise<AchievementItem> => {
    const res = await apiClient.post<any>(`/admin/achievements/${id}/deactivate`, {});
    return res?.data ?? res;
  },

  deleteAchievement: async (id: string): Promise<void> => {
    await apiClient.delete<any>(`/admin/achievements/${id}`);
  },

  getAchievementStats: async (id: string): Promise<AdminAchievementStats> => {
    const res = await apiClient.get<any>(`/admin/achievements/${id}/stats`);
    return res?.data ?? res;
  },

  getGlobalStats: async (): Promise<AdminGlobalAchievementStats> => {
    const res = await apiClient.get<any>('/admin/achievements/stats/global');
    return res?.data ?? res;
  },
};
