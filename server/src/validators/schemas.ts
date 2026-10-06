import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  registerNumber: z.string().min(2, 'Register number must be at least 2 characters'),
  department: z.string().min(2, 'Department is required'),
  classSection: z.string().min(1, 'Class section is required'),
  year: z.coerce.number().int().min(1, 'Year must be between 1 and 5').max(5, 'Year must be between 1 and 5'),
  collegeEmail: z.string().email('Invalid college email address').optional(),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const achievementSchema = z.object({
  title: z.string().min(2),
  description: z.string(),
  category: z.string(),
  student_name: z.string().optional(),
  team_name: z.string().optional(),
  organization: z.string().optional(),
  event_name: z.string().optional(),
  date: z.string().optional(),
  year: z.number().optional(),
  featured: z.boolean().optional(),
});

export const updateSchema = z.object({
  title: z.string().min(2),
  summary: z.string(),
  category: z.string(),
  source: z.string(),
  published_at: z.string(),
  read_time: z.string().optional(),
  content: z.string().optional(),
  external_source_url: z.string().url().optional(),
  featured: z.boolean().optional(),
});

export const projectSchema = z.object({
  title: z.string().min(2),
  short_description: z.string(),
  overview: z.string().optional(),
  problem: z.string().optional(),
  approach: z.string().optional(),
  category: z.string(),
  difficulty: z.string(),
  status: z.string(),
  expected_outcome: z.string().optional(),
  featured: z.boolean().optional(),
});

export const courseSchema = z.object({
  title: z.string().min(2),
  provider: z.string(),
  description: z.string(),
  category: z.string(),
  difficulty: z.string(),
  duration: z.string().optional(),
  course_url: z.string().url().optional(),
  tracking_method: z.string(),
  tracking_status: z.string(),
  tracking_provider: z.string().optional(),
  featured: z.boolean().optional(),
});

export const skillItemSchema = z.union([
  z.string().min(1).max(100),
  z.object({
    name: z.string().min(1).max(100),
    proficiency: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
  }),
]);

export const memberSkillsUpdateSchema = z.object({
  skills: z.array(skillItemSchema),
});

export const memberInterestsUpdateSchema = z.object({
  interests: z.array(z.string().min(1).max(100)),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  department: z.string().min(2).max(100).optional(),
  classSection: z.string().min(1).max(50).optional(),
  year: z.coerce.number().int().min(1).max(5).optional(),
  phone: z.string().max(50).optional().or(z.literal('')),
  bio: z.string().max(1000).optional().or(z.literal('')),
  profilePhotoUrl: z.string().url('Invalid profile photo URL').max(1000).optional().or(z.literal('')),
  githubUrl: z.string().url('Invalid GitHub URL').max(1000).optional().or(z.literal('')),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').max(1000).optional().or(z.literal('')),
  portfolioUrl: z.string().url('Invalid Portfolio URL').max(1000).optional().or(z.literal('')),
  skills: z.array(skillItemSchema).max(50).optional(),
  technicalInterests: z.array(z.string().max(100)).max(30).optional(),
  interests: z.array(z.string().max(100)).max(30).optional(),
});

export const VALID_EVENT_TYPES = [
  'WORKSHOP',
  'WEBINAR',
  'HACKATHON',
  'COMPETITION',
  'MEETUP',
  'BOOTCAMP',
  'SEMINAR',
  'GUEST_LECTURE',
  'CLUB_MEETING',
  'OTHER',
] as const;

export const eventSchema = z
  .object({
    title: z.string().trim().min(2, 'Title must be at least 2 characters').max(255, 'Title must not exceed 255 characters'),
    description: z.string().trim().min(2, 'Description must be at least 2 characters').max(5000, 'Description must not exceed 5000 characters'),
    event_type: z
      .string()
      .trim()
      .transform((val) => val.toUpperCase())
      .refine(
        (val) => VALID_EVENT_TYPES.includes(val as any),
        { message: `Invalid event type. Must be one of: ${VALID_EVENT_TYPES.join(', ')}` }
      ),
    start_at: z.string().datetime({ message: 'Start date must be a valid ISO datetime' }),
    end_at: z.string().datetime({ message: 'End date must be a valid ISO datetime' }),
    location: z.string().max(255).optional().nullable(),
    meeting_url: z.string().url('Meeting URL must be a valid URL').optional().or(z.literal('')).nullable(),
    organizer: z.string().max(255).optional().nullable(),
    capacity: z.coerce.number().int('Capacity must be an integer').min(1, 'Capacity must be at least 1').optional().nullable(),
    status: z.enum(['draft', 'published', 'cancelled', 'completed']).default('draft'),
    registration_open_at: z.string().datetime({ message: 'Registration open must be a valid ISO datetime' }).optional().nullable(),
    registration_close_at: z.string().datetime({ message: 'Registration close must be a valid ISO datetime' }).optional().nullable(),
    cancellation_reason: z.string().max(500).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.start_at).getTime();
    const end = new Date(data.end_at).getTime();

    if (start >= end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Start date/time must be strictly before end date/time',
        path: ['end_at'],
      });
    }

    if (data.registration_open_at && data.registration_close_at) {
      const regOpen = new Date(data.registration_open_at).getTime();
      const regClose = new Date(data.registration_close_at).getTime();
      if (regOpen >= regClose) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Registration open time must be strictly before registration close time',
          path: ['registration_close_at'],
        });
      }
    }

    if (data.registration_close_at) {
      const regClose = new Date(data.registration_close_at).getTime();
      if (regClose > start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Registration close time cannot be after event starts',
          path: ['registration_close_at'],
        });
      }
    }

    // Require location or meeting URL
    const hasLocation = data.location && data.location.trim().length > 0;
    const hasMeetingUrl = data.meeting_url && data.meeting_url.trim().length > 0;
    if (!hasLocation && !hasMeetingUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Either location (for physical events) or meeting URL (for online events) is required',
        path: ['location'],
      });
    }
  });

export const eventCancelSchema = z.object({
  reason: z.string().trim().min(2, 'Cancellation reason is required and must be at least 2 characters').max(500),
});

export const eventCompleteSchema = z.object({
  force: z.boolean().optional(),
});

export const attendanceRecordItemSchema = z.object({
  memberId: z.string().uuid('Invalid member ID'),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'present', 'absent', 'late']).transform(s => s.toUpperCase() as 'PRESENT' | 'ABSENT' | 'LATE'),
});

export const markAttendanceSchema = z.object({
  records: z.array(attendanceRecordItemSchema).min(1, 'At least one attendance record is required'),
});

export const bulkAttendanceSchema = z.object({
  memberIds: z.array(z.string().uuid('Invalid member ID')).min(1, 'At least one student must be selected'),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'present', 'absent', 'late']).default('PRESENT').transform(s => s.toUpperCase() as 'PRESENT' | 'ABSENT' | 'LATE'),
});

export const checkInSchema = z.object({
  memberId: z.string().uuid('Invalid member ID'),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'present', 'absent', 'late']).default('PRESENT').transform(s => s.toUpperCase() as 'PRESENT' | 'ABSENT' | 'LATE'),
});

