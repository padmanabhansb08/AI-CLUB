const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const authService = {
  login: async (email: string, password: string): Promise<any> => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Login failed');
      
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      return { success: true, user: data.data.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  loginAsDemo: (role: 'student' | 'admin' = 'student') => {
    const isStudent = role === 'student';
    const demoUser = isStudent ? {
      id: 'm1',
      fullName: 'Rahul Sharma',
      registerNumber: '21BCE1001',
      department: 'CSE',
      classSection: 'A',
      year: 3,
      collegeEmail: 'student@college.edu',
      phone: '+91 9876543210',
      role: 'student',
      status: 'Active'
    } : {
      id: 'admin1',
      fullName: 'Dr. A. Ramanujan',
      email: 'admin@college.edu',
      role: 'admin',
      department: 'Faculty Advisor'
    };

    const token = `demo-token-${role}-${Date.now()}`;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(demoUser));
    return { success: true, user: demoUser };
  },

  registerStudent: async (formData: any): Promise<any> => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'student' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Registration failed');
      return { success: true };
    } catch (error: any) {
      // If network fails (e.g. backend / DB offline), still simulate successful registration in demo mode
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        console.warn('Backend unavailable, simulating successful registration in demo mode');
        return { success: true, isDemo: true };
      }
      return { success: false, error: error.message };
    }
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  hasRole: (role: string) => {
    const user = authService.getCurrentUser();
    return user?.role === role;
  }
};
