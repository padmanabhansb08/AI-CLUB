export const EVENT_TYPES = [
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

export type EventTypeEnum = (typeof EVENT_TYPES)[number];

export const EVENT_STATUSES = ['draft', 'published', 'cancelled', 'completed'] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const REGISTRATION_STATUSES = [
  'REGISTERED',
  'CANCELLED',
  'WAITLISTED',
  'ATTENDED',
  'NO_SHOW',
] as const;
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

export const ATTENDANCE_STATUSES = ['PRESENT', 'ABSENT', 'LATE'] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export interface EventRecord {
  id: string;
  title: string;
  description: string;
  event_type: string;
  start_at: string;
  end_at: string;
  location?: string | null;
  meeting_url?: string | null;
  organizer?: string | null;
  capacity?: number | null;
  status: EventStatus;
  registration_open_at?: string | null;
  registration_close_at?: string | null;
  cancellation_reason?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  registration_count?: number;
  attended_count?: number;
  currentStudentRegistrationStatus?: RegistrationStatus | 'UNREGISTERED' | null;
}

export interface AttendanceRecord {
  id: string;
  event_id: string;
  member_id: string;
  checked_in_at: string;
  checked_out_at?: string | null;
  marked_by?: string | null;
  status: AttendanceStatus;
  created_at: string;
  updated_at: string;
  full_name?: string;
  register_number?: string;
  department?: string;
  class_section?: string;
}

export interface AttendanceStats {
  totalRegistrations: number;
  capacity: number | null;
  present: number;
  absent: number;
  late: number;
  notMarked: number;
  attendanceRate: number;
}
