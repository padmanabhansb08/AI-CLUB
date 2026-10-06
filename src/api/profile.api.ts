import { apiClient } from './client';
import type {
  MemberProfile,
  ProfileUpdatePayload,
  SkillItem,
  InterestItem,
} from '../types/profile';

export const profileApi = {
  getMyProfile: async (): Promise<MemberProfile> => {
    return apiClient.get<MemberProfile>('/members/me');
  },

  updateProfile: async (data: ProfileUpdatePayload): Promise<MemberProfile> => {
    return apiClient.patch<MemberProfile>('/members/me', data);
  },

  getMySkills: async (): Promise<SkillItem[]> => {
    return apiClient.get<SkillItem[]>('/members/me/skills');
  },

  updateMySkills: async (skills: Array<SkillItem | string>): Promise<SkillItem[]> => {
    return apiClient.put<SkillItem[]>('/members/me/skills', { skills });
  },

  getMyInterests: async (): Promise<InterestItem[]> => {
    return apiClient.get<InterestItem[]>('/members/me/interests');
  },

  updateMyInterests: async (interests: string[]): Promise<InterestItem[]> => {
    return apiClient.put<InterestItem[]>('/members/me/interests', { interests });
  },

  getCatalogSkills: async (): Promise<SkillItem[]> => {
    return apiClient.get<SkillItem[]>('/skills');
  },

  getCatalogInterests: async (): Promise<InterestItem[]> => {
    return apiClient.get<InterestItem[]>('/interests');
  },
};
