import { Repository } from './repository';
import type { ExternalCourse } from '../../data/courses';
export const courseService = new Repository<ExternalCourse>('/courses');
