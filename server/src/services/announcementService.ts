import { announcementRepository } from '../repositories/announcementRepository';
import { ApiError } from '../middleware/errorHandler';

export const announcementService = {
  async getVisibleAnnouncements(memberId: string | null, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    const { data, total } = await announcementRepository.getVisibleAnnouncements(memberId, limit, offset);
    
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },
  
  async getUnreadCount(memberId: string) {
    const count = await announcementRepository.getUnreadCount(memberId);
    return { count };
  },
  
  async markAsRead(id: string, memberId: string) {
    const announcement = await announcementRepository.getById(id);
    if (!announcement) {
      throw new ApiError('NOT_FOUND', 'Announcement not found');
    }
    await announcementRepository.markAsRead(id, memberId);
    return { success: true };
  },
  
  async getById(id: string, memberId: string | null = null) {
    const announcement = await announcementRepository.getById(id, memberId);
    if (!announcement) {
      throw new ApiError('NOT_FOUND', 'Announcement not found');
    }
    
    // If student, verify visibility
    if (memberId) {
      if (announcement.status !== 'published') {
        throw new ApiError('NOT_FOUND', 'Announcement not found');
      }
      if (announcement.publishedAt && new Date(announcement.publishedAt) > new Date()) {
        throw new ApiError('NOT_FOUND', 'Announcement not found');
      }
      if (announcement.expiresAt && new Date(announcement.expiresAt) <= new Date()) {
        throw new ApiError('NOT_FOUND', 'Announcement not found');
      }
    }
    
    return announcement;
  },
  
  async getAllAdmin() {
    return announcementRepository.getAllAdmin();
  },
  
  async create(data: any, userId: string) {
    return announcementRepository.create(data, userId);
  },
  
  async update(id: string, data: any) {
    const announcement = await announcementRepository.update(id, data);
    if (!announcement) {
      throw new ApiError('NOT_FOUND', 'Announcement not found');
    }
    return announcement;
  },
  
  async delete(id: string) {
    const deleted = await announcementRepository.delete(id);
    if (!deleted) {
      throw new ApiError('NOT_FOUND', 'Announcement not found');
    }
    return { success: true };
  }
};
