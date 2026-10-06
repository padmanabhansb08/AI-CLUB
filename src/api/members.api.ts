import { apiClient } from './client';
import type { PublicMember, MembersResponse } from '../types/member';

export const membersApi = {
  getPublicMembers: async (
    page = 1,
    limit = 20,
    search?: string,
    department?: string,
    skill?: string
  ): Promise<MembersResponse> => {
    const params: Record<string, string | number | undefined> = {
      page,
      limit,
      search: search || undefined,
      department: department && department !== 'All' ? department : undefined,
      skill: skill || undefined,
    };
    return apiClient.get<MembersResponse>('/members', { params });
  },

  getPublicMemberById: async (id: string): Promise<PublicMember> => {
    return apiClient.get<PublicMember>(`/members/${id}`);
  },
};
