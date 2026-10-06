import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { auditService } from '../services/auditService';

export const auditLogController = {
  getAuditLogs: async (req: AuthRequest, res: Response) => {
    try {
      const {
        page,
        limit,
        actorId,
        action,
        entityType,
        entityId,
        from,
        to,
        search,
      } = req.query;

      const result = await auditService.getAuditLogs({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        actorId: actorId as string,
        action: action as string,
        entityType: entityType as string,
        entityId: entityId as string,
        from: from as string,
        to: to as string,
        search: search as string,
      });

      return res.status(200).json({
        success: true,
        data: result,
        message: 'Audit logs retrieved successfully',
      });
    } catch (err: any) {
      return res.status(err.statusCode || 500).json({
        success: false,
        error: {
          code: err.code || 'AUDIT_LOG_ERROR',
          message: err.message || 'Failed to retrieve audit logs',
        },
      });
    }
  },

  getAuditLogById: async (req: AuthRequest, res: Response) => {
    try {
      const id = req.params.id as string;
      const log = await auditService.getAuditLogById(id);

      if (!log) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'AUDIT_LOG_NOT_FOUND',
            message: 'Audit log not found',
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: log,
        message: 'Audit log details retrieved successfully',
      });
    } catch (err: any) {
      return res.status(err.statusCode || 500).json({
        success: false,
        error: {
          code: err.code || 'AUDIT_LOG_ERROR',
          message: err.message || 'Failed to retrieve audit log',
        },
      });
    }
  },
};
