import type { Member } from '../data/members';
import { apiClient } from '../api/client';

export const profileService = {
  getProfile: async (): Promise<Member> => {
    return apiClient.get<Member>('/me/profile');
  },

  updateProfile: async (data: Partial<Member>): Promise<Member> => {
    return apiClient.patch<Member>('/me/profile', data);
  },
};
