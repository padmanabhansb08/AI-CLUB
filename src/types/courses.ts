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

export interface CourseItem {
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
  created_at: string;
  updated_at: string;

  // Enriched fields
  instructor_name?: string | null;
  instructor_photo?: string | null;
  modules_count?: number;
  lessons_count?: number;
  enrollments_count?: number;
  current_enrollment_status?: EnrollmentStatus | null;
  current_progress_percentage?: number | null;
  skills?: string[];
}

export interface CourseLessonItem {
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

export interface CourseModuleItem {
  id: string;
  course_id: string;
  title: string;
  description?: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  lessons?: CourseLessonItem[];
}

export interface CourseEnrollmentItem {
  id: string;
  course_id: string;
  member_id: string;
  status: EnrollmentStatus;
  enrolled_at: string;
  completed_at?: string | null;
  last_accessed_at: string;
  created_at: string;
  updated_at: string;
  course?: CourseItem;
  progress_percentage?: number;
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

export interface CourseAnalyticsData {
  courseId: string;
  totalEnrollments: number;
  activeLearners: number;
  completedLearners: number;
  completionRate: number;
  averageProgress: number;
}

export const COURSE_CATEGORIES: { label: string; value: string }[] = [
  { label: 'All Categories', value: 'All' },
  { label: 'AI & Machine Learning', value: 'AI_ML' },
  { label: 'Generative AI & LLMs', value: 'GENERATIVE_AI' },
  { label: 'Data Science & Analytics', value: 'DATA_SCIENCE' },
  { label: 'Web Development', value: 'WEB_DEVELOPMENT' },
  { label: 'Mobile App Development', value: 'APP_DEVELOPMENT' },
  { label: 'Programming & CS', value: 'PROGRAMMING' },
  { label: 'Cloud & Architecture', value: 'CLOUD' },
  { label: 'DevOps & MLOps', value: 'DEVOPS' },
  { label: 'Cybersecurity', value: 'CYBERSECURITY' },
  { label: 'Robotics & Control', value: 'ROBOTICS' },
  { label: 'IoT & Embedded', value: 'IOT' },
  { label: 'Data Engineering', value: 'DATA_ENGINEERING' },
  { label: 'Open Source', value: 'OPEN_SOURCE' },
  { label: 'Career & Industry', value: 'CAREER' },
  { label: 'Other', value: 'OTHER' },
];

export const COURSE_DIFFICULTIES: CourseDifficulty[] = [
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
  'EXPERT',
];

export const COURSE_STATUSES: CourseStatus[] = [
  'DRAFT',
  'PUBLISHED',
  'UNPUBLISHED',
  'ARCHIVED',
];
