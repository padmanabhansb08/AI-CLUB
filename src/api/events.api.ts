import { apiClient } from './client';
import type { 
  EventItem, 
  StudentRegistrationItem, 
  EventAttendanceData, 
  AttendeeItem 
} from '../types/events';

export interface EventFilterParams extends Record<string, string | number | boolean | undefined> {
  page?: number;
  limit?: number;
  eventType?: string;
  status?: string;
  search?: string;
  upcoming?: boolean;
  past?: boolean;
  from?: string;
  to?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedEventsResponse {
  data: EventItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const eventsApi = {
  // Public & Student Endpoints
  async getEvents(params: EventFilterParams = {}): Promise<PaginatedEventsResponse> {
    return apiClient.get<PaginatedEventsResponse>('/events', { params });
  },

  async getEventById(id: string): Promise<EventItem> {
    const res = await apiClient.get<any>(`/events/${id}`);
    return res.data || res;
  },

  async register(id: string): Promise<{ registration: any }> {
    const res = await apiClient.post<any>(`/events/${id}/register`);
    return res.data || res;
  },

  async cancelRegistration(id: string, reason?: string): Promise<{ registration: any }> {
    const res = await apiClient.delete<any>(`/events/${id}/register`, reason ? {
      body: JSON.stringify({ reason }),
    } : undefined);
    return res.data || res;
  },

  async getMyRegistrations(): Promise<StudentRegistrationItem[]> {
    const res = await apiClient.get<any>('/events/me/registrations');
    return res.data || res;
  },

  // Admin Endpoints
  async getAdminEvents(params: EventFilterParams = {}): Promise<PaginatedEventsResponse> {
    return apiClient.get<PaginatedEventsResponse>('/admin/events', { params });
  },

  async getAdminEventById(id: string): Promise<EventItem> {
    const res = await apiClient.get<any>(`/admin/events/${id}`);
    return res.data || res;
  },

  async createEvent(data: Partial<EventItem>): Promise<EventItem> {
    const res = await apiClient.post<any>('/admin/events', data);
    return res.data || res;
  },

  async updateEvent(id: string, data: Partial<EventItem>): Promise<EventItem> {
    const res = await apiClient.patch<any>(`/admin/events/${id}`, data);
    return res.data || res;
  },

  async publishEvent(id: string): Promise<EventItem> {
    const res = await apiClient.post<any>(`/admin/events/${id}/publish`);
    return res.data || res;
  },

  async cancelEvent(id: string, reason: string): Promise<EventItem> {
    const res = await apiClient.post<any>(`/admin/events/${id}/cancel`, { reason });
    return res.data || res;
  },

  async completeEvent(id: string, force = false): Promise<EventItem> {
    const res = await apiClient.post<any>(`/admin/events/${id}/complete`, { force });
    return res.data || res;
  },

  async deleteEvent(id: string): Promise<void> {
    await apiClient.delete(`/admin/events/${id}`);
  },

  async getRegistrations(id: string, search?: string): Promise<AttendeeItem[]> {
    const res = await apiClient.get<any>(`/admin/events/${id}/registrations`, {
      params: search ? { search } : undefined,
    });
    return res.data || res;
  },

  async getAttendance(id: string): Promise<EventAttendanceData> {
    const res = await apiClient.get<any>(`/admin/events/${id}/attendance`);
    return res.data || res;
  },

  async markAttendance(
    id: string,
    records: Array<{ memberId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' }>
  ): Promise<any> {
    const res = await apiClient.put<any>(`/admin/events/${id}/attendance`, { records });
    return res.data || res;
  },

  async bulkMarkAttendance(
    id: string,
    memberIds: string[],
    status: 'PRESENT' | 'ABSENT' | 'LATE'
  ): Promise<any> {
    const res = await apiClient.post<any>(`/admin/events/${id}/attendance/bulk`, {
      memberIds,
      status,
    });
    return res.data || res;
  },

  async checkIn(
    id: string,
    memberId: string,
    status: 'PRESENT' | 'ABSENT' | 'LATE' = 'PRESENT'
  ): Promise<any> {
    const res = await apiClient.post<any>(`/admin/events/${id}/attendance/check-in`, {
      memberId,
      status,
    });
    return res.data || res;
  },
};
