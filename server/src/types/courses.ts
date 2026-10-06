export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED' | 'ARCHIVED';

export type CourseCategory =
  | 'AI_ML'
  | 'GENERATIVE_AI'
  | 'DATA_SCIENCE'
  | 'WEB_DEVELOPMENT'
  | 'APP_DEVELOPMENT'
  | 'PROGRAMMING'
  | 'CLOUD'
  | 'DEVOPS'
  | 'CYBERSECURITY'
  | 'ROBOTICS'
  | 'IOT'
  | 'DATA_ENGINEERING'
  | 'OPEN_SOURCE'
  | 'CAREER'
  | 'OTHER';

export type CourseDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export type LessonContentType = 'VIDEO' | 'ARTICLE' | 'DOCUMENT' | 'LINK' | 'QUIZ' | 'ASSIGNMENT';

export type EnrollmentStatus = 'ENROLLED' | 'COMPLETED' | 'DROPPED';

export type LessonProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface Course {
  id: string;
  title: string;
  slug: string;
  short_description?: string | null;
  description: string;
  thumbnail_url?: string | null;
  category: string;
  difficulty: string;
  instructor_id?: string | null;
  status: CourseStatus;
  estimated_duration_minutes: number;
  published_at?: string | null;
  learning_objectives: string[];
  prerequisites: string[];
  technologies: string[];
  language: string;
  featured?: boolean;
  provider?: string | null;
  course_url?: string | null;
  created_at: string;
  updated_at: string;

  // Aggregated / Enriched fields
  instructor_name?: string | null;
  instructor_photo?: string | null;
  modules_count?: number;
  lessons_count?: number;
  enrollments_count?: number;
  current_enrollment_status?: EnrollmentStatus | null;
  current_progress_percentage?: number | null;
  skills?: string[];
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description?: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  lessons?: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  module_id: string;
  title: string;
  slug?: string | null;
  description?: string | null;
  content_type: LessonContentType;
  content?: string | null;
  video_url?: string | null;
  external_url?: string | null;
  position: number;
  duration_minutes: number;
  is_preview: boolean;
  created_at: string;
  updated_at: string;

  // Enriched progress fields
  progress_status?: LessonProgressStatus;
  progress_percentage?: number;
  completed_at?: string | null;
}

export interface CourseEnrollment {
  id: string;
  course_id: string;
  member_id: string;
  status: EnrollmentStatus;
  enrolled_at: string;
  completed_at?: string | null;
  last_accessed_at: string;
  created_at: string;
  updated_at: string;

  // Enriched fields
  course?: Course;
  member_name?: string;
  member_email?: string;
  progress_percentage?: number;
}

export interface LessonProgress {
  id: string;
  lesson_id: string;
  member_id: string;
  status: LessonProgressStatus;
  progress_percentage: number;
  started_at?: string | null;
  completed_at?: string | null;
  last_accessed_at: string;
  created_at: string;
  updated_at: string;
}

export interface CourseProgressSummary {
  courseId: string;
  enrollmentStatus: EnrollmentStatus;
  progress: {
    percentage: number;
    completedLessons: number;
    totalLessons: number;
  };
  currentLesson?: {
    id: string;
    title: string;
    moduleId: string;
    contentType: LessonContentType;
  } | null;
}

export interface CourseAnalytics {
  courseId: string;
  totalEnrollments: number;
  activeLearners: number;
  completedLearners: number;
  completionRate: number;
  averageProgress: number;
}
