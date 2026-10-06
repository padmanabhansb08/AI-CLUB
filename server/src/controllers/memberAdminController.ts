import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { memberAdminService } from '../services/memberAdminService';
import { sendPaginated, sendSuccess } from '../utils/response';

export const memberAdminController = {
  getAll: async (req: AuthRequest, res: Response) => {
    try {
      const {
        page,
        limit,
        search,
        department,
        year,
        classSection,
        role,
        status,
        sortBy,
        sortOrder,
      } = req.query;

      const result = await memberAdminService.findMembers({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search as string,
        department: department as string,
        year: year ? Number(year) : undefined,
        classSection: classSection as string,
        role: role as string,
        status: status as string,
        sortBy: sortBy as any,
        sortOrder: sortOrder as any,
      });

      return sendPaginated(
        res,
        result.items,
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        'Members retrieved successfully'
      );
    } catch (err: any) {
      return res.status(err.statusCode || 500).json({
        success: false,
        error: {
          code: err.code || 'MEMBER_QUERY_ERROR',
          message: err.message || 'Failed to retrieve members',
        },
      });
    }
  },

  getById: async (req: AuthRequest, res: Response) => {
    try {
      const id = req.params.id as string;
      const detail = await memberAdminService.getMemberDetail(id);
      return res.status(200).json({
        success: true,
        data: detail,
        message: 'Member details retrieved successfully',
      });
    } catch (err: any) {
      return res.status(err.statusCode || 500).json({
        success: false,
        error: {
          code: err.code || 'MEMBER_NOT_FOUND',
          message: err.message || 'Member not found',
        },
      });
    }
  },

  updateRole: async (req: AuthRequest, res: Response) => {
    try {
      const id = req.params.id as string;
      const { role } = req.body;

      if (!role) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Role is required in request body',
          },
        });
      }

      const actor = {
        userId: req.user!.userId,
        role: req.user!.role,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      };

      const result = await memberAdminService.updateRole(actor, id, role);

      return res.status(200).json({
        success: true,
        data: result,
        message: `Member role updated to ${role} successfully`,
      });
    } catch (err: any) {
      return res.status(err.statusCode || 500).json({
        success: false,
        error: {
          code: err.code || 'ROLE_UPDATE_ERROR',
          message: err.message || 'Failed to update member role',
        },
      });
    }
  },

  updateStatus: async (req: AuthRequest, res: Response) => {
    try {
      const id = req.params.id as string;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Status is required in request body',
          },
        });
      }

      const actor = {
        userId: req.user!.userId,
        role: req.user!.role,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      };

      const result = await memberAdminService.updateStatus(actor, id, status);

      return res.status(200).json({
        success: true,
        data: result,
        message: `Member status updated to ${status} successfully`,
      });
    } catch (err: any) {
      return res.status(err.statusCode || 500).json({
        success: false,
        error: {
          code: err.code || 'STATUS_UPDATE_ERROR',
          message: err.message || 'Failed to update member status',
        },
      });
    }
  },
};
