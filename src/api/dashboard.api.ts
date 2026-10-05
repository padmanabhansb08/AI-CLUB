import { apiClient } from './client';
import type { DashboardData } from '../types/dashboard';

export const dashboardApi = {
  getDashboardData: async (): Promise<DashboardData> => {
    return apiClient.get<DashboardData>('/dashboard');
  },
};
