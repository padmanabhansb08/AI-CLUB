import { apiClient } from '../../api/client';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: string;
  priority: string;
  status: string;
  publishedAt: string | null;
  expiresAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  read?: boolean;
}

export const announcementService = {
  async getVisibleAnnouncements(page: number = 1, limit: number = 20) {
    const res = await apiClient.get<any>('/announcements', { params: { page, limit } });
    const list = Array.isArray(res) ? res : (res?.data || res?.items || []);
    return {
      data: list as Announcement[],
      pagination: res?.pagination || { page, limit, total: list.length, totalPages: 1 },
    };
  },

  async getUnreadCount(): Promise<number> {
    const data = await apiClient.get<{ count: number }>('/me/announcements/unread-count');
    return data?.count || 0;
  },

  async getById(id: string): Promise<Announcement> {
    return apiClient.get<Announcement>(`/announcements/${id}`);
  },

  async markAsRead(id: string) {
    return apiClient.post(`/me/announcements/${id}/read`);
  },

  // Admin routes
  async getAllAdmin() {
    return apiClient.get<Announcement[]>('/admin/announcements');
  },

  async create(data: Partial<Announcement>) {
    return apiClient.post<Announcement>('/admin/announcements', data);
  },

  async update(id: string, data: Partial<Announcement>) {
    return apiClient.patch<Announcement>(`/admin/announcements/${id}`, data);
  },

  async delete(id: string) {
    return apiClient.delete(`/admin/announcements/${id}`);
  },
};
