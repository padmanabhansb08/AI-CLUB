import { courseRepo } from '../repositories/courseRepository';
import { memberRepo } from '../repositories/memberRepository';
import { query } from '../db';
import { ApiError } from '../middleware/errorHandler';
import {
  Course,
  CourseModule,
  CourseLesson,
  CourseEnrollment,
  LessonProgress,
  CourseProgressSummary,
  CourseAnalytics,
} from '../types/courses';

export class CourseService {
  // Helper: resolve member ID from authenticated user
  private async getMemberId(user: { id: string; userId?: string; role?: string }): Promise<string> {
    const userId = user.userId || user.id;
    const member = await memberRepo.findByUserId(userId);
    if (!member) {
      throw ApiError.notFound('Student member profile not found');
    }
    return member.id;
  }

  // Helper: check if user is instructor or admin of the course
  private async assertCanManageCourse(
    courseId: string,
    user: { id: string; userId?: string; role?: string }
  ): Promise<Course> {
    const course = await courseRepo.findByIdOrSlug(courseId);
    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    if (user.role === 'admin') {
      return course;
    }

    const memberId = await this.getMemberId(user);
    if (course.instructor_id && course.instructor_id === memberId) {
      return course;
    }

    throw ApiError.forbidden('You do not have permission to manage this course');
  }

  // Helper: check if user is enrolled in course that contains the lesson
  private async assertLessonAccess(
    lessonId: string,
    user?: { id: string; userId?: string; role?: string }
  ): Promise<{ lesson: CourseLesson; courseId: string; memberId?: string }> {
    const res = await query(
      `
      SELECT cl.*, cm.course_id, c.status as course_status, c.instructor_id
      FROM course_lessons cl
      JOIN course_modules cm ON cm.id = cl.module_id
      JOIN courses c ON c.id = cm.course_id
      WHERE cl.id = $1
      `,
      [lessonId]
    );

    if (res.rows.length === 0) {
      throw ApiError.notFound('Lesson not found');
    }

    const row = res.rows[0];
    const lesson: CourseLesson = row;
    const courseId = row.course_id;

    // Free preview lesson
    if (lesson.is_preview) {
      let memberId: string | undefined;
      if (user) {
        try {
          memberId = await this.getMemberId(user);
        } catch {
          // ignore for preview
        }
      }
      return { lesson, courseId, memberId };
    }

    if (!user) {
      throw ApiError.unauthorized('Authentication required to access lesson');
    }

    if (user.role === 'admin') {
      let memberId: string | undefined;
      try {
        memberId = await this.getMemberId(user);
      } catch {
        // admin may not have member profile
      }
      return { lesson, courseId, memberId };
    }

    const memberId = await this.getMemberId(user);

    // Instructor access
    if (row.instructor_id && row.instructor_id === memberId) {
      return { lesson, courseId, memberId };
    }

    // Check enrollment
    const enrollment = await courseRepo.getEnrollment(courseId, memberId);
    if (!enrollment || enrollment.status === 'DROPPED') {
      throw ApiError.forbidden('You must be enrolled in this course to access this lesson');
    }

    return { lesson, courseId, memberId };
  }

  // -------------------------------------------------------------
  // Course Discovery & Listing
  // -------------------------------------------------------------
  async getCourses(
    params: {
      search?: string;
      category?: string;
      difficulty?: string;
      instructor_id?: string;
      status?: string;
      page?: number;
      limit?: number;
    },
    user?: { id: string; userId?: string; role?: string }
  ) {
    let memberId: string | undefined;
    if (user) {
      try {
        memberId = await this.getMemberId(user);
      } catch {
        // ignore
      }
    }

    // Students only discover PUBLISHED courses unless admin
    let statusFilter = params.status;
    if (user?.role !== 'admin') {
      statusFilter = 'PUBLISHED';
    }

    return courseRepo.findPaginated({
      ...params,
      status: statusFilter,
      memberId,
    });
  }

