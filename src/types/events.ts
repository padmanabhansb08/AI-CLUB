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
  'UNREGISTERED',
] as const;
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

export const ATTENDANCE_STATUSES = ['PRESENT', 'ABSENT', 'LATE', 'NOT_MARKED'] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export interface EventItem {
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
  created_at: string;
  updated_at: string;
  registration_count: number;
  attended_count?: number;
  currentStudentRegistrationStatus?: RegistrationStatus;
  currentStudentRegistrationId?: string;
  currentStudentRegisteredAt?: string;
  currentStudentAttendanceStatus?: AttendanceStatus | null;
}

export interface StudentRegistrationItem {
  id: string; // event id
  title: string;
  description: string;
  event_type: string;
  start_at: string;
  end_at: string;
  location?: string | null;
  meeting_url?: string | null;
  organizer?: string | null;
  event_status: EventStatus;
  registration_id: string;
  registered_at: string;
  cancelled_at?: string | null;
  registration_status: RegistrationStatus;
  attendance_status: AttendanceStatus;
  checked_in_at?: string | null;
}

export interface AttendeeItem {
  registration_id: string;
  member_id: string;
  registered_at: string;
  registration_status: RegistrationStatus;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  full_name: string;
  register_number: string;
  department: string;
  class_section: string;
  year: number;
  attendance_status: AttendanceStatus;
  checked_in_at?: string | null;
  attendance_id?: string;
}

export interface EventAttendanceData {
  event: {
    id: string;
    title: string;
    status: EventStatus;
    capacity?: number | null;
    startAt: string;
    endAt: string;
  };
  stats: {
    totalRegistrations: number;
    capacity: number | null;
    present: number;
    absent: number;
    late: number;
    notMarked: number;
    attendanceRate: number;
  };
  attendees: AttendeeItem[];
}
