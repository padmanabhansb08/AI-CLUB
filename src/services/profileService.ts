import { ApiError } from './apiError';
import type { Member } from '../data/members';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const profileService = {
  getProfile: async (): Promise<Member> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/me/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    if (!response.ok) {
      throw new ApiError(result.error?.message || 'Failed to fetch profile', response.status, result.error?.code);
    }
    return result.data;
  },

  updateProfile: async (data: Partial<Member>): Promise<Member> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/me/profile`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (!response.ok) {
      throw new ApiError(result.error?.message || 'Failed to update profile', response.status, result.error?.code);
    }
    return result.data;
  }
};
