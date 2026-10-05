import { Repository } from './repository';
import type { Member } from '../../data/members';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const repository = new Repository<Member>('/admin/members', true);

export const memberService = {
  getMembers: async (page = 1, limit = 20, search?: string, department?: string) => {
    try {
      const token = localStorage.getItem('token');
      const url = new URL(`${API_URL}/api/admin/members`);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('limit', limit.toString());
      if (search) url.searchParams.append('search', search);
      if (department) url.searchParams.append('department', department);

      const res = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch members');
      return await res.json();
    } catch (e) {
      console.error(e);
      return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
    }
  },

  getMemberById: async (id: string) => {
    return repository.getById(id);
  }
};