  async getCourse(
    identifier: string,
    user?: { id: string; userId?: string; role?: string }
  ): Promise<Course> {
    let memberId: string | undefined;
    if (user) {
      try {
        memberId = await this.getMemberId(user);
      } catch {
        // ignore
      }
    }

    const course = await courseRepo.findByIdOrSlug(identifier, memberId);
    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    // Access control for draft/unpublished courses
    if (course.status !== 'PUBLISHED') {
      if (user?.role === 'admin') {
        return course;
      }
      if (memberId && course.instructor_id === memberId) {
        return course;
      }
      throw ApiError.forbidden('Course is not publicly accessible');
    }

    return course;
  }

  async createCourse(
    data: any,
    user: { id: string; userId?: string; role?: string }
  ): Promise<Course> {
    let instructorId = data.instructor_id;
    if (!instructorId) {
      try {
        instructorId = await this.getMemberId(user);
      } catch {
        // null if no member record
      }
    }

    const course = await courseRepo.create({
      ...data,
      instructor_id: instructorId || null,
      status: data.status || 'DRAFT',
    });

    if (data.skills && Array.isArray(data.skills) && data.skills.length > 0) {
      await courseRepo.setCourseSkills(course.id, data.skills);
    }

    return (await courseRepo.findByIdOrSlug(course.id))!;
  }

  async updateCourse(
    id: string,
    data: any,
    user: { id: string; userId?: string; role?: string }
  ): Promise<Course> {
    await this.assertCanManageCourse(id, user);

    const updated = await courseRepo.update(id, data);
    if (!updated) {
      throw ApiError.notFound('Course not found');
    }

    if (data.skills && Array.isArray(data.skills)) {
      await courseRepo.setCourseSkills(id, data.skills);
    }

    return (await courseRepo.findByIdOrSlug(id))!;
  }

  async deleteCourse(
    id: string,
    user: { id: string; userId?: string; role?: string }
  ): Promise<boolean> {
    await this.assertCanManageCourse(id, user);
    return courseRepo.delete(id);
  }

  // -------------------------------------------------------------
  // Course Lifecycle: Publish, Unpublish, Archive
  // -------------------------------------------------------------
  async publishCourse(
    id: string,
    user: { id: string; userId?: string; role?: string }
  ): Promise<Course> {
    const course = await this.assertCanManageCourse(id, user);

    // Validate publishing requirements (Section 37)
    if (!course.title || course.title.trim().length < 2) {
      throw ApiError.badRequest('COURSE_PUBLISH_VALIDATION_FAILED: Title must be at least 2 characters');
    }
    if (!course.description || course.description.trim().length < 10) {
      throw ApiError.badRequest('COURSE_PUBLISH_VALIDATION_FAILED: Description must be at least 10 characters');
    }
    if (!course.category) {
      throw ApiError.badRequest('COURSE_PUBLISH_VALIDATION_FAILED: Course category is required');
    }
    if (!course.difficulty) {
      throw ApiError.badRequest('COURSE_PUBLISH_VALIDATION_FAILED: Course difficulty is required');
    }

    // Must have at least one module and at least one lesson
    const curriculum = await courseRepo.getCurriculum(course.id);
    if (curriculum.length === 0) {
      throw ApiError.badRequest('COURSE_PUBLISH_VALIDATION_FAILED: Course must have at least one module before publishing');
    }

    const totalLessons = curriculum.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
    if (totalLessons === 0) {
      throw ApiError.badRequest('COURSE_PUBLISH_VALIDATION_FAILED: Course must have at least one lesson before publishing');
    }

    const updated = await courseRepo.update(id, {
      status: 'PUBLISHED',
    });

    return (await courseRepo.findByIdOrSlug(id))!;
  }

  async unpublishCourse(
    id: string,
    user: { id: string; userId?: string; role?: string }
  ): Promise<Course> {
    await this.assertCanManageCourse(id, user);

    await courseRepo.update(id, {
      status: 'UNPUBLISHED',
    });

    return (await courseRepo.findByIdOrSlug(id))!;
  }

  async archiveCourse(
    id: string,
    user: { id: string; userId?: string; role?: string }
  ): Promise<Course> {
    await this.assertCanManageCourse(id, user);

    await courseRepo.update(id, {
      status: 'ARCHIVED',
    });

    return (await courseRepo.findByIdOrSlug(id))!;
  }

