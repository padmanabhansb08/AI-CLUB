import { apiClient } from './client';
import type {
  NotificationItem,
  NotificationPreferences,
  MemberActivityItem,
  AdminAnnouncementPayload,
  AnnouncementHistoryItem,
} from '../types/notifications';

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface PaginatedNotificationsResponse {
  items: NotificationItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    unreadCount: number;
  };
}

export interface PaginatedAdminHistoryResponse {
  items: AnnouncementHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    stats: {
      totalSent: number;
      uniqueRecipients: number;
      readCount: number;
      readRate: number;
    };
  };
}

export const notificationsApi = {
  // Student Notifications
  getNotifications: async (params: NotificationQueryParams = {}): Promise<PaginatedNotificationsResponse> => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.unreadOnly) query.append('unreadOnly', 'true');

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiClient.get<any>(`/notifications${qs}`);
    const items = res?.data || (Array.isArray(res) ? res : []);
    const pagination = res?.pagination || {
      page: params.page || 1,
      limit: params.limit || 20,
      total: items.length,
      totalPages: 1,
      unreadCount: 0,
    };
    return { items, pagination };
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await apiClient.get<any>('/notifications/unread-count');
    return res?.data?.count ?? (typeof res?.count === 'number' ? res.count : 0);
  },

  markAsRead: async (id: string): Promise<NotificationItem> => {
    const res = await apiClient.post<any>(`/notifications/${id}/read`, {});
    window.dispatchEvent(new Event('aiclub:notifications-changed'));
    return res?.data ?? res;
  },

  markAllAsRead: async (): Promise<{ updatedCount: number }> => {
    const res = await apiClient.post<any>('/notifications/read-all', {});
    window.dispatchEvent(new Event('aiclub:notifications-changed'));
    return res?.data ?? { updatedCount: 0 };
  },

  getPreferences: async (): Promise<NotificationPreferences> => {
    const res = await apiClient.get<any>('/notifications/preferences');
    return res?.data ?? res;
  },

  updatePreferences: async (preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> => {
    const res = await apiClient.patch<any>('/notifications/preferences', preferences);
    return res?.data ?? res;
  },

  getActivity: async (limit = 20): Promise<MemberActivityItem[]> => {
    const res = await apiClient.get<any>(`/notifications/activity?limit=${limit}`);
    return res?.data ?? (Array.isArray(res) ? res : []);
  },

  // Admin APIs
  sendAnnouncement: async (
    payload: AdminAnnouncementPayload
  ): Promise<{ announcement: any; recipientCount: number }> => {
    const res = await apiClient.post<any>('/admin/notifications/announcements', payload);
    return res?.data ?? res;
  },

  getAdminHistory: async (params: { page?: number; limit?: number } = {}): Promise<PaginatedAdminHistoryResponse> => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiClient.get<any>(`/admin/notifications/history${qs}`);
    const items = res?.data || (Array.isArray(res) ? res : []);
    const pagination = res?.pagination || {
      page: params.page || 1,
      limit: params.limit || 20,
      total: items.length,
      totalPages: 1,
      stats: { totalSent: 0, uniqueRecipients: 0, readCount: 0, readRate: 0 },
    };
    return { items, pagination };
  },
};
