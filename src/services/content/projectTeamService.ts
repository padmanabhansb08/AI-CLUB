import type { ProjectTeam } from '../../data/projectTeams';
import { ApiError } from '../apiError';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new ApiError(data.error?.message || 'An error occurred', res.status);
  }
  return data.data || data;
}

export const projectTeamService = {
  async getProjectTeams(projectId: string): Promise<ProjectTeam[]> {
    const res = await fetch(`${API_URL}/api/projects/${projectId}/teams`, {
      headers: getAuthHeaders()
    });
    return handleResponse<ProjectTeam[]>(res);
  },

  async createTeam(projectId: string, payload: { name: string; description?: string; maxMembers?: number }): Promise<ProjectTeam> {
    const res = await fetch(`${API_URL}/api/me/projects/${projectId}/teams`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse<ProjectTeam>(res);
  },

  async joinTeam(teamId: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/me/teams/${teamId}/join`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async leaveTeam(teamId: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/me/teams/${teamId}/leave`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getMyTeams(): Promise<ProjectTeam[]> {
    const res = await fetch(`${API_URL}/api/me/project-teams`, {
      headers: getAuthHeaders()
    });
    return handleResponse<ProjectTeam[]>(res);
  },

  async getAdminProjectTeams(projectId: string): Promise<ProjectTeam[]> {
    const res = await fetch(`${API_URL}/api/admin/projects/${projectId}/teams`, {
      headers: getAuthHeaders()
    });
    return handleResponse<ProjectTeam[]>(res);
  }
};
