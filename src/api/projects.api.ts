import { apiClient } from './client';
import type {
  ProjectItem,
  ProjectMembershipItem,
  TeamItem,
  TeamInvitationItem,
  ProjectMilestoneItem,
} from '../types/projects';

export interface ProjectSearchParams {
  search?: string;
  domain?: string;
  difficulty?: string;
  status?: string;
  page?: number;
  limit?: number;
  sort?: 'latest' | 'popular' | 'progress';
}

export interface PaginatedProjectsResponse {
  items: ProjectItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const projectsApi = {
  // Projects
  async getProjects(params: ProjectSearchParams = {}): Promise<PaginatedProjectsResponse> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.domain && params.domain !== 'ALL') query.append('domain', params.domain);
    if (params.difficulty && params.difficulty !== 'ALL') query.append('difficulty', params.difficulty);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.sort) query.append('sort', params.sort);

    const queryString = query.toString();
    const endpoint = `/projects${queryString ? `?${queryString}` : ''}`;
    const res = await apiClient.get<any>(endpoint);
    return {
      items: res.data || [],
      pagination: res.pagination || {
        page: params.page || 1,
        limit: params.limit || 20,
        total: (res.data || []).length,
        totalPages: 1,
      },
    };
  },

  async getProject(idOrSlug: string): Promise<ProjectItem> {
    const res = await apiClient.get<any>(`/projects/${idOrSlug}`);
    return res.data;
  },

  async getMyProjects(): Promise<ProjectItem[]> {
    const res = await apiClient.get<any>('/projects/my');
    return res.data || [];
  },

  async createProject(data: any): Promise<ProjectItem> {
    const res = await apiClient.post<any>('/projects', data);
    return res.data;
  },

  async updateProject(id: string, data: any): Promise<ProjectItem> {
    const res = await apiClient.patch<any>(`/projects/${id}`, data);
    return res.data;
  },

  async deleteProject(id: string): Promise<void> {
    await apiClient.delete<any>(`/projects/${id}`);
  },

  async publishProject(id: string): Promise<ProjectItem> {
    const res = await apiClient.post<any>(`/projects/${id}/publish`);
    return res.data;
  },

  // Project Memberships
  async joinProject(id: string, role: string = 'CONTRIBUTOR', message?: string): Promise<ProjectMembershipItem> {
    const res = await apiClient.post<any>(`/projects/${id}/join`, { role, message });
    return res.data;
  },

  async leaveProject(id: string): Promise<void> {
    await apiClient.delete<any>(`/projects/${id}/leave`);
  },

  async getProjectMembers(id: string, status?: string): Promise<ProjectMembershipItem[]> {
    const query = status && status !== 'ALL' ? `?status=${status}` : '';
    const res = await apiClient.get<any>(`/projects/${id}/members${query}`);
    return res.data || [];
  },

  async updateProjectMembership(
    projectId: string,
    memberId: string,
    data: { role?: string; status: string }
  ): Promise<ProjectMembershipItem> {
    const res = await apiClient.patch<any>(`/projects/${projectId}/members/${memberId}`, data);
    return res.data;
  },

  async removeProjectMember(projectId: string, memberId: string): Promise<void> {
    await apiClient.delete<any>(`/projects/${projectId}/members/${memberId}`);
  },

  // Teams
  async getProjectTeams(projectId: string): Promise<TeamItem[]> {
    const res = await apiClient.get<any>(`/projects/${projectId}/teams`);
    return res.data || [];
  },

  async getTeam(teamId: string): Promise<TeamItem> {
    const res = await apiClient.get<any>(`/teams/${teamId}`);
    return res.data;
  },

  async createTeam(projectId: string, data: { name: string; description?: string; max_members?: number }): Promise<TeamItem> {
    const res = await apiClient.post<any>(`/projects/${projectId}/teams`, data);
    return res.data;
  },

  async updateTeam(teamId: string, data: Partial<TeamItem>): Promise<TeamItem> {
    const res = await apiClient.patch<any>(`/teams/${teamId}`, data);
    return res.data;
  },

  async deleteTeam(teamId: string): Promise<void> {
    await apiClient.delete<any>(`/teams/${teamId}`);
  },

  async joinTeam(teamId: string): Promise<void> {
    await apiClient.post<any>(`/teams/${teamId}/join`);
  },

  async leaveTeam(teamId: string): Promise<void> {
    await apiClient.post<any>(`/teams/${teamId}/leave`);
  },

  async updateTeamMemberRole(teamId: string, memberId: string, role: string): Promise<void> {
    await apiClient.patch<any>(`/teams/${teamId}/members/${memberId}`, { role });
  },

  async removeTeamMember(teamId: string, memberId: string): Promise<void> {
    await apiClient.delete<any>(`/teams/${teamId}/members/${memberId}`);
  },

  // Team Invitations
  async inviteToTeam(teamId: string, invited_member_id: string): Promise<TeamInvitationItem> {
    const res = await apiClient.post<any>(`/teams/${teamId}/invitations`, { invited_member_id });
    return res.data;
  },

  async getTeamInvitations(teamId: string): Promise<TeamInvitationItem[]> {
    const res = await apiClient.get<any>(`/teams/${teamId}/invitations`);
    return res.data || [];
  },

  async getMyInvitations(): Promise<TeamInvitationItem[]> {
    const res = await apiClient.get<any>('/teams/invitations/me');
    return res.data || [];
  },

  async respondToInvitation(invitationId: string, action: 'ACCEPT' | 'DECLINE'): Promise<void> {
    await apiClient.post<any>(`/teams/invitations/${invitationId}/respond`, { action });
  },

  // Milestones
  async getMilestones(projectId: string): Promise<ProjectMilestoneItem[]> {
    const res = await apiClient.get<any>(`/projects/${projectId}/milestones`);
    return res.data || [];
  },

  async createMilestone(projectId: string, data: Partial<ProjectMilestoneItem>): Promise<ProjectMilestoneItem> {
    const res = await apiClient.post<any>(`/projects/${projectId}/milestones`, data);
    return res.data;
  },

  async updateMilestone(milestoneId: string, data: Partial<ProjectMilestoneItem>): Promise<ProjectMilestoneItem> {
    const res = await apiClient.patch<any>(`/projects/milestones/${milestoneId}`, data);
    return res.data;
  },

  async deleteMilestone(milestoneId: string): Promise<void> {
    await apiClient.delete<any>(`/projects/milestones/${milestoneId}`);
  },
};
