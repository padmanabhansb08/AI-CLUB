import { apiClient } from './client';
import type {
  CourseItem,
  CourseModuleItem,
  CourseLessonItem,
  CourseEnrollmentItem,
  CourseProgressSummary,
  CourseAnalyticsData,
} from '../types/courses';

export interface CourseSearchParams {
  search?: string;
  category?: string;
  difficulty?: string;
  instructor_id?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedCoursesResponse {
  items: CourseItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const coursesApi = {
  // Discovery & CRUD
  getCourses: async (params: CourseSearchParams = {}): Promise<PaginatedCoursesResponse> => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.difficulty && params.difficulty !== 'All') query.append('difficulty', params.difficulty);
    if (params.instructor_id) query.append('instructor_id', params.instructor_id);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiClient.get<any>(`/courses${qs}`);
    const items = res?.data || (Array.isArray(res) ? res : []);
    const pagination = res?.pagination || {
      page: params.page || 1,
      limit: params.limit || 20,
      total: items.length,
      totalPages: 1,
    };
    return { items, pagination };
  },

  getCourse: async (idOrSlug: string): Promise<CourseItem> => {
    const res = await apiClient.get<any>(`/courses/${idOrSlug}`);
    return res?.data ?? res;
  },

  createCourse: async (data: Partial<CourseItem>): Promise<CourseItem> => {
    const res = await apiClient.post<any>('/courses', data);
    return res?.data ?? res;
  },

  updateCourse: async (id: string, data: Partial<CourseItem>): Promise<CourseItem> => {
    const res = await apiClient.patch<any>(`/courses/${id}`, data);
    return res?.data ?? res;
  },

  deleteCourse: async (id: string): Promise<void> => {
    await apiClient.delete(`/courses/${id}`);
  },

  // Lifecycle
  publishCourse: async (id: string): Promise<CourseItem> => {
    const res = await apiClient.post<any>(`/courses/${id}/publish`);
    return res?.data ?? res;
  },

  unpublishCourse: async (id: string): Promise<CourseItem> => {
    const res = await apiClient.post<any>(`/courses/${id}/unpublish`);
    return res?.data ?? res;
  },

  archiveCourse: async (id: string): Promise<CourseItem> => {
    const res = await apiClient.post<any>(`/courses/${id}/archive`);
    return res?.data ?? res;
  },

  // Curriculum & Modules
  getCurriculum: async (courseId: string): Promise<CourseModuleItem[]> => {
    const res = await apiClient.get<any>(`/courses/${courseId}/curriculum`);
    return res?.data ?? (Array.isArray(res) ? res : []);
  },

  createModule: async (courseId: string, data: { title: string; description?: string; position?: number }): Promise<CourseModuleItem> => {
    const res = await apiClient.post<any>(`/courses/${courseId}/modules`, data);
    return res?.data ?? res;
  },

  updateModule: async (moduleId: string, data: { title?: string; description?: string; position?: number }): Promise<CourseModuleItem> => {
    const res = await apiClient.patch<any>(`/modules/${moduleId}`, data);
    return res?.data ?? res;
  },

  deleteModule: async (moduleId: string): Promise<void> => {
    await apiClient.delete(`/modules/${moduleId}`);
  },

  // Lessons
  createLesson: async (moduleId: string, data: Partial<CourseLessonItem>): Promise<CourseLessonItem> => {
    const res = await apiClient.post<any>(`/modules/${moduleId}/lessons`, data);
    return res?.data ?? res;
  },

  getLesson: async (lessonId: string): Promise<CourseLessonItem> => {
    const res = await apiClient.get<any>(`/lessons/${lessonId}`);
    return res?.data ?? res;
  },

  updateLesson: async (lessonId: string, data: Partial<CourseLessonItem>): Promise<CourseLessonItem> => {
    const res = await apiClient.patch<any>(`/lessons/${lessonId}`, data);
    return res?.data ?? res;
  },

  deleteLesson: async (lessonId: string): Promise<void> => {
    await apiClient.delete(`/lessons/${lessonId}`);
  },

  // Enrollments
  enroll: async (courseId: string): Promise<CourseEnrollmentItem> => {
    const res = await apiClient.post<any>(`/courses/${courseId}/enroll`);
    return res?.data ?? res;
  },

  dropEnrollment: async (courseId: string): Promise<void> => {
    await apiClient.delete(`/courses/${courseId}/enroll`);
  },

  getEnrollment: async (courseId: string): Promise<CourseEnrollmentItem | null> => {
    try {
      const res = await apiClient.get<any>(`/courses/${courseId}/enrollment`);
      return res?.data ?? res ?? null;
    } catch {
      return null;
    }
  },

  getMyCourses: async (): Promise<CourseEnrollmentItem[]> => {
    const res = await apiClient.get<any>('/courses/me');
    return res?.data ?? (Array.isArray(res) ? res : []);
  },

  // Lesson Progress
  startLesson: async (lessonId: string): Promise<any> => {
    const res = await apiClient.post<any>(`/lessons/${lessonId}/start`);
    return res?.data ?? res;
  },

  updateProgress: async (lessonId: string, progressPercentage: number): Promise<any> => {
    const res = await apiClient.patch<any>(`/lessons/${lessonId}/progress`, {
      progress_percentage: progressPercentage,
    });
    return res?.data ?? res;
  },

  completeLesson: async (lessonId: string): Promise<any> => {
    const res = await apiClient.post<any>(`/lessons/${lessonId}/complete`);
    return res?.data ?? res;
  },

  getCourseProgress: async (courseId: string): Promise<CourseProgressSummary> => {
    const res = await apiClient.get<any>(`/courses/${courseId}/progress`);
    return res?.data ?? res;
  },

  // Analytics
  getAnalytics: async (courseId: string): Promise<CourseAnalyticsData> => {
    const res = await apiClient.get<any>(`/courses/${courseId}/analytics`);
    return res?.data ?? res;
  },
};
