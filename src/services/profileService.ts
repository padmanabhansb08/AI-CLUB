import type { Member } from '../data/members';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const profileService = {
  getProfile: async (): Promise<Member> => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/api/me/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data) return result.data;
      }
    } catch {
      // Backend not running or unreachable
    }

    // Graceful fallback for demo or offline mode
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return {
      id: user?.id || 'm1',
      fullName: user?.fullName || 'Rahul Sharma',
      registerNumber: user?.registerNumber || '21BCE1001',
      department: user?.department || 'CSE',
      classSection: user?.classSection || 'A',
      year: user?.year || 3,
      collegeEmail: user?.collegeEmail || user?.email || 'student@college.edu',
      phone: user?.phone || '+91 9876543210',
      joinedAt: '2025-08-15',
      status: 'Active',
      bio: 'AI enthusiast & Full Stack Developer passionate about Machine Learning and Web systems.',
      githubUrl: 'https://github.com',
      linkedinUrl: 'https://linkedin.com',
      skills: ['Python', 'PyTorch', 'TypeScript', 'React'],
      profileCompletion: 85
    };
  },

  updateProfile: async (data: Partial<Member>): Promise<Member> => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/api/me/profile`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        return result.data;
      }
    } catch {
      // Backend not running or unreachable
    }

    // Fallback: update local storage mock user
    const current = await profileService.getProfile();
    const updated = { ...current, ...data };
    localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user') || '{}'), ...updated }));
    return updated;
  }
};
