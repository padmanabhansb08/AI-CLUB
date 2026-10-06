import { pool, query } from '../db';
import { ProjectItem, ProjectMembershipItem, ProjectMilestoneItem } from '../types/projects';

export interface ProjectSearchParams {
  search?: string;
  domain?: string;
  difficulty?: string;
  status?: string;
  page?: number;
  limit?: number;
  sort?: 'latest' | 'popular' | 'progress';
  currentMemberId?: string;
  isAdmin?: boolean;
}

export const projectRepo = {
  findAll: async (params: ProjectSearchParams = {}) => {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    // Non-admins cannot see DRAFT projects unless they are the owner
    if (!params.isAdmin) {
      if (params.currentMemberId) {
        conditions.push(`(p.status != 'DRAFT' OR p.owner_id = $${idx})`);
        values.push(params.currentMemberId);
        idx++;
      } else {
        conditions.push(`p.status != 'DRAFT'`);
      }
    }

    if (params.domain && params.domain !== 'ALL') {
      conditions.push(`UPPER(p.domain) = UPPER($${idx})`);
      values.push(params.domain);
      idx++;
    }

    if (params.difficulty && params.difficulty !== 'ALL') {
      conditions.push(`UPPER(p.difficulty) = UPPER($${idx})`);
      values.push(params.difficulty);
      idx++;
    }

    if (params.status && params.status !== 'ALL') {
      conditions.push(`UPPER(p.status) = UPPER($${idx})`);
      values.push(params.status);
      idx++;
    }

    if (params.search && params.search.trim()) {
      const s = `%${params.search.trim()}%`;
      conditions.push(
        `(p.title ILIKE $${idx} OR p.short_description ILIKE $${idx} OR COALESCE(p.description, '') ILIKE $${idx} OR p.technologies::text ILIKE $${idx})`
      );
      values.push(s);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Member context parameters
    let memberSubquery = 'NULL as current_member_status, NULL as current_member_role';
    if (params.currentMemberId) {
      values.push(params.currentMemberId);
      const memberParamIdx = idx;
      idx++;
      memberSubquery = `
        (SELECT pm.status FROM project_memberships pm WHERE pm.project_id = p.id AND pm.member_id = $${memberParamIdx}) as current_member_status,
        (SELECT pm.role FROM project_memberships pm WHERE pm.project_id = p.id AND pm.member_id = $${memberParamIdx}) as current_member_role
      `;
    }

    // Determine sort
    let orderBy = 'p.created_at DESC';
    if (params.sort === 'popular') {
      orderBy = 'members_count DESC, p.created_at DESC';
    } else if (params.sort === 'progress') {
      orderBy = 'p.progress_percentage DESC, p.created_at DESC';
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM projects p
      ${whereClause}
    `;

    const selectQuery = `
      SELECT 
        p.*,
        COALESCE(m.full_name, 'Club Admin') as owner_name,
        (SELECT COUNT(*)::int FROM project_memberships pm WHERE pm.project_id = p.id AND pm.status = 'ACTIVE') as members_count,
        (SELECT COUNT(*)::int FROM project_teams pt WHERE pt.project_id = p.id) as teams_count,
        (SELECT COUNT(*)::int FROM project_milestones pms WHERE pms.project_id = p.id) as milestones_count,
        (SELECT COUNT(*)::int FROM project_milestones pms WHERE pms.project_id = p.id AND pms.status = 'COMPLETED') as completed_milestones_count,
        (SELECT COUNT(*)::int FROM project_interests pi WHERE pi.project_id = p.id) as interested_count,
        ${memberSubquery}
      FROM projects p
      LEFT JOIN members m ON p.owner_id = m.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    values.push(limit, offset);

    const [countRes, itemsRes] = await Promise.all([
      query(countQuery, values.slice(0, values.length - 2 - (params.currentMemberId ? 1 : 0))),
      query(selectQuery, values),
    ]);

    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    return {
      items: itemsRes.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },

  findById: async (idOrSlug: string, currentMemberId?: string): Promise<ProjectItem | null> => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    const condition = isUuid ? 'p.id = $1' : 'p.slug = $1';

    let memberSelect = 'NULL as current_member_status, NULL as current_member_role';
    const values: any[] = [idOrSlug];

    if (currentMemberId) {
      values.push(currentMemberId);
      memberSelect = `
        (SELECT pm.status FROM project_memberships pm WHERE pm.project_id = p.id AND pm.member_id = $2) as current_member_status,
        (SELECT pm.role FROM project_memberships pm WHERE pm.project_id = p.id AND pm.member_id = $2) as current_member_role
      `;
    }

    const res = await query(
      `
      SELECT 
        p.*,
        COALESCE(m.full_name, 'Club Admin') as owner_name,
        (SELECT COUNT(*)::int FROM project_memberships pm WHERE pm.project_id = p.id AND pm.status = 'ACTIVE') as members_count,
        (SELECT COUNT(*)::int FROM project_memberships pm WHERE pm.project_id = p.id AND pm.status = 'PENDING') as pending_members_count,
        (SELECT COUNT(*)::int FROM project_teams pt WHERE pt.project_id = p.id) as teams_count,
        (SELECT COUNT(*)::int FROM project_milestones pms WHERE pms.project_id = p.id) as milestones_count,
        (SELECT COUNT(*)::int FROM project_milestones pms WHERE pms.project_id = p.id AND pms.status = 'COMPLETED') as completed_milestones_count,
        (SELECT COUNT(*)::int FROM project_interests pi WHERE pi.project_id = p.id) as interested_count,
        ${memberSelect}
      FROM projects p
      LEFT JOIN members m ON p.owner_id = m.id
      WHERE ${condition}
    `,
      values
    );

    return res.rows[0] || null;
  },

  create: async (data: any) => {
    let slug = data.slug;
    if (!slug && data.title) {
      slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    // Ensure slug uniqueness
    if (slug) {
      const existing = await query('SELECT id FROM projects WHERE slug = $1', [slug]);
      if (existing.rowCount && existing.rowCount > 0) {
        slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
    }

    const insertData: any = {
      ...data,
      category: data.category || data.domain || 'OTHER',
      domain: data.domain || data.category || 'OTHER',
      description: data.description || data.overview || data.short_description || '',
      short_description: data.short_description || data.description || '',
      slug,
      technologies: JSON.stringify(data.technologies || []),
      requirements: JSON.stringify(data.requirements || []),
      objectives: JSON.stringify(data.objectives || []),
      learning_outcomes: JSON.stringify(data.learning_outcomes || []),
    };

    const keys = Object.keys(insertData);
    const vals = Object.values(insertData);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

    const res = await query(
      `INSERT INTO projects (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      vals
    );
    return res.rows[0];
  },

  update: async (id: string, data: any) => {
    const updateData = { ...data };

    if (updateData.technologies && Array.isArray(updateData.technologies)) {
      updateData.technologies = JSON.stringify(updateData.technologies);
    }
    if (updateData.requirements && Array.isArray(updateData.requirements)) {
      updateData.requirements = JSON.stringify(updateData.requirements);
    }
    if (updateData.objectives && Array.isArray(updateData.objectives)) {
      updateData.objectives = JSON.stringify(updateData.objectives);
    }
    if (updateData.learning_outcomes && Array.isArray(updateData.learning_outcomes)) {
      updateData.learning_outcomes = JSON.stringify(updateData.learning_outcomes);
    }

    const keys = Object.keys(updateData);
    if (keys.length === 0) return projectRepo.findById(id);

    const vals = Object.values(updateData);
    const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    vals.push(id);

    const res = await query(
      `UPDATE projects SET ${sets}, updated_at = CURRENT_TIMESTAMP WHERE id = $${vals.length} RETURNING *`,
      vals
    );
    return res.rows[0];
  },

  delete: async (id: string) => {
    await query('DELETE FROM projects WHERE id = $1', [id]);
  },

  // Project Memberships
  getMembers: async (projectId: string, status?: string): Promise<ProjectMembershipItem[]> => {
    const conditions = ['pm.project_id = $1'];
    const values: any[] = [projectId];

    if (status && status !== 'ALL') {
      conditions.push('pm.status = $2');
      values.push(status);
    }

    const res = await query(
      `
      SELECT 
        pm.*,
        m.full_name,
        m.register_number,
        m.department,
        m.class_section,
        m.year,
        m.profile_photo_url
      FROM project_memberships pm
      JOIN members m ON pm.member_id = m.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY 
        CASE pm.role
          WHEN 'OWNER' THEN 1
          WHEN 'LEAD' THEN 2
          WHEN 'MENTOR' THEN 3
          WHEN 'CONTRIBUTOR' THEN 4
          ELSE 5
        END,
        pm.created_at ASC
    `,
      values
    );

    return res.rows;
  },

  getMembership: async (projectId: string, memberId: string): Promise<ProjectMembershipItem | null> => {
    const res = await query(
      `SELECT * FROM project_memberships WHERE project_id = $1 AND member_id = $2`,
      [projectId, memberId]
    );
    return res.rows[0] || null;
  },

  addMember: async (
    projectId: string,
    memberId: string,
    role: string = 'MEMBER',
    status: string = 'PENDING'
  ) => {
    const joinedAt = status === 'ACTIVE' ? new Date().toISOString() : null;
    const res = await query(
      `
      INSERT INTO project_memberships (project_id, member_id, role, status, joined_at)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (project_id, member_id) 
      DO UPDATE SET 
        role = EXCLUDED.role,
        status = EXCLUDED.status,
        joined_at = CASE WHEN EXCLUDED.status = 'ACTIVE' AND project_memberships.joined_at IS NULL THEN CURRENT_TIMESTAMP ELSE project_memberships.joined_at END,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `,
      [projectId, memberId, role, status, joinedAt]
    );
    return res.rows[0];
  },

  updateMembership: async (
    projectId: string,
    memberId: string,
    data: { role?: string; status?: string }
  ) => {
    const sets: string[] = [];
    const values: any[] = [projectId, memberId];
    let idx = 3;

    if (data.role) {
      sets.push(`role = $${idx}`);
      values.push(data.role);
      idx++;
    }

    if (data.status) {
      sets.push(`status = $${idx}`);
      values.push(data.status);
      if (data.status === 'ACTIVE') {
        sets.push(`joined_at = COALESCE(joined_at, CURRENT_TIMESTAMP)`);
      }
      idx++;
    }

    if (sets.length === 0) return projectRepo.getMembership(projectId, memberId);

    sets.push(`updated_at = CURRENT_TIMESTAMP`);

    const res = await query(
      `
      UPDATE project_memberships
      SET ${sets.join(', ')}
      WHERE project_id = $1 AND member_id = $2
      RETURNING *
    `,
      values
    );
    return res.rows[0];
  },

  removeMembership: async (projectId: string, memberId: string) => {
    const res = await query(
      `DELETE FROM project_memberships WHERE project_id = $1 AND member_id = $2 RETURNING *`,
      [projectId, memberId]
    );
    return res.rowCount && res.rowCount > 0;
  },

  getMyProjects: async (memberId: string) => {
    const res = await query(
      `
      SELECT 
        p.*,
        pm.role as current_member_role,
        pm.status as current_member_status,
        pm.joined_at as member_joined_at,
        (SELECT COUNT(*)::int FROM project_memberships m WHERE m.project_id = p.id AND m.status = 'ACTIVE') as members_count,
        (SELECT COUNT(*)::int FROM project_teams pt WHERE pt.project_id = p.id) as teams_count,
        (SELECT COUNT(*)::int FROM project_milestones pms WHERE pms.project_id = p.id) as milestones_count,
        (SELECT COUNT(*)::int FROM project_milestones pms WHERE pms.project_id = p.id AND pms.status = 'COMPLETED') as completed_milestones_count
      FROM project_memberships pm
      JOIN projects p ON pm.project_id = p.id
      WHERE pm.member_id = $1
      ORDER BY pm.updated_at DESC
    `,
      [memberId]
    );
    return res.rows;
  },

  // Milestones
  getMilestones: async (projectId: string): Promise<ProjectMilestoneItem[]> => {
    const res = await query(
      `SELECT * FROM project_milestones WHERE project_id = $1 ORDER BY due_date ASC NULLS LAST, created_at ASC`,
      [projectId]
    );
    return res.rows;
  },

  getMilestoneById: async (milestoneId: string): Promise<ProjectMilestoneItem | null> => {
    const res = await query(`SELECT * FROM project_milestones WHERE id = $1`, [milestoneId]);
    return res.rows[0] || null;
  },

  createMilestone: async (projectId: string, data: any): Promise<ProjectMilestoneItem> => {
    const res = await query(
      `
      INSERT INTO project_milestones (project_id, title, description, due_date, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
      [projectId, data.title, data.description || null, data.due_date || null, data.status || 'TODO']
    );

    await projectRepo.recalculateProjectProgress(projectId);
    return res.rows[0];
  },

  updateMilestone: async (milestoneId: string, data: any): Promise<ProjectMilestoneItem | null> => {
    const keys = Object.keys(data);
    if (keys.length === 0) return projectRepo.getMilestoneById(milestoneId);

    const sets: string[] = [];
    const values: any[] = [];
    keys.forEach((k, i) => {
      sets.push(`${k} = $${i + 1}`);
      values.push(data[k]);
    });

    values.push(milestoneId);
    const res = await query(
      `
      UPDATE project_milestones 
      SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${values.length} 
      RETURNING *
    `,
      values
    );

    if (res.rows[0]) {
      await projectRepo.recalculateProjectProgress(res.rows[0].project_id);
    }
    return res.rows[0];
  },

  deleteMilestone: async (milestoneId: string) => {
    const milestone = await projectRepo.getMilestoneById(milestoneId);
    if (!milestone) return false;

    await query(`DELETE FROM project_milestones WHERE id = $1`, [milestoneId]);
    await projectRepo.recalculateProjectProgress(milestone.project_id);
    return true;
  },

  recalculateProjectProgress: async (projectId: string) => {
    const res = await query(
      `
      SELECT 
        COUNT(*)::int as total,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END)::int as completed
      FROM project_milestones
      WHERE project_id = $1
    `,
      [projectId]
    );

    const total = res.rows[0]?.total || 0;
    const completed = res.rows[0]?.completed || 0;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    await query(
      `UPDATE projects SET progress_percentage = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [percentage, projectId]
    );

    return percentage;
  },

  // Legacy interest support
  addInterest: async (userId: string, projectId: string) => {
    await query(
      `
      INSERT INTO project_interests (member_id, project_id) 
      SELECT id, $2 FROM members WHERE user_id = $1
      ON CONFLICT DO NOTHING
    `,
      [userId, projectId]
    );
  },

  removeInterest: async (userId: string, projectId: string) => {
    await query(
      `
      DELETE FROM project_interests 
      WHERE member_id = (SELECT id FROM members WHERE user_id = $1) AND project_id = $2
    `,
      [userId, projectId]
    );
  },
};