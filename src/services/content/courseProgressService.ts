import { Repository } from './repository';

export interface CourseProgress {
  id: string;
  member_id: string;
  course_id: string;
  progress_percent: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export const courseProgressService = new Repository<CourseProgress>('/me/courses/progress', true);
