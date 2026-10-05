import { apiClient } from '../../api/client';

export interface EventType {
  id: string;
  title: string;
  description: string;
  event_type: string;
  start_at: string;
  end_at: string;
  location?: string;
  meeting_url?: string;
  organizer?: string;
  capacity?: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  registration_open_at?: string;
  registration_close_at?: string;
  created_at: string;
  updated_at: string;
  registration_count?: string | number;
  currentStudentRegistrationStatus?: 'registered' | 'unregistered';
}

export const eventService = {
  // Public / Student
  async getEvents(page = 1, limit = 10, filters: any = {}) {
    return apiClient.get<any>('/events', { params: { page, limit, ...filters } });
  },

  async getEventById(id: string): Promise<EventType> {
    return apiClient.get<EventType>(`/events/${id}`);
  },

  async register(id: string) {
    return apiClient.post(`/me/events/${id}/register`);
  },

  async unregister(id: string) {
    return apiClient.post(`/me/events/${id}/unregister`);
  },

  async getMyRegistrations() {
    return apiClient.get<any>('/me/events/registrations');
  },

  // Admin
  async getAdminEvents(page = 1, limit = 10, filters: any = {}) {
    return apiClient.get<any>('/admin/events', { params: { page, limit, ...filters } });
  },

  async getAdminEventById(id: string): Promise<EventType> {
    return apiClient.get<EventType>(`/admin/events/${id}`);
  },

  async createEvent(data: Partial<EventType>) {
    return apiClient.post<any>('/admin/events', data);
  },

  async updateEvent(id: string, data: Partial<EventType>) {
    return apiClient.patch<any>(`/admin/events/${id}`, data);
  },

  async deleteEvent(id: string) {
    return apiClient.delete(`/admin/events/${id}`);
  },

  async getRegistrations(id: string) {
    return apiClient.get<any>(`/admin/events/${id}/registrations`);
  },
};
