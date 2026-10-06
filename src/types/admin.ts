export type UserRole = 'student' | 'instructor' | 'admin' | 'super_admin';
export type MemberStatus = 'Active' | 'Inactive' | 'Suspended' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type DateRangePreset = 'today' | '7d' | '30d' | '90d' | 'this_year' | 'custom';
export type AnalyticsRange = DateRangePreset;

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
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    createdAt: string;
    actorEmail?: string;
    actorName?: string;
  }>;
}

export interface AdminMemberItem {
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
  userEmail: string;
  joinedAt: string;
  profileCompletionPercentage: number;
  eventsRegistered: number;
  eventsAttended: number;
  coursesEnrolled: number;
  coursesCompleted: number;
  projectsJoined: number;
  achievementsEarned: number;
}
export type MemberDetailView = AdminMemberDetail;

export interface AdminMemberDetail {
  profile: {
    id: string;
    userId: string;
    fullName: string;
    registerNumber: string;
    department: string;
    classSection: string;
    year: number;
    collegeEmail: string;
    phone: string | null;
    bio: string | null;
    skills: string[] | null;
    technicalInterests: string[] | null;
    githubUrl: string | null;
    linkedinUrl: string | null;
    portfolioUrl: string | null;
    status: MemberStatus;
    role: UserRole;
    userEmail: string;
    userStatus: string;
    joinedAt: string;
    createdAt: string;
    profileCompletionPercentage: number;
  };
  events: Array<{
    registrationId: string;
    registrationStatus: string;
    registeredAt: string;
    eventId: string;
    eventTitle: string;
    eventType: string;
    startAt: string;
    location: string;
  }>;
  courses: Array<{
    enrollmentId: string;
    enrollmentStatus: string;
    progressPercentage: number;
    enrolledAt: string;
    completedAt: string | null;
    courseId: string;
    courseTitle: string;
    category: string;
    difficulty: string;
  }>;
  projects: Array<{
    projectId: string;
    projectTitle: string;
    projectStatus: string;
    projectRole: string;
    memberStatus: string;
    joinedAt: string;
  }>;
  teams: Array<{
    teamId: string;
    teamName: string;
    teamStatus: string;
    teamRole: string;
    projectId: string;
    projectTitle: string;
  }>;
  achievements: Array<{
    achievementId: string;
    title: string;
    description: string;
    category: string;
    points: number;
    icon: string;
    earnedAt: string;
  }>;
  recentActivity: Array<{
    id: string;
    activityType: string;
    entityType: string;
    entityId: string;
    metadata: any;
    createdAt: string;
  }>;
  stats: {
    eventsRegistered: number;
    eventsAttended: number;
    coursesEnrolled: number;
    coursesCompleted: number;
    projectsCount: number;
    teamsCount: number;
    achievementsCount: number;
    activityScore: number;
  };
}

export interface AuditLogItem {
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

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
