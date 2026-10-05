import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  body: z.string().min(1, 'Body is required'),
  category: z.enum(['general', 'event', 'project', 'workshop', 'hackathon', 'recruitment', 'deadline', 'achievement', 'important']),
  priority: z.enum(['normal', 'important', 'urgent']).default('normal'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  publishedAt: z.string().datetime().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional()
});

export const updateAnnouncementSchema = createAnnouncementSchema.partial();
