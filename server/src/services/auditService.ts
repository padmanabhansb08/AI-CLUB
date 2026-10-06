import { auditRepository, CreateAuditLogDTO } from '../repositories/auditRepository';
import { AuditLogEntry, AuditLogFilter } from '../types/admin';

// Sensitive keys to strip out before storing in audit logs
const SENSITIVE_KEYS = new Set([
  'password',
  'password_hash',
  'passwordHash',
  'token',
  'jwt',
  'secret',
  'accessToken',
  'refreshToken',
  'authorization',
]);

function sanitizeData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }
  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (SENSITIVE_KEYS.has(key)) {
      clean[key] = '[REDACTED]';
    } else if (typeof val === 'object' && val !== null) {
      clean[key] = sanitizeData(val);
    } else {
      clean[key] = val;
    }
  }
  return clean;
}

export const auditService = {
  logAction: async (dto: CreateAuditLogDTO): Promise<AuditLogEntry> => {
    try {
      const sanitizedBefore = sanitizeData(dto.beforeData);
      const sanitizedAfter = sanitizeData(dto.afterData);

      return await auditRepository.create({
        ...dto,
        beforeData: sanitizedBefore,
        afterData: sanitizedAfter,
      });
    } catch (err) {
      // In production, we log the audit failure without breaking the parent transaction if standalone
      console.error('[auditService] Failed to record audit log:', err);
      throw err;
    }
  },

  getAuditLogs: async (filter: AuditLogFilter = {}) => {
    return await auditRepository.findAll(filter);
  },

  getAuditLogById: async (id: string) => {
    return await auditRepository.findById(id);
  },
};
