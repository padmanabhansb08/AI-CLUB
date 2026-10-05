const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const authService = {
  login: async (email: string, password: string):Promise<any> => {
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

  registerStudent: async (formData: any):Promise<any> => {
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
