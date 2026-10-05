import { eventRepository } from '../repositories/eventRepository';
import { ApiError } from '../middleware/errorHandler';

export const eventService = {
  async getPublicEvents(page: number, limit: number, filters: any = {}) {
    // Only published events for public
    filters.status = 'published';
    return await eventRepository.getAll(page, limit, filters);
  },

  async getAdminEvents(page: number, limit: number, filters: any = {}) {
    return await eventRepository.getAll(page, limit, filters);
  },

  async getEventDetail(id: string, userId?: string) {
    const event = await eventRepository.getById(id);
    if (!event) throw new ApiError('NOT_FOUND', 'Event not found');

    if (userId) {
      const isRegistered = await eventRepository.isMemberRegistered(id, userId);
      event.currentStudentRegistrationStatus = isRegistered ? 'registered' : 'unregistered';
    }

    return event;
  },

  async createEvent(data: any, createdBy: string) {
    return await eventRepository.create(data, createdBy);
  },

  async updateEvent(id: string, data: any) {
    const event = await eventRepository.update(id, data);
    if (!event) throw new ApiError('NOT_FOUND', 'Event not found');
    return event;
  },

  async deleteEvent(id: string) {
    // Check if it has registrations
    const regs = await eventRepository.getRegistrations(id);
    if (regs.length > 0) {
      throw new ApiError('BAD_REQUEST', 'Cannot delete event with existing registrations. Please cancel it instead.');
    }
    const deleted = await eventRepository.delete(id);
    if (!deleted) throw new ApiError('NOT_FOUND', 'Event not found');
    return { success: true };
  },

  async register(eventId: string, userId: string) {
    const event = await eventRepository.getById(eventId);
    if (!event) throw new ApiError('NOT_FOUND', 'Event not found');
    if (event.status !== 'published') throw new ApiError('BAD_REQUEST', 'Event is not published');
    
    // Time windows
    const now = new Date();
    if (event.registration_open_at && now < new Date(event.registration_open_at)) {
      throw new ApiError('BAD_REQUEST', 'Registration has not opened yet');
    }
    if (event.registration_close_at && now > new Date(event.registration_close_at)) {
      throw new ApiError('BAD_REQUEST', 'Registration is closed');
    }

    // Capacity
    if (event.capacity && event.registration_count >= event.capacity) {
      throw new ApiError('BAD_REQUEST', 'Event is at full capacity');
    }

    const member = await eventRepository.getMemberByUserId(userId);
    if (!member) throw new ApiError('NOT_FOUND', 'Member profile not found');

    const reg = await eventRepository.registerMember(eventId, member.id);
    if (!reg) {
      // Already registered (idempotent response)
      return { success: true, message: 'Already registered' };
    }

    return { success: true };
  },

  async unregister(eventId: string, userId: string) {
    const member = await eventRepository.getMemberByUserId(userId);
    if (!member) throw new ApiError('NOT_FOUND', 'Member profile not found');

    await eventRepository.unregisterMember(eventId, member.id);
    return { success: true };
  },

  async getRegistrations(eventId: string) {
    return await eventRepository.getRegistrations(eventId);
  },

  async getMyRegistrations(userId: string) {
    return await eventRepository.getMemberRegistrations(userId);
  }
};
