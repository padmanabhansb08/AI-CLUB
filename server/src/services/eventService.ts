import { eventRepository } from '../repositories/eventRepository';
import { notificationService } from './notificationService';
import { achievementService } from './achievementService';
import { AppError } from '../errors/AppError';

export const eventService = {
  async getPublicEvents(page: number, limit: number, filters: any = {}) {
    // Only published events for public / students
    filters.status = 'published';
    return await eventRepository.getAll(page, limit, filters);
  },

  async getAdminEvents(page: number, limit: number, filters: any = {}) {
    return await eventRepository.getAll(page, limit, filters);
  },

  async getEventDetail(id: string, userId?: string, role?: string) {
    const event = await eventRepository.getById(id, userId);
    if (!event) {
      throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found');
    }

    // Normal students / unauthenticated users can only see published events
    if (event.status !== 'published' && role !== 'admin') {
      throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found');
    }

    return event;
  },

  async createEvent(data: any, createdBy: string) {
    // By default, events are created as 'draft'
    const eventData = {
      ...data,
      status: data.status || 'draft',
    };
    return await eventRepository.create(eventData, createdBy);
  },

  async updateEvent(id: string, data: any) {
    const existing = await eventRepository.getById(id);
    if (!existing) {
      throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found');
    }

    if (existing.status === 'cancelled') {
      throw new AppError(400, 'EVENT_CANCELLED', 'Cannot modify a cancelled event');
    }
    if (existing.status === 'completed') {
      throw new AppError(400, 'EVENT_COMPLETED', 'Cannot modify a completed event');
    }

    const updated = await eventRepository.update(id, data);
    if (!updated) {
      throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found');
    }
    return updated;
  },

  async publishEvent(id: string) {
    const event = await eventRepository.getById(id);
    if (!event) {
      throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found');
    }

    if (event.status === 'published') {
      return event;
    }
    if (event.status === 'cancelled') {
      throw new AppError(400, 'EVENT_CANCELLED', 'Cannot publish a cancelled event');
    }
    if (event.status === 'completed') {
      throw new AppError(400, 'EVENT_COMPLETED', 'Cannot publish a completed event');
    }

    // Validate required fields and dates for publishing
    if (!event.title || !event.description || !event.event_type || !event.start_at || !event.end_at) {
      throw new AppError(400, 'VALIDATION_ERROR', 'All required event fields must be set before publishing');
    }

    const start = new Date(event.start_at).getTime();
    const end = new Date(event.end_at).getTime();
    if (start >= end) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Start date must be before end date');
    }

    if (event.registration_open_at && event.registration_close_at) {
      const regOpen = new Date(event.registration_open_at).getTime();
      const regClose = new Date(event.registration_close_at).getTime();
      if (regOpen >= regClose) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Registration open date must be before registration close date');
      }
    }

    return await eventRepository.publish(id);
  },

  async cancelEvent(id: string, reason: string) {
    const event = await eventRepository.getById(id);
    if (!event) {
      throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found');
    }

    if (event.status === 'cancelled') {
      throw new AppError(400, 'EVENT_CANCELLED', 'Event is already cancelled');
    }

    if (!reason || reason.trim().length < 2) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Cancellation reason is required');
    }

    const cancelled = await eventRepository.cancel(id, reason.trim());
    try {
      const attendees = await eventRepository.getRegistrations(id);
      for (const att of attendees) {
        const memberId = att.member_id || att.id;
        if (memberId) {
          notificationService.createNotification({
            recipient_id: memberId,
            type: 'EVENT_CANCELLED',
            title: 'Event Cancelled',
            message: `The event "${event.title}" has been cancelled: ${reason.trim()}`,
            data: { eventId: id, reason: reason.trim() },
            priority: 'HIGH',
          }).catch(() => {});
        }
      }
    } catch {
      // Non-blocking
    }
    return cancelled;
  },

  async completeEvent(id: string, force = false) {
    const event = await eventRepository.getById(id);
    if (!event) {
      throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found');
    }

    if (event.status === 'completed') {
      return event;
    }
    if (event.status === 'cancelled') {
      throw new AppError(400, 'EVENT_CANCELLED', 'Cannot complete a cancelled event');
    }

    // Completion rule: only after event has ended unless explicitly forced
    const now = new Date();
    const end = new Date(event.end_at);
    if (now < end && !force) {
      throw new AppError(
        400,
        'EVENT_NOT_ENDED',
        'Cannot complete an event before its scheduled end time without admin override'
      );
    }

    return await eventRepository.complete(id);
  },

  async deleteEvent(id: string) {
    const regs = await eventRepository.getRegistrations(id);
    if (regs.length > 0) {
      throw new AppError(
        400,
        'CANNOT_DELETE_EVENT',
        'Cannot delete event with existing registrations. Please cancel it instead.'
      );
    }
    const deleted = await eventRepository.delete(id);
    if (!deleted) {
      throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found');
    }
    return { success: true };
  },

  async register(eventId: string, userId: string) {
    const member = await eventRepository.getMemberByUserId(userId);
    if (!member) {
      throw new AppError(404, 'MEMBER_NOT_FOUND', 'Member profile not found for user');
    }

    const reg = await eventRepository.registerMemberTransactional(eventId, member.id);
    try {
      const event = await eventRepository.getById(eventId);
      notificationService.createNotification({
        recipient_id: member.id,
        type: 'EVENT_REGISTRATION_CONFIRMED',
        title: 'Event Registration Confirmed',
        message: `You are confirmed for "${event?.title || 'Event'}".`,
        data: { eventId, eventTitle: event?.title },
      }).catch(() => {});
      achievementService.evaluateMemberAchievements(member.id).catch(() => {});
    } catch {
      // Non-blocking
    }
    return reg;
  },

  async cancelRegistration(eventId: string, userId: string, reason?: string) {
    const member = await eventRepository.getMemberByUserId(userId);
    if (!member) {
      throw new AppError(404, 'MEMBER_NOT_FOUND', 'Member profile not found for user');
    }

    const cancelled = await eventRepository.cancelRegistration(eventId, member.id, reason);
    return cancelled;
  },

  async getRegistrations(eventId: string, search?: string) {
    const event = await eventRepository.getById(eventId);
    if (!event) {
      throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found');
    }
    return await eventRepository.getRegistrations(eventId, search);
  },

  async getMyRegistrations(userId: string) {
    return await eventRepository.getMemberRegistrations(userId);
  },

  async getAttendance(eventId: string) {
    return await eventRepository.getAttendance(eventId);
  },

  async markAttendance(
    eventId: string,
    records: Array<{ memberId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' }>,
    markedByUserId: string
  ) {
    const result = await eventRepository.markAttendanceTransactional(eventId, records, markedByUserId);
    for (const r of records) {
      if (r.status === 'PRESENT') {
        achievementService.evaluateMemberAchievements(r.memberId).catch(() => {});
      }
    }
    return result;
  },

  async bulkMarkAttendance(
    eventId: string,
    memberIds: string[],
    status: 'PRESENT' | 'ABSENT' | 'LATE',
    markedByUserId: string
  ) {
    const records = memberIds.map((memberId) => ({ memberId, status }));
    const result = await eventRepository.markAttendanceTransactional(eventId, records, markedByUserId);
    if (status === 'PRESENT') {
      for (const mId of memberIds) {
        achievementService.evaluateMemberAchievements(mId).catch(() => {});
      }
    }
    return result;
  },

  async checkIn(
    eventId: string,
    memberId: string,
    status: 'PRESENT' | 'ABSENT' | 'LATE',
    markedByUserId: string
  ) {
    const result = await eventRepository.markAttendanceTransactional(
      eventId,
      [{ memberId, status }],
      markedByUserId
    );
    if (status === 'PRESENT') {
      achievementService.evaluateMemberAchievements(memberId).catch(() => {});
    }
    return result;
  },
};
