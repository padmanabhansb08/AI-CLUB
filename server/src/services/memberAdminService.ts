import { memberAdminRepository } from '../repositories/memberAdminRepository';
import { auditService } from './auditService';
import { NotFoundError, ValidationError, ForbiddenError } from '../errors/AppError';
import { AdminMemberFilter } from '../types/admin';

const VALID_ROLES = ['student', 'instructor', 'admin', 'super_admin'];
const VALID_STATUSES = ['Active', 'Inactive', 'Suspended'];

export interface AdminActor {
  userId: string;
  role: string;
  ip?: string;
  userAgent?: string;
}

export const memberAdminService = {
  findMembers: async (filter: AdminMemberFilter) => {
    return await memberAdminRepository.findMembers(filter);
  },

  getMemberDetail: async (id: string) => {
    const detail = await memberAdminRepository.getMemberDetail(id);
    if (!detail) {
      throw new NotFoundError('Member not found');
    }
    return detail;
  },

  updateRole: async (actor: AdminActor, memberId: string, rawRole: string) => {
    const newRole = rawRole.toLowerCase().trim();
    if (!VALID_ROLES.includes(newRole)) {
      throw new ValidationError(`Invalid role "${rawRole}". Valid roles: ${VALID_ROLES.join(', ')}`);
    }

    const detail = await memberAdminRepository.getMemberDetail(memberId);
    if (!detail) {
      throw new NotFoundError('Member not found');
    }

    const currentRole = (detail.profile.role || '').toLowerCase();
    const actorRole = (actor.role || '').toLowerCase();

    // Prevent non-super_admin from assigning super_admin
    if (newRole === 'super_admin' && actorRole !== 'super_admin') {
      throw new ForbiddenError('Only super administrators can promote users to super_admin');
    }

    // Prevent lower admins from modifying super_admin accounts
    if (currentRole === 'super_admin' && actorRole !== 'super_admin') {
      throw new ForbiddenError('Cannot modify permissions of a super administrator');
    }

    // Apply role update
    const updated = await memberAdminRepository.updateRole(detail.profile.userId, newRole);

    // Audit log
    await auditService.logAction({
      actorId: actor.userId,
      action: 'MEMBER_ROLE_CHANGED',
      entityType: 'MEMBER',
      entityId: memberId,
      beforeData: {
        role: currentRole,
        userId: detail.profile.userId,
        email: detail.profile.userEmail,
        fullName: detail.profile.fullName,
      },
      afterData: {
        role: newRole,
        userId: detail.profile.userId,
        email: detail.profile.userEmail,
        fullName: detail.profile.fullName,
      },
      ipAddress: actor.ip,
      userAgent: actor.userAgent,
    });

    return {
      memberId,
      userId: detail.profile.userId,
      role: newRole,
      updatedAt: updated?.updatedAt,
    };
  },

  updateStatus: async (actor: AdminActor, memberId: string, rawStatus: string) => {
    // Normalize status to TitleCase (Active, Inactive, Suspended)
    const normalized = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();
    if (!VALID_STATUSES.includes(normalized)) {
      throw new ValidationError(`Invalid status "${rawStatus}". Valid statuses: ${VALID_STATUSES.join(', ')}`);
    }

    const detail = await memberAdminRepository.getMemberDetail(memberId);
    if (!detail) {
      throw new NotFoundError('Member not found');
    }

    const currentStatus = detail.profile.status;
    const currentRole = (detail.profile.role || '').toLowerCase();
    const actorRole = (actor.role || '').toLowerCase();

    // Non-super_admin cannot suspend super_admin
    if (currentRole === 'super_admin' && actorRole !== 'super_admin') {
      throw new ForbiddenError('Cannot change account status of a super administrator');
    }

    // Update status
    await memberAdminRepository.updateStatus(memberId, normalized);

    // Action name for audit
    let actionName = 'MEMBER_STATUS_CHANGED';
    if (normalized === 'Suspended') actionName = 'MEMBER_SUSPENDED';
    if (normalized === 'Active') actionName = 'MEMBER_ACTIVATED';

    // Audit log
    await auditService.logAction({
      actorId: actor.userId,
      action: actionName,
      entityType: 'MEMBER',
      entityId: memberId,
      beforeData: {
        status: currentStatus,
        userId: detail.profile.userId,
        fullName: detail.profile.fullName,
        email: detail.profile.userEmail,
      },
      afterData: {
        status: normalized,
        userId: detail.profile.userId,
        fullName: detail.profile.fullName,
        email: detail.profile.userEmail,
      },
      ipAddress: actor.ip,
      userAgent: actor.userAgent,
    });

    return {
      memberId,
      status: normalized,
      previousStatus: currentStatus,
    };
  },
};
