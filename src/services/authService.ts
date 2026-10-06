import { authApi } from '../api/auth.api';
import type { RegisterData, User } from '../api/auth.api';

export const authService = {
  login: async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const res = await authApi.login({ email, password });
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      return { success: true, user: res.user };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  },

  registerStudent: async (formData: any): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const payload: RegisterData = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        registerNumber: formData.registerNumber,
        department: formData.department,
        classSection: formData.classSection,
        year: parseInt(formData.year, 10),
        collegeEmail: formData.collegeEmail || formData.email,
        phone: formData.phone,
      };

      const res = await authApi.register(payload);
      return { success: true, user: res.user };
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  },

  getCurrentUser: (): User | null => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  hasRole: (role: string): boolean => {
    const user = authService.getCurrentUser();
    return user?.role?.toLowerCase() === role.toLowerCase();
  },
};
