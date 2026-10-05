import { apiClient, ApiError } from '../../api/client';

export class Repository<T extends { id: string }> {
  private endpoint: string;
  private listeners: Set<() => void> = new Set();
  private data: T[] = [];
  private loading: boolean = true;
  private error: ApiError | null = null;

  constructor(endpoint: string, _requiresAuth: boolean = false) {
    this.endpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    this.fetchData();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  async fetchData() {
    this.loading = true;
    this.error = null;
    this.notify();
    try {
      const result = await apiClient.get<T[] | { items: T[] }>(this.endpoint);
      if (Array.isArray(result)) {
        this.data = result;
      } else if (result && Array.isArray((result as any).items)) {
        this.data = (result as any).items;
      } else {
        this.data = [];
      }
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
  };

  getAll(): T[] {
    return this.data;
  }

  async getById(id: string): Promise<T> {
    return apiClient.get<T>(`${this.endpoint}/${id}`);
  }

  isLoading(): boolean {
    return this.loading;
  }

  getError(): ApiError | null {
    return this.error;
  }

  async create(item: Omit<T, 'id'>): Promise<T> {
    const newItem = await apiClient.post<T>(`/admin${this.endpoint}`, item);
    this.data = [...this.data, newItem];
    this.notify();
    return newItem;
  }

  async update(id: string, updates: Partial<T>): Promise<T> {
    const updatedItem = await apiClient.put<T>(`/admin${this.endpoint}/${id}`, updates);
    this.data = this.data.map((item) => (item.id === id ? updatedItem : item));
    this.notify();
    return updatedItem;
  }

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/admin${this.endpoint}/${id}`);
    this.data = this.data.filter((item) => item.id !== id);
    this.notify();
  }
}
