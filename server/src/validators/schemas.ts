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

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2).optional(),
  department: z.string().min(2).optional(),
  classSection: z.string().min(1).optional(),
  year: z.coerce.number().int().min(1).max(5).optional(),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
  githubUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  skills: z.array(z.string().max(50)).max(20).optional(),
  technicalInterests: z.array(z.string().max(50)).max(10).optional(),
});

export const eventSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(2),
  event_type: z.string().min(2),
  start_at: z.string().datetime(),
  end_at: z.string().datetime(),
  location: z.string().optional(),
  meeting_url: z.string().url().optional().or(z.literal('')),
  organizer: z.string().optional(),
  capacity: z.number().int().positive().optional().nullable(),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']),
  registration_open_at: z.string().datetime().optional().nullable(),
  registration_close_at: z.string().datetime().optional().nullable(),
});