  // -------------------------------------------------------------
  // Curriculum: Modules & Lessons
  // -------------------------------------------------------------
  async getCurriculum(
    courseId: string,
    user?: { id: string; userId?: string; role?: string }
  ): Promise<CourseModule[]> {
    const course = await courseRepo.findByIdOrSlug(courseId);
    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    let memberId: string | undefined;
    if (user) {
      try {
        memberId = await this.getMemberId(user);
      } catch {
        // ignore
      }
    }

    return courseRepo.getCurriculum(course.id, memberId);
  }

  async createModule(
    courseId: string,
    data: { title: string; description?: string | null; position?: number },
    user: { id: string; userId?: string; role?: string }
  ): Promise<CourseModule> {
    const course = await this.assertCanManageCourse(courseId, user);
    return courseRepo.createModule(course.id, data);
  }

  async updateModule(
    moduleId: string,
    data: { title?: string; description?: string | null; position?: number },
    user: { id: string; userId?: string; role?: string }
  ): Promise<CourseModule> {
    const mod = await courseRepo.getModuleById(moduleId);
    if (!mod) {
      throw ApiError.notFound('Module not found');
    }
    await this.assertCanManageCourse(mod.course_id, user);
    const updated = await courseRepo.updateModule(moduleId, data);
    return updated!;
  }

  async deleteModule(
    moduleId: string,
    user: { id: string; userId?: string; role?: string }
  ): Promise<boolean> {
    const mod = await courseRepo.getModuleById(moduleId);
    if (!mod) {
      throw ApiError.notFound('Module not found');
    }
    await this.assertCanManageCourse(mod.course_id, user);
    return courseRepo.deleteModule(moduleId);
  }

  async createLesson(
    moduleId: string,
    data: any,
    user: { id: string; userId?: string; role?: string }
  ): Promise<CourseLesson> {
    const mod = await courseRepo.getModuleById(moduleId);
    if (!mod) {
      throw ApiError.notFound('Module not found');
    }
    await this.assertCanManageCourse(mod.course_id, user);
    return courseRepo.createLesson(moduleId, data);
  }

  async getLesson(
    lessonId: string,
    user?: { id: string; userId?: string; role?: string }
  ): Promise<CourseLesson> {
    const { lesson, memberId } = await this.assertLessonAccess(lessonId, user);
    const full = await courseRepo.getLessonById(lesson.id, memberId);
    return full || lesson;
  }

  async updateLesson(
    lessonId: string,
    data: any,
    user: { id: string; userId?: string; role?: string }
  ): Promise<CourseLesson> {
    const lesson = await courseRepo.getLessonById(lessonId);
    if (!lesson) {
      throw ApiError.notFound('Lesson not found');
    }
    const mod = await courseRepo.getModuleById(lesson.module_id);
    if (!mod) {
      throw ApiError.notFound('Module not found');
    }
    await this.assertCanManageCourse(mod.course_id, user);
    const updated = await courseRepo.updateLesson(lessonId, data);
    return updated!;
  }

  async deleteLesson(
    lessonId: string,
    user: { id: string; userId?: string; role?: string }
  ): Promise<boolean> {
    const lesson = await courseRepo.getLessonById(lessonId);
    if (!lesson) {
      throw ApiError.notFound('Lesson not found');
    }
    const mod = await courseRepo.getModuleById(lesson.module_id);
    if (!mod) {
      throw ApiError.notFound('Module not found');
    }
    await this.assertCanManageCourse(mod.course_id, user);
    return courseRepo.deleteLesson(lessonId);
  }

  // -------------------------------------------------------------
  // Enrollments
  // -------------------------------------------------------------
  async enroll(
    courseId: string,
    user: { id: string; userId?: string; role?: string }
  ): Promise<CourseEnrollment> {
    const course = await courseRepo.findByIdOrSlug(courseId);
    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    if (course.status !== 'PUBLISHED') {
      throw ApiError.badRequest('Cannot enroll in a course that is not published');
    }

    const memberId = await this.getMemberId(user);

    try {
      return await courseRepo.enroll(course.id, memberId);
    } catch (err: any) {
      if (err.code === 'ALREADY_ENROLLED') {
        throw ApiError.conflict('ALREADY_ENROLLED: You are already enrolled in this course');
      }
      throw err;
    }
  }

