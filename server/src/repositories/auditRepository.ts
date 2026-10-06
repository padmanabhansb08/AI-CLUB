import { pool } from '../db';
import { AuditLogEntry, AuditLogFilter } from '../types/admin';

export interface CreateAuditLogDTO {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  beforeData?: any;
  afterData?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export const auditRepository = {
  create: async (data: CreateAuditLogDTO): Promise<AuditLogEntry> => {
    const query = `
      INSERT INTO audit_logs (
        actor_id, action, entity_type, entity_id, before_data, after_data, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING 
        id, 
        actor_id as "actorId", 
        action, 
        entity_type as "entityType", 
        entity_id as "entityId", 
        before_data as "beforeData", 
        after_data as "afterData", 
        ip_address as "ipAddress", 
        user_agent as "userAgent", 
        created_at as "createdAt"
    `;
    const res = await pool.query(query, [
      data.actorId || null,
      data.action,
      data.entityType,
      String(data.entityId),
      data.beforeData ? JSON.stringify(data.beforeData) : null,
      data.afterData ? JSON.stringify(data.afterData) : null,
      data.ipAddress || null,
      data.userAgent || null,
    ]);
    return res.rows[0];
  },

  findAll: async (filter: AuditLogFilter = {}): Promise<{
    items: AuditLogEntry[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    const page = Math.max(1, Number(filter.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filter.limit) || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = ['1=1'];
    const values: any[] = [];
    let paramIdx = 1;

    if (filter.actorId) {
      conditions.push(`al.actor_id = $${paramIdx++}`);
      values.push(filter.actorId);
    }

    if (filter.action) {
      conditions.push(`al.action = $${paramIdx++}`);
      values.push(filter.action);
    }

    if (filter.entityType) {
      conditions.push(`al.entity_type = $${paramIdx++}`);
      values.push(filter.entityType);
    }

    if (filter.entityId) {
      conditions.push(`al.entity_id = $${paramIdx++}`);
      values.push(filter.entityId);
    }

    if (filter.from) {
      conditions.push(`al.created_at >= $${paramIdx++}`);
      values.push(filter.from);
    }

    if (filter.to) {
      conditions.push(`al.created_at <= $${paramIdx++}`);
      values.push(filter.to);
    }

    if (filter.search) {
      conditions.push(`(
        al.action ILIKE $${paramIdx} OR 
        al.entity_type ILIKE $${paramIdx} OR 
        al.entity_id ILIKE $${paramIdx} OR 
        u.email ILIKE $${paramIdx} OR 
        m.full_name ILIKE $${paramIdx}
      )`);
      values.push(`%${filter.search}%`);
      paramIdx++;
    }

    const whereClause = conditions.join(' AND ');

    // Total count
    const countQuery = `
      SELECT COUNT(*)::int as total
      FROM audit_logs al
      LEFT JOIN users u ON al.actor_id = u.id
      LEFT JOIN members m ON m.user_id = u.id
      WHERE ${whereClause}
    `;
    const countRes = await pool.query(countQuery, values);
    const total = countRes.rows[0]?.total || 0;

    // Items
    const itemsQuery = `
      SELECT 
        al.id, 
        al.actor_id as "actorId", 
        al.action, 
        al.entity_type as "entityType", 
        al.entity_id as "entityId", 
        al.before_data as "beforeData", 
        al.after_data as "afterData", 
        al.ip_address as "ipAddress", 
        al.user_agent as "userAgent", 
        al.created_at as "createdAt",
        u.email as "actorEmail",
        m.full_name as "actorName"
      FROM audit_logs al
      LEFT JOIN users u ON al.actor_id = u.id
      LEFT JOIN members m ON m.user_id = u.id
      WHERE ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT $${paramIdx++} OFFSET $${paramIdx++}
    `;
    const itemsRes = await pool.query(itemsQuery, [...values, limit, offset]);

    return {
      items: itemsRes.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },

  findById: async (id: string): Promise<AuditLogEntry | null> => {
    const query = `
      SELECT 
        al.id, 
        al.actor_id as "actorId", 
        al.action, 
        al.entity_type as "entityType", 
        al.entity_id as "entityId", 
        al.before_data as "beforeData", 
        al.after_data as "afterData", 
        al.ip_address as "ipAddress", 
        al.user_agent as "userAgent", 
        al.created_at as "createdAt",
        u.email as "actorEmail",
        m.full_name as "actorName"
      FROM audit_logs al
      LEFT JOIN users u ON al.actor_id = u.id
      LEFT JOIN members m ON m.user_id = u.id
      WHERE al.id = $1
    `;
    const res = await pool.query(query, [id]);
    return res.rows[0] || null;
  },
};
