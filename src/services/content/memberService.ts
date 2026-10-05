import type { Member } from '../../data/members';
import { apiClient } from '../../api/client';

export const memberService = {
  getMembers: async (page = 1, limit = 20, search?: string, department?: string) => {
    try {
      const params: Record<string, string | number | undefined> = {
        page,
        limit,
        search,
        department,
      };
      return await apiClient.get<any>('/admin/members', { params });
    } catch (e) {
      console.error('Failed to fetch members:', e);
      return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
    }
  },

  getMemberById: async (id: string): Promise<Member> => {
    return apiClient.get<Member>(`/admin/members/${id}`);
  },
};
