import { eventsApi } from '../../api/events.api';
import type { EventItem, StudentRegistrationItem } from '../../types/events';

export type EventType = EventItem;

export const eventService = {
  // Public / Student
  async getEvents(page = 1, limit = 10, filters: any = {}) {
    return eventsApi.getEvents({ page, limit, ...filters });
  },

  async getEventById(id: string): Promise<EventItem> {
    return eventsApi.getEventById(id);
  },

  async register(id: string) {
    return eventsApi.register(id);
  },

  async cancelRegistration(id: string, reason?: string) {
    return eventsApi.cancelRegistration(id, reason);
  },

  async unregister(id: string) {
    return eventsApi.cancelRegistration(id);
  },

  async getMyRegistrations(): Promise<StudentRegistrationItem[]> {
    return eventsApi.getMyRegistrations();
  },

  // Admin
  async getAdminEvents(page = 1, limit = 10, filters: any = {}) {
    return eventsApi.getAdminEvents({ page, limit, ...filters });
  },

  async getAdminEventById(id: string): Promise<EventItem> {
    return eventsApi.getAdminEventById(id);
  },

  async createEvent(data: Partial<EventItem>) {
    return eventsApi.createEvent(data);
  },

  async updateEvent(id: string, data: Partial<EventItem>) {
    return eventsApi.updateEvent(id, data);
  },

  async publishEvent(id: string) {
    return eventsApi.publishEvent(id);
  },

  async cancelEvent(id: string, reason: string) {
    return eventsApi.cancelEvent(id, reason);
  },

  async completeEvent(id: string, force = false) {
    return eventsApi.completeEvent(id, force);
  },

  async deleteEvent(id: string) {
    return eventsApi.deleteEvent(id);
  },

  async getRegistrations(id: string, search?: string) {
    return eventsApi.getRegistrations(id, search);
  },

  async getAttendance(id: string) {
    return eventsApi.getAttendance(id);
  },

  async markAttendance(
    id: string,
    records: Array<{ memberId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' }>
  ) {
    return eventsApi.markAttendance(id, records);
  },

  async bulkMarkAttendance(
    id: string,
    memberIds: string[],
    status: 'PRESENT' | 'ABSENT' | 'LATE'
  ) {
    return eventsApi.bulkMarkAttendance(id, memberIds, status);
  },

  async checkIn(id: string, memberId: string, status: 'PRESENT' | 'ABSENT' | 'LATE' = 'PRESENT') {
    return eventsApi.checkIn(id, memberId, status);
  },
};
