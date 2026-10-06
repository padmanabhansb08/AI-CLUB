import { projectRepo, ProjectSearchParams } from '../repositories/projectRepository';
import { ApiError } from '../middleware/errorHandler';
import { ProjectItem, ProjectMembershipItem } from '../types/projects';
import { query } from '../db';

export const projectService = {
  async getProjects(params: ProjectSearchParams) {
    return projectRepo.findAll(params);
  },

  async getProjectById(idOrSlug: string, currentMemberId?: string): Promise<ProjectItem> {
    const project = await projectRepo.findById(idOrSlug, currentMemberId);
    if (!project) {
      throw new ApiError('NOT_FOUND', `Project not found`);
    }
    return project;
  },

  async createProject(data: any, ownerId?: string) {
    const projectData = {
      ...data,
      owner_id: ownerId || null,
      status: data.status || 'DRAFT',
    };
    const project = await projectRepo.create(projectData);

    // If created by a member, automatically assign them as OWNER membership
    if (ownerId) {
      await projectRepo.addMember(project.id, ownerId, 'OWNER', 'ACTIVE');
    }

    return project;
  },

  async updateProject(id: string, data: any, callerMemberId?: string, isAdmin = false) {
    const project = await projectRepo.findById(id);
    if (!project) {
      throw new ApiError('NOT_FOUND', 'Project not found');
    }

    if (!isAdmin && project.owner_id !== callerMemberId) {
      // Check if caller is LEAD role in project
      if (callerMemberId) {
        const mem = await projectRepo.getMembership(id, callerMemberId);
        if (!mem || mem.role !== 'LEAD' || mem.status !== 'ACTIVE') {
          throw new ApiError('FORBIDDEN', 'Only project owners, leads, or admins can update project');
        }
      } else {
        throw new ApiError('FORBIDDEN', 'Unauthorized to update project');
      }
    }

    return projectRepo.update(id, data);
  },

  async deleteProject(id: string, callerMemberId?: string, isAdmin = false) {
    const project = await projectRepo.findById(id);
    if (!project) {
      throw new ApiError('NOT_FOUND', 'Project not found');
    }

    if (!isAdmin && project.owner_id !== callerMemberId) {
      throw new ApiError('FORBIDDEN', 'Only project owner or admin can delete project');
    }

    await projectRepo.delete(id);
    return { success: true };
  },

  async publishProject(id: string) {
    const project = await projectRepo.findById(id);
    if (!project) {
      throw new ApiError('NOT_FOUND', 'Project not found');
    }

    if (project.status === 'OPEN' || project.status === 'IN_PROGRESS') {
      return project;
    }

    return projectRepo.update(id, { status: 'OPEN' });
  },

  // Project Memberships
  async requestJoinProject(
    projectId: string,
    memberId: string,
    role: string = 'MEMBER',
    _message?: string
  ): Promise<ProjectMembershipItem> {
    const project = await projectRepo.findById(projectId);
    if (!project) {
      throw new ApiError('NOT_FOUND', 'Project not found');
    }

    if (project.status === 'ARCHIVED' || project.status === 'CANCELLED') {
      throw new ApiError('BAD_REQUEST', 'Project is no longer accepting new members');
    }

    const existing = await projectRepo.getMembership(projectId, memberId);
    if (existing) {
      if (existing.status === 'ACTIVE') {
        throw new ApiError('BAD_REQUEST', 'You are already an active member of this project');
      }
      if (existing.status === 'PENDING') {
        throw new ApiError('BAD_REQUEST', 'Your join request is already pending review');
      }
    }

    return projectRepo.addMember(projectId, memberId, role, 'PENDING');
  },

  async leaveProject(projectId: string, memberId: string) {
    const existing = await projectRepo.getMembership(projectId, memberId);
    if (!existing) {
      return { message: 'Not a member' };
    }

    if (existing.role === 'OWNER') {
      throw new ApiError('BAD_REQUEST', 'Project owner cannot leave project without transferring ownership');
    }

    await projectRepo.removeMembership(projectId, memberId);
    return { success: true };
  },

  async getProjectMembers(projectId: string, status?: string) {
    const project = await projectRepo.findById(projectId);
    if (!project) {
      throw new ApiError('NOT_FOUND', 'Project not found');
    }
    return projectRepo.getMembers(projectId, status);
  },

  async updateProjectMembership(
    projectId: string,
    targetMemberId: string,
    data: { role?: string; status?: string },
    callerMemberId?: string,
    isAdmin = false
  ) {
    const project = await projectRepo.findById(projectId);
    if (!project) {
      throw new ApiError('NOT_FOUND', 'Project not found');
    }

    if (!isAdmin && project.owner_id !== callerMemberId) {
      if (callerMemberId) {
        const callerMem = await projectRepo.getMembership(projectId, callerMemberId);
        if (!callerMem || callerMem.role !== 'LEAD' || callerMem.status !== 'ACTIVE') {
          throw new ApiError('FORBIDDEN', 'Only project owners, leads, or admins can manage members');
        }
      } else {
        throw new ApiError('FORBIDDEN', 'Unauthorized');
      }
    }

    const updated = await projectRepo.updateMembership(projectId, targetMemberId, data);
    return updated;
  },

  async removeProjectMember(
    projectId: string,
    targetMemberId: string,
    callerMemberId?: string,
    isAdmin = false
  ) {
    const project = await projectRepo.findById(projectId);
    if (!project) {
      throw new ApiError('NOT_FOUND', 'Project not found');
    }

    if (!isAdmin && project.owner_id !== callerMemberId) {
      if (callerMemberId) {
        const callerMem = await projectRepo.getMembership(projectId, callerMemberId);
        if (!callerMem || callerMem.role !== 'LEAD' || callerMem.status !== 'ACTIVE') {
          throw new ApiError('FORBIDDEN', 'Only project owners, leads, or admins can remove members');
        }
      } else {
        throw new ApiError('FORBIDDEN', 'Unauthorized');
      }
    }

    await projectRepo.removeMembership(projectId, targetMemberId);
    return { success: true };
  },

  async getMyProjects(memberId: string) {
    return projectRepo.getMyProjects(memberId);
  },

  // Milestones
  async getMilestones(projectId: string) {
    const project = await projectRepo.findById(projectId);
    if (!project) {
      throw new ApiError('NOT_FOUND', 'Project not found');
    }
    return projectRepo.getMilestones(projectId);
  },

  async createMilestone(projectId: string, data: any, callerMemberId?: string, isAdmin = false) {
    const project = await projectRepo.findById(projectId);
    if (!project) {
      throw new ApiError('NOT_FOUND', 'Project not found');
    }

    if (!isAdmin && project.owner_id !== callerMemberId) {
      if (callerMemberId) {
        const callerMem = await projectRepo.getMembership(projectId, callerMemberId);
        if (!callerMem || callerMem.role !== 'LEAD' || callerMem.status !== 'ACTIVE') {
          throw new ApiError('FORBIDDEN', 'Only project leads, owners, or admins can add milestones');
        }
      } else {
        throw new ApiError('FORBIDDEN', 'Unauthorized');
      }
    }

    return projectRepo.createMilestone(projectId, data);
  },

  async updateMilestone(milestoneId: string, data: any, callerMemberId?: string, isAdmin = false) {
    const milestone = await projectRepo.getMilestoneById(milestoneId);
    if (!milestone) {
      throw new ApiError('NOT_FOUND', 'Milestone not found');
    }

    const project = await projectRepo.findById(milestone.project_id);
    if (project && !isAdmin && project.owner_id !== callerMemberId) {
      if (callerMemberId) {
        const callerMem = await projectRepo.getMembership(project.id, callerMemberId);
        if (!callerMem || callerMem.role !== 'LEAD' || callerMem.status !== 'ACTIVE') {
          throw new ApiError('FORBIDDEN', 'Only project leads, owners, or admins can update milestones');
        }
      } else {
        throw new ApiError('FORBIDDEN', 'Unauthorized');
      }
    }

    return projectRepo.updateMilestone(milestoneId, data);
  },

  async deleteMilestone(milestoneId: string, callerMemberId?: string, isAdmin = false) {
    const milestone = await projectRepo.getMilestoneById(milestoneId);
    if (!milestone) {
      throw new ApiError('NOT_FOUND', 'Milestone not found');
    }

    const project = await projectRepo.findById(milestone.project_id);
    if (project && !isAdmin && project.owner_id !== callerMemberId) {
      if (callerMemberId) {
        const callerMem = await projectRepo.getMembership(project.id, callerMemberId);
        if (!callerMem || callerMem.role !== 'LEAD' || callerMem.status !== 'ACTIVE') {
          throw new ApiError('FORBIDDEN', 'Only project leads, owners, or admins can delete milestones');
        }
      } else {
        throw new ApiError('FORBIDDEN', 'Unauthorized');
      }
    }

    await projectRepo.deleteMilestone(milestoneId);
    return { success: true };
  },
};
