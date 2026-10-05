import type { ProjectTeam } from '../../data/projectTeams';
import { apiClient } from '../../api/client';

export const projectTeamService = {
  async getProjectTeams(projectId: string): Promise<ProjectTeam[]> {
    return apiClient.get<ProjectTeam[]>(`/projects/${projectId}/teams`);
  },

  async createTeam(projectId: string, payload: { name: string; description?: string; maxMembers?: number }): Promise<ProjectTeam> {
    return apiClient.post<ProjectTeam>(`/me/projects/${projectId}/teams`, payload);
  },

  async joinTeam(teamId: string): Promise<void> {
    return apiClient.post<void>(`/me/teams/${teamId}/join`);
  },

  async leaveTeam(teamId: string): Promise<void> {
    return apiClient.post<void>(`/me/teams/${teamId}/leave`);
  },

  async getMyTeams(): Promise<ProjectTeam[]> {
    return apiClient.get<ProjectTeam[]>('/me/project-teams');
  },

  async getAdminProjectTeams(projectId: string): Promise<ProjectTeam[]> {
    return apiClient.get<ProjectTeam[]>(`/admin/projects/${projectId}/teams`);
  },
};
