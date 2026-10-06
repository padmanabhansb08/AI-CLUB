export type UserRole = 'student' | 'instructor' | 'admin' | 'super_admin';
export type MemberStatus = 'Active' | 'Inactive' | 'Suspended';

export interface AuditLogEntry {
  id: string;
  actorId: string | null;
  actorEmail?: string;
  actorName?: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeData: any;
  afterData: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditLogFilter {
  page?: number;
  limit?: number;
  actorId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  from?: string;
  to?: string;
  search?: string;
}

export interface AdminMemberFilter {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  year?: number;
  classSection?: string;
  role?: string;
  status?: string;
  sortBy?: 'joined_at' | 'full_name' | 'register_number' | 'status' | 'year';
  sortOrder?: 'ASC' | 'DESC';
}

export interface AdminMemberSummary {
  id: string;
  userId: string;
  fullName: string;
  registerNumber: string;
  department: string;
  classSection: string;
  year: number;
  collegeEmail: string;
  phone: string | null;
  status: MemberStatus;
  role: UserRole;
  joinedAt: string;
  profileCompletionPercentage: number;
  stats: {
    eventsRegistered: number;
    eventsAttended: number;
    coursesEnrolled: number;
    coursesCompleted: number;
    projectsJoined: number;
    teamsJoined: number;
    achievementsEarned: number;
  };
}

export interface AdminDashboardKPIs {
  period: {
    range: string;
    from: string;
    to: string;
  };
  members: {
    total: number;
    active: number;
    newInPeriod: number;
    completionRate: number;
  };
  events: {
    total: number;
    upcoming: number;
    inPeriod: number;
    registrationsCount: number;
    attendanceRate: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    activeTeams: number;
  };
  learning: {
    totalCourses: number;
    publishedCourses: number;
    totalEnrollments: number;
    completionRate: number;
  };
  achievements: {
    totalDefinitions: number;
    activeDefinitions: number;
    totalEarned: number;
    uniqueEarners: number;
  };
  notifications: {
    totalSent: number;
    unreadCount: number;
    recentAnnouncementsCount: number;
  };
  trends: {
    memberGrowth: Array<{ date: string; newMembers: number }>;
    eventActivity: Array<{ month: string; eventsCount: number; registrations: number; attendance: number }>;
    learningEngagement: Array<{ month: string; enrollments: number; completions: number }>;
    projectActivity: Array<{ status: string; count: number }>;
    achievementActivity: Array<{ date: string; count: number }>;
  };
  recentActivity: Array<any>;
}