  async dropEnrollment(
    courseId: string,
    user: { id: string; userId?: string; role?: string }
  ): Promise<boolean> {
    const course = await courseRepo.findByIdOrSlug(courseId);
    if (!course) {
      throw ApiError.notFound('Course not found');
    }
    const memberId = await this.getMemberId(user);
    return courseRepo.dropEnrollment(course.id, memberId);
  }

  async getEnrollment(
    courseId: string,
    user: { id: string; userId?: string; role?: string }
  ): Promise<CourseEnrollment | null> {
    const course = await courseRepo.findByIdOrSlug(courseId);
    if (!course) {
      throw ApiError.notFound('Course not found');
    }
    const memberId = await this.getMemberId(user);
    return courseRepo.getEnrollment(course.id, memberId);
  }

  async getMyCourses(
    user: { id: string; userId?: string; role?: string }
  ): Promise<CourseEnrollment[]> {
    const memberId = await this.getMemberId(user);
    return courseRepo.getMyEnrollments(memberId);
  }

  // -------------------------------------------------------------
  // Lesson Progress & Completion
  // -------------------------------------------------------------
  async startLesson(
    lessonId: string,
    user: { id: string; userId?: string; role?: string }
  ): Promise<LessonProgress> {
    const { lesson, memberId } = await this.assertLessonAccess(lessonId, user);
    if (!memberId) {
      throw ApiError.badRequest('Student member record required');
    }
    return courseRepo.startLesson(lesson.id, memberId);
  }

  async updateProgress(
    lessonId: string,
    data: { progress_percentage: number; status?: any },
    user: { id: string; userId?: string; role?: string }
  ): Promise<LessonProgress> {
    const { lesson, memberId } = await this.assertLessonAccess(lessonId, user);
    if (!memberId) {
      throw ApiError.badRequest('Student member record required');
    }
    return courseRepo.updateProgress(lesson.id, memberId, data.progress_percentage, data.status);
  }

  async completeLesson(
    lessonId: string,
    user: { id: string; userId?: string; role?: string }
  ): Promise<LessonProgress> {
    const { lesson, memberId } = await this.assertLessonAccess(lessonId, user);
    if (!memberId) {
      throw ApiError.badRequest('Student member record required');
    }
    return courseRepo.updateProgress(lesson.id, memberId, 100, 'COMPLETED');
  }

  async getCourseProgress(
    courseId: string,
    user: { id: string; userId?: string; role?: string }
  ): Promise<CourseProgressSummary> {
    const course = await courseRepo.findByIdOrSlug(courseId);
    if (!course) {
      throw ApiError.notFound('Course not found');
    }
    const memberId = await this.getMemberId(user);
    const summary = await courseRepo.getCourseProgressSummary(course.id, memberId);
    if (!summary) {
      throw ApiError.notFound('Enrollment not found for this course');
    }
    return summary;
  }

  async getLessonProgress(
    lessonId: string,
    user: { id: string; userId?: string; role?: string }
  ): Promise<any> {
    const { lesson, memberId } = await this.assertLessonAccess(lessonId, user);
    if (!memberId) {
      throw ApiError.badRequest('Student member record required');
    }
    const full = await courseRepo.getLessonById(lesson.id, memberId);
    return {
      lessonId: lesson.id,
      status: full?.progress_status || 'NOT_STARTED',
      progressPercentage: full?.progress_percentage || 0,
      completedAt: full?.completed_at || null,
    };
  }

  // -------------------------------------------------------------
  // Course Analytics
  // -------------------------------------------------------------
  async getAnalytics(
    courseId: string,
    user: { id: string; userId?: string; role?: string }
  ): Promise<CourseAnalytics> {
    const course = await this.assertCanManageCourse(courseId, user);
    return courseRepo.getAnalytics(course.id);
  }
}

export const courseService = new CourseService();
