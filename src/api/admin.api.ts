import { apiClient } from './client';
import type { 
  AdminDashboardKPIs, 
  AdminMemberItem, 
  AdminMemberDetail, 
  AuditLogItem, 
  PaginationData 
} from '../types/admin';

export const adminApi = {
  // 1. Dashboard Overview KPIs
  getDashboardKPIs: async (range = '30d', from?: string, to?: string): Promise<AdminDashboardKPIs> => {
    return await apiClient.get<AdminDashboardKPIs>('/admin/dashboard', {
      params: { range, from, to },
    });
  },

  // 2. Member Management
  getMembers: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
    year?: number;
    classSection?: string;
    role?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}): Promise<{ data: AdminMemberItem[]; pagination: PaginationData }> => {
    const res = await apiClient.get<any>('/admin/members', { params });
    // Handle both { data: items, pagination } or items directly
    if (res && res.data && res.pagination) {
      return { data: res.data, pagination: res.pagination };
    }
    if (Array.isArray(res)) {
      return { data: res, pagination: { page: 1, limit: res.length, total: res.length, totalPages: 1 } };
    }
    return { data: res?.items || [], pagination: { page: res?.page || 1, limit: res?.limit || 20, total: res?.total || 0, totalPages: res?.totalPages || 1 } };
  },

  getMemberDetail: async (id: string): Promise<AdminMemberDetail> => {
    return await apiClient.get<AdminMemberDetail>(`/admin/members/${id}`);
  },

  updateMemberRole: async (id: string, role: string) => {
    return await apiClient.patch<{ memberId: string; role: string }>(`/admin/members/${id}/role`, { role });
  },

  updateMemberStatus: async (id: string, status: string) => {
    return await apiClient.patch<{ memberId: string; status: string }>(`/admin/members/${id}/status`, { status });
  },

  // 3. Domain Analytics
  getAnalytics: async (domain: string, params: { range?: string; from?: string; to?: string } = {}): Promise<any> => {
    return await apiClient.get<any>(`/admin/analytics/${domain}`, { params });
  },

  // 4. Audit Logs
  getAuditLogs: async (params: {
    page?: number;
    limit?: number;
    actorId?: string;
    action?: string;
    entityType?: string;
    entityId?: string;
    from?: string;
    to?: string;
    search?: string;
  } = {}): Promise<{ items: AuditLogItem[]; total: number; page: number; limit: number; totalPages: number }> => {
    return await apiClient.get<any>('/admin/audit-logs', { params });
  },

  getAuditLogById: async (id: string): Promise<AuditLogItem> => {
    return await apiClient.get<AuditLogItem>(`/admin/audit-logs/${id}`);
  },

  // 5. Secure CSV Data Exports
  downloadExport: async (resource: 'members' | 'events' | 'attendance' | 'course-enrollments' | 'achievements', eventId?: string) => {
    const baseUrl = apiClient.getBaseUrl();
    let url = `${baseUrl}/admin/exports/${resource}`;
    if (eventId) {
      url += `?eventId=${encodeURIComponent(eventId)}`;
    }
    const token = localStorage.getItem('token');

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    if (!res.ok) {
      throw new Error(`Export failed with status ${res.status}`);
    }

    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `aiclub_${resource}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    a.remove();
  },
};
