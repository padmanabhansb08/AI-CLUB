import { pool } from '../db';
import { AppError } from '../errors/AppError';

export const eventRepository = {
  async getAll(page: number, limit: number, filters: any = {}) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const values: any[] = [];
    let paramIndex = 1;

    // Status filter
    if (filters.status) {
      whereClause += ` AND events.status = $${paramIndex}`;
      values.push(filters.status.toLowerCase());
      paramIndex++;
    }

    // Event type filter (case-insensitive)
    if (filters.event_type) {
      whereClause += ` AND UPPER(events.event_type) = UPPER($${paramIndex})`;
      values.push(filters.event_type);
      paramIndex++;
    }

    // Search filter (title, description, location)
    if (filters.search) {
      whereClause += ` AND (events.title ILIKE $${paramIndex} OR events.description ILIKE $${paramIndex} OR events.location ILIKE $${paramIndex})`;
      values.push(`%${filters.search}%`);
      paramIndex++;
    }

    // Date range filters
    if (filters.upcoming) {
      whereClause += ` AND events.start_at > CURRENT_TIMESTAMP`;
    } else if (filters.past) {
      whereClause += ` AND events.end_at <= CURRENT_TIMESTAMP`;
    }

    if (filters.from) {
      whereClause += ` AND events.start_at >= $${paramIndex}`;
      values.push(new Date(filters.from).toISOString());
      paramIndex++;
    }

    if (filters.to) {
      whereClause += ` AND events.end_at <= $${paramIndex}`;
      values.push(new Date(filters.to).toISOString());
      paramIndex++;
    }

    // Safe sorting
    let sortColumn = 'events.start_at';
    let sortDirection = filters.past ? 'DESC' : 'ASC';

    const allowedSortFields: Record<string, string> = {
      date: 'events.start_at',
      start_at: 'events.start_at',
      created_at: 'events.created_at',
      title: 'events.title',
      status: 'events.status',
      registrations: 'registration_count',
    };

    if (filters.sortBy && allowedSortFields[filters.sortBy]) {
      sortColumn = allowedSortFields[filters.sortBy];
    }
    if (filters.sortOrder && ['asc', 'desc'].includes(filters.sortOrder.toLowerCase())) {
      sortDirection = filters.sortOrder.toUpperCase();
    }

    const countRes = await pool.query(`SELECT COUNT(*) FROM events ${whereClause}`, values);
    const total = parseInt(countRes.rows[0].count, 10);

    const query = `
      SELECT 
        events.id, events.title, events.description, events.event_type, 
        events.start_at, events.end_at, events.location, events.meeting_url, 
        events.organizer, events.capacity, events.status, 
        events.registration_open_at, events.registration_close_at, 
        events.cancellation_reason, events.created_by, events.created_at, events.updated_at,
        (
          SELECT COUNT(*)::int 
          FROM event_registrations er 
          WHERE er.event_id = events.id 
            AND er.status IN ('REGISTERED', 'registered', 'ATTENDED', 'attended')
        ) as registration_count,
        (
          SELECT COUNT(*)::int 
          FROM event_attendance ea 
          WHERE ea.event_id = events.id 
            AND ea.status IN ('PRESENT', 'present', 'LATE', 'late')
        ) as attended_count
      FROM events
      ${whereClause}
      ORDER BY ${sortColumn} ${sortDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    values.push(limit, offset);

    const res = await pool.query(query, values);
    return {
      data: res.rows.map(row => ({
        ...row,
        registration_count: parseInt(row.registration_count || '0', 10),
        attended_count: parseInt(row.attended_count || '0', 10),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  async getById(id: string, userId?: string) {
    const res = await pool.query(`
      SELECT 
        events.id, events.title, events.description, events.event_type, 
        events.start_at, events.end_at, events.location, events.meeting_url, 
        events.organizer, events.capacity, events.status, 
        events.registration_open_at, events.registration_close_at, 
        events.cancellation_reason, events.created_by, events.created_at, events.updated_at,
        (
          SELECT COUNT(*)::int 
          FROM event_registrations er 
          WHERE er.event_id = events.id 
            AND er.status IN ('REGISTERED', 'registered', 'ATTENDED', 'attended')
        ) as registration_count,
        (
          SELECT COUNT(*)::int 
          FROM event_attendance ea 
          WHERE ea.event_id = events.id 
            AND ea.status IN ('PRESENT', 'present', 'LATE', 'late')
        ) as attended_count
      FROM events
      WHERE events.id = $1
    `, [id]);

    if (res.rowCount === 0) return null;
    const event = res.rows[0];
    event.registration_count = parseInt(event.registration_count || '0', 10);
    event.attended_count = parseInt(event.attended_count || '0', 10);

    // If userId provided, retrieve student's individual registration & attendance status
    if (userId) {
      const regRes = await pool.query(`
        SELECT er.status as reg_status, er.id as registration_id, er.registered_at, er.cancelled_at,
               ea.status as attendance_status, ea.checked_in_at
        FROM members m
        LEFT JOIN event_registrations er ON er.member_id = m.id AND er.event_id = $1
        LEFT JOIN event_attendance ea ON ea.member_id = m.id AND ea.event_id = $1
        WHERE m.user_id = $2
      `, [id, userId]);

      if (regRes.rowCount && regRes.rowCount > 0 && regRes.rows[0].reg_status) {
        event.currentStudentRegistrationStatus = regRes.rows[0].reg_status.toUpperCase();
        event.currentStudentRegistrationId = regRes.rows[0].registration_id;
        event.currentStudentRegisteredAt = regRes.rows[0].registered_at;
        event.currentStudentAttendanceStatus = regRes.rows[0].attendance_status ? regRes.rows[0].attendance_status.toUpperCase() : null;
      } else {
        event.currentStudentRegistrationStatus = 'UNREGISTERED';
        event.currentStudentAttendanceStatus = null;
      }
    }

    return event;
  },

  async create(data: any, createdBy: string) {
    const res = await pool.query(`
      INSERT INTO events (
        title, description, event_type, start_at, end_at, location, 
        meeting_url, organizer, capacity, status, registration_open_at, 
        registration_close_at, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *, 0 as registration_count, 0 as attended_count
    `, [
      data.title,
      data.description,
      data.event_type.toUpperCase(),
      data.start_at,
      data.end_at,
      data.location || null,
      data.meeting_url || null,
      data.organizer || null,
      data.capacity !== undefined ? data.capacity : null,
      data.status || 'draft',
      data.registration_open_at || null,
      data.registration_close_at || null,
      createdBy,
    ]);
    return res.rows[0];
  },

  async update(id: string, data: any) {
    const fields = Object.keys(data).filter(k => k !== 'id' && data[k] !== undefined);
    if (fields.length === 0) return this.getById(id);

    // Normalize event_type if present
    if (data.event_type) {
      data.event_type = data.event_type.toUpperCase();
    }

    const values = fields.map(k => data[k]);
    const setClause = fields.map((k, i) => `${k} = $${i + 1}`).join(', ');
    
    values.push(id);
    const query = `
      UPDATE events
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${values.length}
      RETURNING *
    `;

    const res = await pool.query(query, values);
    if (res.rowCount === 0) return null;
    return this.getById(id);
  },

  async publish(id: string) {
    const res = await pool.query(`
      UPDATE events
      SET status = 'published', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id]);
    if (res.rowCount === 0) return null;
    return this.getById(id);
  },

  async cancel(id: string, reason: string) {
    const res = await pool.query(`
      UPDATE events
      SET status = 'cancelled', cancellation_reason = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id, reason]);
    if (res.rowCount === 0) return null;
    return this.getById(id);
  },

  async complete(id: string) {
    const res = await pool.query(`
      UPDATE events
      SET status = 'completed', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id]);
    if (res.rowCount === 0) return null;
    return this.getById(id);
  },

  async delete(id: string) {
    const res = await pool.query('DELETE FROM events WHERE id = $1 RETURNING id', [id]);
    return res.rowCount !== null && res.rowCount > 0;
  },

  async registerMemberTransactional(eventId: string, memberId: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Lock event row to prevent concurrent race condition over capacity
      const eventRes = await client.query(`
        SELECT id, title, status, capacity, start_at, end_at, 
               registration_open_at, registration_close_at
        FROM events
        WHERE id = $1
        FOR UPDATE
      `, [eventId]);

      if (eventRes.rowCount === 0) {
        throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found');
      }

      const event = eventRes.rows[0];

      if (event.status === 'cancelled') {
        throw new AppError(400, 'EVENT_CANCELLED', 'Cannot register for a cancelled event');
      }
      if (event.status !== 'published') {
        throw new AppError(400, 'EVENT_NOT_PUBLISHED', 'Registration is only available for published events');
      }

      // 2. Validate registration window
      const now = new Date();
      if (event.registration_open_at && now < new Date(event.registration_open_at)) {
        throw new AppError(400, 'REGISTRATION_NOT_OPEN', 'Registration has not opened yet');
      }
      if (event.registration_close_at && now > new Date(event.registration_close_at)) {
        throw new AppError(400, 'REGISTRATION_CLOSED', 'Registration for this event has closed');
      }

      // 3. Check existing registration
      const existingRes = await client.query(`
        SELECT id, status, registered_at
        FROM event_registrations
        WHERE event_id = $1 AND member_id = $2
        FOR UPDATE
      `, [eventId, memberId]);

      if (existingRes.rowCount && existingRes.rowCount > 0) {
        const existing = existingRes.rows[0];
        const statusUpper = existing.status.toUpperCase();
        if (statusUpper === 'REGISTERED' || statusUpper === 'ATTENDED') {
          throw new AppError(409, 'ALREADY_REGISTERED', 'You are already registered for this event');
        }
      }

      // 4. Check capacity against active registrations
      const countRes = await client.query(`
        SELECT COUNT(*)::int as count
        FROM event_registrations
        WHERE event_id = $1 AND status IN ('REGISTERED', 'registered', 'ATTENDED', 'attended')
      `, [eventId]);
      const currentCount = parseInt(countRes.rows[0].count, 10);

      if (event.capacity !== null && event.capacity !== undefined && currentCount >= event.capacity) {
        throw new AppError(409, 'EVENT_FULL', 'This event has reached full capacity');
      }

      let registrationRecord: any;

      if (existingRes.rowCount && existingRes.rowCount > 0) {
        // Re-activate a previously cancelled registration
        const updateRes = await client.query(`
          UPDATE event_registrations
          SET status = 'REGISTERED', registered_at = CURRENT_TIMESTAMP, 
              cancelled_at = NULL, cancellation_reason = NULL
          WHERE event_id = $1 AND member_id = $2
          RETURNING id, event_id, status, registered_at
        `, [eventId, memberId]);
        registrationRecord = updateRes.rows[0];
      } else {
        // Insert new registration
        const insertRes = await client.query(`
          INSERT INTO event_registrations (event_id, member_id, status, registered_at)
          VALUES ($1, $2, 'REGISTERED', CURRENT_TIMESTAMP)
          RETURNING id, event_id, status, registered_at
        `, [eventId, memberId]);
        registrationRecord = insertRes.rows[0];
      }

      await client.query('COMMIT');

      return {
        id: registrationRecord.id,
        eventId: registrationRecord.event_id,
        status: registrationRecord.status.toUpperCase(),
        registeredAt: registrationRecord.registered_at,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async cancelRegistration(eventId: string, memberId: string, reason?: string) {
    const existing = await pool.query(`
      SELECT id, status, registered_at 
      FROM event_registrations
      WHERE event_id = $1 AND member_id = $2
    `, [eventId, memberId]);

    if (existing.rowCount === 0) {
      throw new AppError(404, 'NOT_REGISTERED', 'Registration record not found for this event');
    }

    if (existing.rows[0].status.toUpperCase() === 'CANCELLED') {
      throw new AppError(400, 'REGISTRATION_CANCELLED', 'Registration has already been cancelled');
    }

    const res = await pool.query(`
      UPDATE event_registrations
      SET status = 'CANCELLED', cancelled_at = CURRENT_TIMESTAMP, cancellation_reason = $3
      WHERE event_id = $1 AND member_id = $2
      RETURNING id, event_id, status, registered_at, cancelled_at
    `, [eventId, memberId, reason || null]);

    const reg = res.rows[0];
    return {
      id: reg.id,
      eventId: reg.event_id,
      status: reg.status.toUpperCase(),
      cancelledAt: reg.cancelled_at,
    };
  },

  async getRegistrations(eventId: string, search?: string) {
    let query = `
      SELECT 
        er.id as registration_id, 
        er.registered_at, 
        er.status as registration_status,
        er.cancelled_at,
        er.cancellation_reason,
        m.id as member_id,
        m.full_name, 
        m.register_number, 
        m.department, 
        m.class_section,
        m.year,
        COALESCE(ea.status, 'NOT_MARKED') as attendance_status,
        ea.checked_in_at,
        ea.id as attendance_id
      FROM event_registrations er
      JOIN members m ON er.member_id = m.id
      LEFT JOIN event_attendance ea ON ea.event_id = er.event_id AND ea.member_id = er.member_id
      WHERE er.event_id = $1
    `;
    const params: any[] = [eventId];

    if (search && search.trim().length > 0) {
      query += ` AND (m.full_name ILIKE $2 OR m.register_number ILIKE $2 OR m.department ILIKE $2)`;
      params.push(`%${search.trim()}%`);
    }

    query += ` ORDER BY er.registered_at ASC`;

    const res = await pool.query(query, params);
    return res.rows.map(row => ({
      ...row,
      registration_status: row.registration_status.toUpperCase(),
      attendance_status: row.attendance_status.toUpperCase(),
    }));
  },

  async getMemberRegistrations(userId: string) {
    const res = await pool.query(`
      SELECT 
        e.id, e.title, e.description, e.event_type, e.start_at, e.end_at, 
        e.location, e.meeting_url, e.organizer, e.status as event_status, 
        er.id as registration_id, er.registered_at, er.cancelled_at, er.status as registration_status,
        COALESCE(ea.status, 'NOT_MARKED') as attendance_status, ea.checked_in_at
      FROM event_registrations er
      JOIN events e ON er.event_id = e.id
      JOIN members m ON er.member_id = m.id
      LEFT JOIN event_attendance ea ON ea.event_id = e.id AND ea.member_id = m.id
      WHERE m.user_id = $1
      ORDER BY e.start_at ASC
    `, [userId]);

    return res.rows.map(row => ({
      ...row,
      registration_status: row.registration_status.toUpperCase(),
      attendance_status: row.attendance_status.toUpperCase(),
    }));
  },

  async getAttendance(eventId: string) {
    const eventRes = await pool.query(`
      SELECT id, title, status, capacity, start_at, end_at,
        (
          SELECT COUNT(*)::int 
          FROM event_registrations 
          WHERE event_id = $1 AND status IN ('REGISTERED', 'registered', 'ATTENDED', 'attended')
        ) as total_registrations
      FROM events
      WHERE id = $1
    `, [eventId]);

    if (eventRes.rowCount === 0) {
      throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found');
    }

    const event = eventRes.rows[0];
    const totalRegistrations = parseInt(event.total_registrations || '0', 10);

    // Aggregate attendance counts
    const countsRes = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status IN ('PRESENT', 'present'))::int as present,
        COUNT(*) FILTER (WHERE status IN ('ABSENT', 'absent'))::int as absent,
        COUNT(*) FILTER (WHERE status IN ('LATE', 'late'))::int as late
      FROM event_attendance
      WHERE event_id = $1
    `, [eventId]);

    const present = parseInt(countsRes.rows[0].present || '0', 10);
    const absent = parseInt(countsRes.rows[0].absent || '0', 10);
    const late = parseInt(countsRes.rows[0].late || '0', 10);
    const markedTotal = present + absent + late;
    const notMarked = Math.max(0, totalRegistrations - markedTotal);
    const attendanceRate = totalRegistrations > 0 
      ? Math.round(((present + late) / totalRegistrations) * 1000) / 10 
      : 0;

    const attendees = await this.getRegistrations(eventId);

    return {
      event: {
        id: event.id,
        title: event.title,
        status: event.status,
        capacity: event.capacity,
        startAt: event.start_at,
        endAt: event.end_at,
      },
      stats: {
        totalRegistrations,
        capacity: event.capacity,
        present,
        absent,
        late,
        notMarked,
        attendanceRate,
      },
      attendees,
    };
  },

  async markAttendanceTransactional(
    eventId: string,
    records: Array<{ memberId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' }>,
    markedByUserId: string
  ) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const eventRes = await client.query(`
        SELECT id, status FROM events WHERE id = $1
      `, [eventId]);

      if (eventRes.rowCount === 0) {
        throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found');
      }

      const event = eventRes.rows[0];
      if (event.status !== 'published' && event.status !== 'completed') {
        throw new AppError(
          400,
          'ATTENDANCE_NOT_ALLOWED',
          'Attendance can only be marked for PUBLISHED or COMPLETED events'
        );
      }

      for (const record of records) {
        const normStatus = record.status.toUpperCase();
        
        // Upsert into event_attendance
        await client.query(`
          INSERT INTO event_attendance (
            event_id, member_id, status, marked_by, checked_in_at, updated_at
          ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT (event_id, member_id) 
          DO UPDATE SET 
            status = EXCLUDED.status, 
            marked_by = EXCLUDED.marked_by, 
            updated_at = CURRENT_TIMESTAMP
        `, [eventId, record.memberId, normStatus, markedByUserId]);

        // Reflect in event_registrations if registered
        if (normStatus === 'PRESENT' || normStatus === 'LATE') {
          await client.query(`
            UPDATE event_registrations
            SET status = 'ATTENDED'
            WHERE event_id = $1 AND member_id = $2 AND status != 'CANCELLED'
          `, [eventId, record.memberId]);
        } else if (normStatus === 'ABSENT') {
          await client.query(`
            UPDATE event_registrations
            SET status = 'NO_SHOW'
            WHERE event_id = $1 AND member_id = $2 AND status != 'CANCELLED'
          `, [eventId, record.memberId]);
        }
      }

      await client.query('COMMIT');
      return { success: true, count: records.length };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async isMemberRegistered(eventId: string, userId: string) {
    const res = await pool.query(`
      SELECT 1 FROM event_registrations er
      JOIN members m ON er.member_id = m.id
      WHERE er.event_id = $1 AND m.user_id = $2
        AND er.status IN ('REGISTERED', 'registered', 'ATTENDED', 'attended')
    `, [eventId, userId]);
    return res.rowCount !== null && res.rowCount > 0;
  },

  async getMemberByUserId(userId: string) {
    const res = await pool.query('SELECT id FROM members WHERE user_id = $1', [userId]);
    return res.rows[0];
  },
};
