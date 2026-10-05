const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005';

export interface EventType {
  id: string;
  title: string;
  description: string;
  event_type: string;
  start_at: string;
  end_at: string;
  location?: string;
  meeting_url?: string;
  organizer?: string;
  capacity?: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  registration_open_at?: string;
  registration_close_at?: string;
  created_at: string;
  updated_at: string;
  registration_count?: string | number;
  currentStudentRegistrationStatus?: 'registered' | 'unregistered';
}

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export const eventService = {
  // Public / Student
  async getEvents(page = 1, limit = 10, filters: any = {}) {
    const query = new URLSearchParams({ page: page.toString(), limit: limit.toString(), ...filters }).toString();
    const res = await fetch(`${API_URL}/api/events?${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  },

  async getEventById(id: string) {
    const res = await fetch(`${API_URL}/api/events/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch event');
    const data = await res.json();
    return data.data as EventType;
  },

  async register(id: string) {
    const res = await fetch(`${API_URL}/api/me/events/${id}/register`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to register');
    return res.json();
  },

  async unregister(id: string) {
    const res = await fetch(`${API_URL}/api/me/events/${id}/unregister`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to unregister');
    return res.json();
  },

  async getMyRegistrations() {
    const res = await fetch(`${API_URL}/api/me/events/registrations`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch registrations');
    return res.json();
  },

  // Admin
  async getAdminEvents(page = 1, limit = 10, filters: any = {}) {
    const query = new URLSearchParams({ page: page.toString(), limit: limit.toString(), ...filters }).toString();
    const res = await fetch(`${API_URL}/api/admin/events?${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch admin events');
    return res.json();
  },

  async getAdminEventById(id: string) {
    const res = await fetch(`${API_URL}/api/admin/events/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch event');
    const data = await res.json();
    return data.data as EventType;
  },

  async createEvent(data: Partial<EventType>) {
    const res = await fetch(`${API_URL}/api/admin/events`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create event');
    return res.json();
  },

  async updateEvent(id: string, data: Partial<EventType>) {
    const res = await fetch(`${API_URL}/api/admin/events/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update event');
    return res.json();
  },

  async deleteEvent(id: string) {
    const res = await fetch(`${API_URL}/api/admin/events/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete event');
    return true;
  },

  async getRegistrations(id: string) {
    const res = await fetch(`${API_URL}/api/admin/events/${id}/registrations`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch registrations');
    const data = await res.json();
    return data.data;
  }
};
