import { ApiError } from '../apiError';

export class Repository<T extends { id: string }> {
  private endpoint: string;
  private listeners: Set<() => void> = new Set();
  private data: T[] = [];
  private loading: boolean = true;
  private error: ApiError | null = null;
  private requiresAuth: boolean;
  
  constructor(endpoint: string, requiresAuth: boolean = false) {
    this.endpoint = endpoint;
    this.requiresAuth = requiresAuth;
    this.fetchData();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  async fetchData() {
    this.loading = true;
    this.error = null;
    this.notify();
    try {
      const headers: Record<string, string> = {};
      if (this.requiresAuth) {
        headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
      }
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api${this.endpoint}`, { headers });
      if (!response.ok) {
        let errMsg = `HTTP ${response.status}`;
        try {
          const errData = await response.json();
          errMsg = errData.error?.message || errMsg;
        } catch {}
        throw new ApiError(errMsg, response.status);
      }
      const json = await response.json();
      this.data = json.data || json;
      console.log('Repository fetched data for', this.endpoint, 'length:', this.data.length);
      this.loading = false;
      this.notify();
    } catch (error: any) {
      if (error instanceof ApiError) {
        this.error = error;
      } else {
        this.error = new ApiError(error.message || 'Network error');
      }
      this.loading = false;
      this.notify();
    }
  }

  retry = () => {
    this.fetchData();
  }

  getAll(): T[] {
    return this.data;
  }

  async getById(id: string): Promise<T> {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api${this.endpoint}/${id}`, {
      headers: this.requiresAuth ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {}
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const json = await response.json();
    return json.data || json;
  }

  isLoading(): boolean {
    return this.loading;
  }

  getError(): ApiError | null {
    return this.error;
  }

  async create(item: Omit<T, 'id'>) {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/admin${this.endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(item)
    });
    if (!response.ok) {
      let errMsg = 'Failed to create';
      try { const errData = await response.json(); errMsg = errData.error?.message || errMsg; } catch {}
      throw new ApiError(errMsg, response.status);
    }
    const newItem = await response.json();
    this.data = [...this.data, newItem.data || newItem];
    this.notify();
    return newItem;
  }

  async update(id: string, updates: Partial<T>) {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/admin${this.endpoint}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(updates)
    });
    if (!response.ok) {
      let errMsg = 'Failed to update';
      try { const errData = await response.json(); errMsg = errData.error?.message || errMsg; } catch {}
      throw new ApiError(errMsg, response.status);
    }
    const updatedItem = await response.json();
    const actualData = updatedItem.data || updatedItem;
    this.data = this.data.map(item => item.id === id ? actualData : item);
    this.notify();
    return actualData;
  }

  async remove(id: string) {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/admin${this.endpoint}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      let errMsg = 'Failed to remove';
      try { const errData = await response.json(); errMsg = errData.error?.message || errMsg; } catch {}
      throw new ApiError(errMsg, response.status);
    }
    this.data = this.data.filter(item => item.id !== id);
    this.notify();
  }
}
