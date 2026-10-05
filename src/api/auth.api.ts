import { apiClient } from './client';

export interface User {
  id: string;
  userId?: string;
  email: string;
  role: 'student' | 'admin' | string;
  memberId?: string;
  fullName?: string;
  registerNumber?: string;
  department?: string;
  classSection?: string;
  year?: number;
  collegeEmail?: string;
  phone?: string;
  status?: string;
  bio?: string;
  skills?: string[];
  technicalInterests?: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  registerNumber: string;
  department: string;
  classSection: string;
  year: number;
  collegeEmail?: string;
  phone?: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/register', data);
  },

  getMe: async (): Promise<User> => {
    return apiClient.get<User>('/auth/me');
  },

  logout: async (): Promise<{ success: boolean }> => {
    try {
      return await apiClient.post<{ success: boolean }>('/auth/logout');
    } catch {
      // Even if network fails during logout, proceed with client cleanup
      return { success: true };
    }
  },
};
