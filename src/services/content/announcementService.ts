// Removed api import

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: string;
  priority: string;
  status: string;
  publishedAt: string | null;
  expiresAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  read?: boolean;
}

export const announcementService = {
  async getVisibleAnnouncements(page: number = 1, limit: number = 20) {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3005'}/api/announcements?page=${page}&limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json;
  },

  async getUnreadCount() {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3005'}/api/me/announcements/unread-count`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json.data.count;
  },

  async getById(id: string) {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3005'}/api/announcements/${id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json.data;
  },

  async markAsRead(id: string) {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3005'}/api/me/announcements/${id}/read`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json;
  },

  // Admin routes
  async getAllAdmin() {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3005'}/api/admin/announcements`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json.data;
  },

  async create(data: Partial<Announcement>) {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3005'}/api/admin/announcements`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json.data;
  },

  async update(id: string, data: Partial<Announcement>) {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3005'}/api/admin/announcements/${id}`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json.data;
  },

  async delete(id: string) {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3005'}/api/admin/announcements/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.status === 204) return { success: true };
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json;
  }
};
