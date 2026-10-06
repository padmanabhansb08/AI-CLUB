import { query, pool } from '../db';
import {
  Course,
  CourseModule,
  CourseLesson,
  CourseEnrollment,
  LessonProgress,
  CourseProgressSummary,
  CourseAnalytics,
  CourseStatus,
  LessonProgressStatus,
} from '../types/courses';

export interface CourseFilterParams {
  search?: string;
  category?: string;
  difficulty?: string;
  instructor_id?: string;
  status?: string;
  page?: number;
  limit?: number;
  memberId?: string;
}

export const courseRepo = {
  // -------------------------------------------------------------
  // Course Discovery & CRUD
  // -------------------------------------------------------------
  findPaginated: async (params: CourseFilterParams = {}) => {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    // Filter by status (default to PUBLISHED if not specified)
    if (params.status && params.status !== 'ALL') {
      conditions.push(`c.status = $${idx++}`);
      values.push(params.status);
    } else if (!params.status) {
      conditions.push(`c.status = 'PUBLISHED'`);
    }

    if (params.category && params.category !== 'All') {
      conditions.push(`(c.category = $${idx++} OR c.category ILIKE $${idx - 1})`);
      values.push(params.category);
    }

    if (params.difficulty && params.difficulty !== 'All') {
      conditions.push(`c.difficulty = $${idx++}`);
      values.push(params.difficulty);
    }

    if (params.instructor_id) {
      conditions.push(`c.instructor_id = $${idx++}`);
      values.push(params.instructor_id);
    }

    if (params.search && params.search.trim()) {
      const q = `%${params.search.trim()}%`;
      conditions.push(`(
        c.title ILIKE $${idx} OR 
        c.description ILIKE $${idx} OR 
        COALESCE(c.short_description, '') ILIKE $${idx} OR
        c.category ILIKE $${idx}
      )`);
      values.push(q);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count query
    const countQuery = `SELECT COUNT(*) as total FROM courses c ${whereClause}`;
    const countRes = await query(countQuery, values);
    const total = parseInt(countRes.rows[0].total, 10);

    // Member subquery
    let memberSelect = `
      NULL::text as current_enrollment_status,
      NULL::int as current_progress_percentage
    `;
    if (params.memberId) {
      values.push(params.memberId);
      const mIdx = idx++;
      memberSelect = `
        (SELECT ce.status FROM course_enrollments ce WHERE ce.course_id = c.id AND ce.member_id = $${mIdx} LIMIT 1) as current_enrollment_status,
        (
          SELECT 
            CASE 
              WHEN COUNT(cl.id) = 0 THEN 0
              ELSE ROUND((COUNT(lp.id) FILTER (WHERE lp.status = 'COMPLETED')::numeric / COUNT(cl.id)::numeric) * 100)::int
            END
          FROM course_modules cm
          JOIN course_lessons cl ON cl.module_id = cm.id
          LEFT JOIN lesson_progress lp ON lp.lesson_id = cl.id AND lp.member_id = $${mIdx}
          WHERE cm.course_id = c.id
        ) as current_progress_percentage
      `;
    }

    values.push(limit, offset);
    const listQuery = `
      SELECT 
        c.*,
        m.full_name as instructor_name,
        m.profile_photo_url as instructor_photo,
        (SELECT COUNT(*) FROM course_modules cm WHERE cm.course_id = c.id)::int as modules_count,
        (
          SELECT COUNT(*) 
          FROM course_modules cm 
          JOIN course_lessons cl ON cl.module_id = cm.id 
          WHERE cm.course_id = c.id
        )::int as lessons_count,
        (SELECT COUNT(*) FROM course_enrollments ce WHERE ce.course_id = c.id AND ce.status != 'DROPPED')::int as enrollments_count,
        ${memberSelect}
      FROM courses c
      LEFT JOIN members m ON m.id = c.instructor_id
      ${whereClause}
      ORDER BY c.featured DESC NULLS LAST, c.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;

    const res = await query(listQuery, values);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: res.rows as Course[],
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  },

  findByIdOrSlug: async (identifier: string, memberId?: string): Promise<Course | null> => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    const whereCond = isUuid ? 'c.id = $1' : 'c.slug = $1';

    let memberSelect = `
      NULL::text as current_enrollment_status,
      NULL::int as current_progress_percentage
    `;
    const values: any[] = [identifier];

    if (memberId) {
      values.push(memberId);
      memberSelect = `
        (SELECT ce.status FROM course_enrollments ce WHERE ce.course_id = c.id AND ce.member_id = $2 LIMIT 1) as current_enrollment_status,
        (
          SELECT 
            CASE 
              WHEN COUNT(cl.id) = 0 THEN 0
              ELSE ROUND((COUNT(lp.id) FILTER (WHERE lp.status = 'COMPLETED')::numeric / COUNT(cl.id)::numeric) * 100)::int
            END
          FROM course_modules cm
          JOIN course_lessons cl ON cl.module_id = cm.id
          LEFT JOIN lesson_progress lp ON lp.lesson_id = cl.id AND lp.member_id = $2
          WHERE cm.course_id = c.id
        ) as current_progress_percentage
      `;
    }

    const sql = `
      SELECT 
        c.*,
        m.full_name as instructor_name,
        m.profile_photo_url as instructor_photo,
        (SELECT COUNT(*) FROM course_modules cm WHERE cm.course_id = c.id)::int as modules_count,
        (
          SELECT COUNT(*) 
          FROM course_modules cm 
          JOIN course_lessons cl ON cl.module_id = cm.id 
          WHERE cm.course_id = c.id
        )::int as lessons_count,
        (SELECT COUNT(*) FROM course_enrollments ce WHERE ce.course_id = c.id AND ce.status != 'DROPPED')::int as enrollments_count,
        (
          SELECT COALESCE(json_agg(s.name), '[]'::json)
          FROM course_skills cs
          JOIN skills s ON s.id = cs.skill_id
          WHERE cs.course_id = c.id
        ) as skills,
        ${memberSelect}
      FROM courses c
      LEFT JOIN members m ON m.id = c.instructor_id
      WHERE ${whereCond}
      LIMIT 1
    `;

    const res = await query(sql, values);
    return res.rows[0] || null;
  },

  create: async (data: Partial<Course>): Promise<Course> => {
    // Generate clean slug if not given
    let slug = data.slug;
    if (!slug && data.title) {
      const baseSlug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      const rand = Math.floor(1000 + Math.random() * 9000);
      slug = `${baseSlug}-${rand}`;
    }

    const res = await query(
      `
      INSERT INTO courses (
        title, slug, short_description, description, thumbnail_url,
        category, difficulty, instructor_id, status, estimated_duration_minutes,
        learning_objectives, prerequisites, technologies, language,
        provider, tracking_method, tracking_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
      `,
      [
        data.title,
        slug,
        data.short_description || null,
        data.description,
        data.thumbnail_url || null,
        data.category,
        data.difficulty,
        data.instructor_id || null,
        data.status || 'DRAFT',
        data.estimated_duration_minutes || 0,
        JSON.stringify(data.learning_objectives || []),
        JSON.stringify(data.prerequisites || []),
        JSON.stringify(data.technologies || []),
        data.language || 'English',
        data.provider || 'AI CLUB',
        'INTERNAL',
        'CONNECTED',
      ]
    );

    return res.rows[0];
  },

  update: async (id: string, data: Partial<Course>): Promise<Course | null> => {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(data.title);
    }
    if (data.slug !== undefined) {
      fields.push(`slug = $${idx++}`);
      values.push(data.slug);
    }
    if (data.short_description !== undefined) {
      fields.push(`short_description = $${idx++}`);
      values.push(data.short_description);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(data.description);
    }
    if (data.thumbnail_url !== undefined) {
      fields.push(`thumbnail_url = $${idx++}`);
      values.push(data.thumbnail_url);
    }
    if (data.category !== undefined) {
      fields.push(`category = $${idx++}`);
      values.push(data.category);
    }
    if (data.difficulty !== undefined) {
      fields.push(`difficulty = $${idx++}`);
      values.push(data.difficulty);
    }
    if (data.instructor_id !== undefined) {
      fields.push(`instructor_id = $${idx++}`);
      values.push(data.instructor_id);
    }
    if (data.status !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(data.status);
      if (data.status === 'PUBLISHED') {
        fields.push(`published_at = COALESCE(published_at, CURRENT_TIMESTAMP)`);
      }
    }
    if (data.estimated_duration_minutes !== undefined) {
      fields.push(`estimated_duration_minutes = $${idx++}`);
      values.push(data.estimated_duration_minutes);
    }
    if (data.learning_objectives !== undefined) {
      fields.push(`learning_objectives = $${idx++}`);
      values.push(JSON.stringify(data.learning_objectives));
    }
    if (data.prerequisites !== undefined) {
      fields.push(`prerequisites = $${idx++}`);
      values.push(JSON.stringify(data.prerequisites));
    }
    if (data.technologies !== undefined) {
      fields.push(`technologies = $${idx++}`);
      values.push(JSON.stringify(data.technologies));
    }
    if (data.language !== undefined) {
      fields.push(`language = $${idx++}`);
      values.push(data.language);
    }

    if (fields.length === 0) {
      return courseRepo.findByIdOrSlug(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const sql = `
      UPDATE courses
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;

    const res = await query(sql, values);
    return res.rows[0] || null;
  },

  delete: async (id: string): Promise<boolean> => {
    const res = await query('DELETE FROM courses WHERE id = $1 RETURNING id', [id]);
    return (res.rowCount ?? 0) > 0;
  },

  // -------------------------------------------------------------
  // Course Skills Integration
  // -------------------------------------------------------------
  setCourseSkills: async (courseId: string, skillNames: string[]) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM course_skills WHERE course_id = $1', [courseId]);

      for (const name of skillNames) {
        if (!name || !name.trim()) continue;
        const trimmed = name.trim();
        // Find or create skill in skills table
        const skillRes = await client.query(
          `
          INSERT INTO skills (name, category)
          VALUES ($1, 'Technical')
          ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
          RETURNING id
          `,
          [trimmed]
        );
        const skillId = skillRes.rows[0].id;
        await client.query(
          `
          INSERT INTO course_skills (course_id, skill_id)
          VALUES ($1, $2)
          ON CONFLICT (course_id, skill_id) DO NOTHING
          `,
          [courseId, skillId]
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  // -------------------------------------------------------------
  // Curriculum: Modules & Lessons
  // -------------------------------------------------------------
  getCurriculum: async (courseId: string, memberId?: string): Promise<CourseModule[]> => {
    // 1. Fetch modules ordered by position
    const modRes = await query(
      `
      SELECT * FROM course_modules
      WHERE course_id = $1
      ORDER BY position ASC, created_at ASC
      `,
      [courseId]
    );

    if (modRes.rows.length === 0) {
      return [];
    }

    const modules: CourseModule[] = modRes.rows;
    const moduleIds = modules.map((m) => m.id);

    // 2. Fetch all lessons for these modules with optional student progress
    let progressJoin = `
      NULL::text as progress_status,
      0::int as progress_percentage,
      NULL::timestamptz as completed_at
    `;
    const values: any[] = [moduleIds];

    if (memberId) {
      values.push(memberId);
      progressJoin = `
        lp.status as progress_status,
        COALESCE(lp.progress_percentage, 0)::int as progress_percentage,
        lp.completed_at
      `;
    }

    const lessonSql = `
      SELECT 
        cl.*,
        ${progressJoin}
      FROM course_lessons cl
      ${memberId ? 'LEFT JOIN lesson_progress lp ON lp.lesson_id = cl.id AND lp.member_id = $2' : ''}
      WHERE cl.module_id = ANY($1)
      ORDER BY cl.position ASC, cl.created_at ASC
    `;

    const lessonRes = await query(lessonSql, values);
    const lessonsByModule: Record<string, CourseLesson[]> = {};

    for (const lesson of lessonRes.rows) {
      if (!lessonsByModule[lesson.module_id]) {
        lessonsByModule[lesson.module_id] = [];
      }
      lessonsByModule[lesson.module_id].push(lesson);
    }

    for (const mod of modules) {
      mod.lessons = lessonsByModule[mod.id] || [];
    }

    return modules;
  },

  getModules: async (courseId: string): Promise<CourseModule[]> => {
    const res = await query(
      `SELECT * FROM course_modules WHERE course_id = $1 ORDER BY position ASC, created_at ASC`,
      [courseId]
    );
    return res.rows;
  },

  getModuleById: async (moduleId: string): Promise<CourseModule | null> => {
    const res = await query(`SELECT * FROM course_modules WHERE id = $1`, [moduleId]);
    return res.rows[0] || null;
  },

  createModule: async (courseId: string, data: { title: string; description?: string | null; position?: number }): Promise<CourseModule> => {
    let position = data.position;
    if (position === undefined) {
      const maxRes = await query(
        `SELECT COALESCE(MAX(position), 0) + 1 as next_pos FROM course_modules WHERE course_id = $1`,
        [courseId]
      );
      position = parseInt(maxRes.rows[0].next_pos, 10);
    }

    const res = await query(
      `
      INSERT INTO course_modules (course_id, title, description, position)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [courseId, data.title, data.description || null, position]
    );
    return res.rows[0];
  },

  updateModule: async (moduleId: string, data: { title?: string; description?: string | null; position?: number }): Promise<CourseModule | null> => {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(data.title);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(data.description);
    }
    if (data.position !== undefined) {
      fields.push(`position = $${idx++}`);
      values.push(data.position);
    }

    if (fields.length === 0) {
      return courseRepo.getModuleById(moduleId);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(moduleId);

    const res = await query(
      `UPDATE course_modules SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return res.rows[0] || null;
  },

  deleteModule: async (moduleId: string): Promise<boolean> => {
    const res = await query(`DELETE FROM course_modules WHERE id = $1 RETURNING id`, [moduleId]);
    return (res.rowCount ?? 0) > 0;
  },

  getLessons: async (moduleId: string): Promise<CourseLesson[]> => {
    const res = await query(
      `SELECT * FROM course_lessons WHERE module_id = $1 ORDER BY position ASC, created_at ASC`,
      [moduleId]
    );
    return res.rows;
  },

  getLessonById: async (lessonId: string, memberId?: string): Promise<CourseLesson | null> => {
    let progressSelect = `
      NULL::text as progress_status,
      0::int as progress_percentage,
      NULL::timestamptz as completed_at
    `;
    const values: any[] = [lessonId];

    if (memberId) {
      values.push(memberId);
      progressSelect = `
        lp.status as progress_status,
        COALESCE(lp.progress_percentage, 0)::int as progress_percentage,
        lp.completed_at
      `;
    }

    const sql = `
      SELECT 
        cl.*,
        cm.course_id,
        ${progressSelect}
      FROM course_lessons cl
      JOIN course_modules cm ON cm.id = cl.module_id
      ${memberId ? 'LEFT JOIN lesson_progress lp ON lp.lesson_id = cl.id AND lp.member_id = $2' : ''}
      WHERE cl.id = $1
      LIMIT 1
    `;

    const res = await query(sql, values);
    return res.rows[0] || null;
  },

  createLesson: async (moduleId: string, data: Partial<CourseLesson>): Promise<CourseLesson> => {
    let position = data.position;
    if (position === undefined) {
      const maxRes = await query(
        `SELECT COALESCE(MAX(position), 0) + 1 as next_pos FROM course_lessons WHERE module_id = $1`,
        [moduleId]
      );
      position = parseInt(maxRes.rows[0].next_pos, 10);
    }

    const res = await query(
      `
      INSERT INTO course_lessons (
        module_id, title, slug, description, content_type, content,
        video_url, external_url, position, duration_minutes, is_preview
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
      `,
      [
        moduleId,
        data.title,
        data.slug || null,
        data.description || null,
        data.content_type || 'ARTICLE',
        data.content || null,
        data.video_url || null,
        data.external_url || null,
        position,
        data.duration_minutes || 0,
        data.is_preview || false,
      ]
    );
    return res.rows[0];
  },

  updateLesson: async (lessonId: string, data: Partial<CourseLesson>): Promise<CourseLesson | null> => {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(data.title);
    }
    if (data.slug !== undefined) {
      fields.push(`slug = $${idx++}`);
      values.push(data.slug);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(data.description);
    }
    if (data.content_type !== undefined) {
      fields.push(`content_type = $${idx++}`);
      values.push(data.content_type);
    }
    if (data.content !== undefined) {
      fields.push(`content = $${idx++}`);
      values.push(data.content);
    }
    if (data.video_url !== undefined) {
      fields.push(`video_url = $${idx++}`);
      values.push(data.video_url);
    }
    if (data.external_url !== undefined) {
      fields.push(`external_url = $${idx++}`);
      values.push(data.external_url);
    }
    if (data.position !== undefined) {
      fields.push(`position = $${idx++}`);
      values.push(data.position);
    }
    if (data.duration_minutes !== undefined) {
      fields.push(`duration_minutes = $${idx++}`);
      values.push(data.duration_minutes);
    }
    if (data.is_preview !== undefined) {
      fields.push(`is_preview = $${idx++}`);
      values.push(data.is_preview);
    }

    if (fields.length === 0) {
      return courseRepo.getLessonById(lessonId);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(lessonId);

    const res = await query(
      `UPDATE course_lessons SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return res.rows[0] || null;
  },

  deleteLesson: async (lessonId: string): Promise<boolean> => {
    const res = await query(`DELETE FROM course_lessons WHERE id = $1 RETURNING id`, [lessonId]);
    return (res.rowCount ?? 0) > 0;
  },

  // -------------------------------------------------------------
  // Enrollments
  // -------------------------------------------------------------
  enroll: async (courseId: string, memberId: string): Promise<CourseEnrollment> => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check existing enrollment
      const existing = await client.query(
        `SELECT * FROM course_enrollments WHERE course_id = $1 AND member_id = $2`,
        [courseId, memberId]
      );

      let enrollment: CourseEnrollment;

      if (existing.rows.length > 0) {
        if (existing.rows[0].status === 'ENROLLED' || existing.rows[0].status === 'COMPLETED') {
          await client.query('ROLLBACK');
          const err: any = new Error('Already actively enrolled in this course');
          err.code = 'ALREADY_ENROLLED';
          throw err;
        }

        // Re-enroll if previously dropped
        const reRes = await client.query(
          `
          UPDATE course_enrollments
          SET status = 'ENROLLED', enrolled_at = CURRENT_TIMESTAMP, last_accessed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
          RETURNING *
          `,
          [existing.rows[0].id]
        );
        enrollment = reRes.rows[0];
      } else {
        const insRes = await client.query(
          `
          INSERT INTO course_enrollments (course_id, member_id, status)
          VALUES ($1, $2, 'ENROLLED')
          RETURNING *
          `,
          [courseId, memberId]
        );
        enrollment = insRes.rows[0];
      }

      // Sync legacy course_progress record for dashboard stats compatibility
      await client.query(
        `
        INSERT INTO course_progress (course_id, member_id, status, progress_percent, tracking_method)
        VALUES ($1, $2, 'In Progress', 0, 'INTERNAL')
        ON CONFLICT (course_id, member_id) DO UPDATE SET
          status = 'In Progress',
          updated_at = CURRENT_TIMESTAMP
        `,
        [courseId, memberId]
      );

      await client.query('COMMIT');
      return enrollment;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  dropEnrollment: async (courseId: string, memberId: string): Promise<boolean> => {
    const res = await query(
      `
      UPDATE course_enrollments
      SET status = 'DROPPED', updated_at = CURRENT_TIMESTAMP
      WHERE course_id = $1 AND member_id = $2 AND status != 'DROPPED'
      RETURNING id
      `,
      [courseId, memberId]
    );
    return (res.rowCount ?? 0) > 0;
  },

  getEnrollment: async (courseId: string, memberId: string): Promise<CourseEnrollment | null> => {
    const res = await query(
      `SELECT * FROM course_enrollments WHERE course_id = $1 AND member_id = $2`,
      [courseId, memberId]
    );
    return res.rows[0] || null;
  },

  getMyEnrollments: async (memberId: string): Promise<CourseEnrollment[]> => {
    const sql = `
      SELECT 
        ce.*,
        json_build_object(
          'id', c.id,
          'title', c.title,
          'slug', c.slug,
          'short_description', c.short_description,
          'description', c.description,
          'thumbnail_url', c.thumbnail_url,
          'category', c.category,
          'difficulty', c.difficulty,
          'estimated_duration_minutes', c.estimated_duration_minutes,
          'status', c.status,
          'instructor_name', m.full_name,
          'modules_count', (SELECT COUNT(*) FROM course_modules cm WHERE cm.course_id = c.id)::int,
          'lessons_count', (
            SELECT COUNT(*) 
            FROM course_modules cm 
            JOIN course_lessons cl ON cl.module_id = cm.id 
            WHERE cm.course_id = c.id
          )::int
        ) as course,
        (
          SELECT 
            CASE 
              WHEN COUNT(cl.id) = 0 THEN 0
              ELSE ROUND((COUNT(lp.id) FILTER (WHERE lp.status = 'COMPLETED')::numeric / COUNT(cl.id)::numeric) * 100)::int
            END
          FROM course_modules cm
          JOIN course_lessons cl ON cl.module_id = cm.id
          LEFT JOIN lesson_progress lp ON lp.lesson_id = cl.id AND lp.member_id = $1
          WHERE cm.course_id = c.id
        ) as progress_percentage
      FROM course_enrollments ce
      JOIN courses c ON c.id = ce.course_id
      LEFT JOIN members m ON m.id = c.instructor_id
      WHERE ce.member_id = $1 AND ce.status != 'DROPPED'
      ORDER BY ce.last_accessed_at DESC
    `;

    const res = await query(sql, [memberId]);
    return res.rows;
  },

  // -------------------------------------------------------------
  // Lesson Progress & Completion
  // -------------------------------------------------------------
  startLesson: async (lessonId: string, memberId: string): Promise<LessonProgress> => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const res = await client.query(
        `
        INSERT INTO lesson_progress (lesson_id, member_id, status, started_at, last_accessed_at)
        VALUES ($1, $2, 'IN_PROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (lesson_id, member_id) DO UPDATE SET
          status = CASE 
            WHEN lesson_progress.status = 'COMPLETED' THEN 'COMPLETED'
            ELSE 'IN_PROGRESS'
          END,
          last_accessed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
        `,
        [lessonId, memberId]
      );

      // Update course_enrollments last_accessed_at
      await client.query(
        `
        UPDATE course_enrollments ce
        SET last_accessed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        FROM course_modules cm
        JOIN course_lessons cl ON cl.module_id = cm.id
        WHERE cl.id = $1 AND ce.course_id = cm.course_id AND ce.member_id = $2
        `,
        [lessonId, memberId]
      );

      await client.query('COMMIT');
      return res.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  updateProgress: async (
    lessonId: string,
    memberId: string,
    progressPercentage: number,
    statusOverride?: LessonProgressStatus
  ): Promise<LessonProgress> => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const isCompleted = progressPercentage >= 100 || statusOverride === 'COMPLETED';
      const status: LessonProgressStatus = isCompleted
        ? 'COMPLETED'
        : statusOverride || (progressPercentage > 0 ? 'IN_PROGRESS' : 'NOT_STARTED');

      const res = await client.query(
        `
        INSERT INTO lesson_progress (lesson_id, member_id, status, progress_percentage, started_at, completed_at, last_accessed_at)
        VALUES (
          $1, $2, $3, $4, CURRENT_TIMESTAMP,
          ${isCompleted ? 'CURRENT_TIMESTAMP' : 'NULL'},
          CURRENT_TIMESTAMP
        )
        ON CONFLICT (lesson_id, member_id) DO UPDATE SET
          status = $3,
          progress_percentage = $4,
          completed_at = CASE 
            WHEN $3 = 'COMPLETED' THEN COALESCE(lesson_progress.completed_at, CURRENT_TIMESTAMP)
            ELSE lesson_progress.completed_at
          END,
          last_accessed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
        `,
        [lessonId, memberId, status, Math.min(100, Math.max(0, progressPercentage))]
      );

      // Re-evaluate entire course completion
      const courseLookup = await client.query(
        `
        SELECT cm.course_id
        FROM course_lessons cl
        JOIN course_modules cm ON cm.id = cl.module_id
        WHERE cl.id = $1
        LIMIT 1
        `,
        [lessonId]
      );

      if (courseLookup.rows.length > 0) {
        const courseId = courseLookup.rows[0].course_id;

        const countsRes = await client.query(
          `
          SELECT 
            COUNT(cl.id)::int as total_lessons,
            COUNT(lp.id) FILTER (WHERE lp.status = 'COMPLETED')::int as completed_lessons
          FROM course_modules cm
          JOIN course_lessons cl ON cl.module_id = cm.id
          LEFT JOIN lesson_progress lp ON lp.lesson_id = cl.id AND lp.member_id = $2
          WHERE cm.course_id = $1
          `,
          [courseId, memberId]
        );

        const total = parseInt(countsRes.rows[0].total_lessons, 10);
        const completed = parseInt(countsRes.rows[0].completed_lessons, 10);
        const overallPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

        if (total > 0 && completed === total) {
          // Course completely finished!
          await client.query(
            `
            UPDATE course_enrollments
            SET 
              status = 'COMPLETED',
              completed_at = COALESCE(completed_at, CURRENT_TIMESTAMP),
              last_accessed_at = CURRENT_TIMESTAMP,
              updated_at = CURRENT_TIMESTAMP
            WHERE course_id = $1 AND member_id = $2
            `,
            [courseId, memberId]
          );

          await client.query(
            `
            UPDATE course_progress
            SET status = 'Completed', progress_percent = 100, completed_at = COALESCE(completed_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP
            WHERE course_id = $1 AND member_id = $2
            `,
            [courseId, memberId]
          );
        } else {
          // In progress
          await client.query(
            `
            UPDATE course_enrollments
            SET last_accessed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE course_id = $1 AND member_id = $2
            `,
            [courseId, memberId]
          );

          await client.query(
            `
            UPDATE course_progress
            SET progress_percent = $3, updated_at = CURRENT_TIMESTAMP
            WHERE course_id = $1 AND member_id = $2
            `,
            [courseId, memberId, overallPercent]
          );
        }
      }

      await client.query('COMMIT');
      return res.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  getCourseProgressSummary: async (courseId: string, memberId: string): Promise<CourseProgressSummary | null> => {
    // 1. Get enrollment
    const enrRes = await query(
      `SELECT * FROM course_enrollments WHERE course_id = $1 AND member_id = $2`,
      [courseId, memberId]
    );

    if (enrRes.rows.length === 0) {
      return null;
    }

    const enrollment = enrRes.rows[0];

    // 2. Aggregate lessons and progress
    const aggRes = await query(
      `
      SELECT 
        COUNT(cl.id)::int as total_lessons,
        COUNT(lp.id) FILTER (WHERE lp.status = 'COMPLETED')::int as completed_lessons
      FROM course_modules cm
      JOIN course_lessons cl ON cl.module_id = cm.id
      LEFT JOIN lesson_progress lp ON lp.lesson_id = cl.id AND lp.member_id = $2
      WHERE cm.course_id = $1
      `,
      [courseId, memberId]
    );

    const total = parseInt(aggRes.rows[0].total_lessons, 10);
    const completed = parseInt(aggRes.rows[0].completed_lessons, 10);
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // 3. Resume logic:
    // Priority:
    // a) Last accessed incomplete lesson
    // b) First incomplete lesson
    // c) First lesson
    const nextLessonRes = await query(
      `
      SELECT cl.id, cl.title, cl.module_id, cl.content_type
      FROM course_modules cm
      JOIN course_lessons cl ON cl.module_id = cm.id
      LEFT JOIN lesson_progress lp ON lp.lesson_id = cl.id AND lp.member_id = $2
      WHERE cm.course_id = $1 AND (lp.status IS NULL OR lp.status != 'COMPLETED')
      ORDER BY 
        (lp.last_accessed_at IS NOT NULL) DESC,
        lp.last_accessed_at DESC NULLS LAST,
        cm.position ASC,
        cl.position ASC
      LIMIT 1
      `,
      [courseId, memberId]
    );

    let currentLesson = nextLessonRes.rows[0]
      ? {
          id: nextLessonRes.rows[0].id,
          title: nextLessonRes.rows[0].title,
          moduleId: nextLessonRes.rows[0].module_id,
          contentType: nextLessonRes.rows[0].content_type,
        }
      : null;

    // If all completed, return first lesson
    if (!currentLesson && total > 0) {
      const firstRes = await query(
        `
        SELECT cl.id, cl.title, cl.module_id, cl.content_type
        FROM course_modules cm
        JOIN course_lessons cl ON cl.module_id = cm.id
        WHERE cm.course_id = $1
        ORDER BY cm.position ASC, cl.position ASC
        LIMIT 1
        `,
        [courseId]
      );
      if (firstRes.rows[0]) {
        currentLesson = {
          id: firstRes.rows[0].id,
          title: firstRes.rows[0].title,
          moduleId: firstRes.rows[0].module_id,
          contentType: firstRes.rows[0].content_type,
        };
      }
    }

    return {
      courseId,
      enrollmentStatus: enrollment.status,
      progress: {
        percentage,
        completedLessons: completed,
        totalLessons: total,
      },
      currentLesson,
    };
  },

  getAnalytics: async (courseId: string): Promise<CourseAnalytics> => {
    const res = await query(
      `
      SELECT 
        COUNT(ce.id)::int as total_enrollments,
        COUNT(ce.id) FILTER (WHERE ce.status = 'ENROLLED')::int as active_learners,
        COUNT(ce.id) FILTER (WHERE ce.status = 'COMPLETED')::int as completed_learners,
        CASE 
          WHEN COUNT(ce.id) = 0 THEN 0
          ELSE ROUND((COUNT(ce.id) FILTER (WHERE ce.status = 'COMPLETED')::numeric / COUNT(ce.id)::numeric) * 100)::int
        END as completion_rate
      FROM course_enrollments ce
      WHERE ce.course_id = $1 AND ce.status != 'DROPPED'
      `,
      [courseId]
    );

    const stats = res.rows[0];

    // Compute average progress across learners
    const avgRes = await query(
      `
      SELECT 
        COALESCE(ROUND(AVG(sub.progress_pct)), 0)::int as avg_progress
      FROM (
        SELECT 
          ce.member_id,
          CASE 
            WHEN COUNT(cl.id) = 0 THEN 0
            ELSE ROUND((COUNT(lp.id) FILTER (WHERE lp.status = 'COMPLETED')::numeric / COUNT(cl.id)::numeric) * 100)
          END as progress_pct
        FROM course_enrollments ce
        CROSS JOIN course_modules cm
        JOIN course_lessons cl ON cl.module_id = cm.id
        LEFT JOIN lesson_progress lp ON lp.lesson_id = cl.id AND lp.member_id = ce.member_id
        WHERE ce.course_id = $1 AND cm.course_id = $1 AND ce.status != 'DROPPED'
        GROUP BY ce.member_id
      ) sub
      `,
      [courseId]
    );

    return {
      courseId,
      totalEnrollments: stats.total_enrollments || 0,
      activeLearners: stats.active_learners || 0,
      completedLearners: stats.completed_learners || 0,
      completionRate: stats.completion_rate || 0,
      averageProgress: avgRes.rows[0]?.avg_progress || 0,
    };
  },

  // -------------------------------------------------------------
  // Legacy Adapter Methods for backward compatibility
  // -------------------------------------------------------------
  findAll: async (page = 1, limit = 20) => {
    const res = await courseRepo.findPaginated({ page, limit, status: 'ALL' });
    return { items: res.items, total: res.pagination.total, page, limit };
  },

  findById: async (id: string) => {
    return courseRepo.findByIdOrSlug(id);
  },

  getProgress: async (memberId: string, courseId: string) => {
    const res = await query('SELECT * FROM course_progress WHERE member_id = $1 AND course_id = $2', [memberId, courseId]);
    return res.rows[0];
  },

  getProgressByUserId: async (userId: string) => {
    const res = await query(
      `
      SELECT cp.* 
      FROM course_progress cp
      JOIN members m ON cp.member_id = m.id
      WHERE m.user_id = $1
      `,
      [userId]
    );
    return res.rows;
  },
};