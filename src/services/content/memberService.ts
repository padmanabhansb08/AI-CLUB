import type { Member } from '../../data/members';
import { apiClient } from '../../api/client';
import { membersApi } from '../../api/members.api';

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

  getPublicMembers: async (
    page = 1,
    limit = 20,
    search?: string,
    department?: string,
    _year?: string,
    skill?: string,
    _interest?: string
  ) => {
    try {
      return await membersApi.getPublicMembers(page, limit, search, department, skill);
    } catch (e) {
      console.error('Failed to fetch public members:', e);
      return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
    }
  },

  getPublicMemberById: async (id: string) => {
    try {
      return await membersApi.getPublicMemberById(id);
    } catch (e) {
      console.error('Failed to fetch public member details:', e);
      throw e;
    }
  },
};
