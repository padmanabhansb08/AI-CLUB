import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingState } from '../common/LoadingState';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRole: 'student' | 'admin';
  redirectTo?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRole, redirectTo }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 1. Prevent route flashing while initial session check is running
  if (isLoading) {
    return <LoadingState fullScreen message="Verifying session..." />;
  }

  // 2. Unauthenticated user redirect
  if (!isAuthenticated || !user) {
    const fallbackPath = redirectTo || (allowedRole === 'admin' ? '/admin/login' : '/');
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // 3. Role verification (case-insensitive)
  const userRole = user.role?.toLowerCase();
  const targetRole = allowedRole.toLowerCase();

  const isAdminRole = userRole === 'admin' || userRole === 'super_admin';

  if (targetRole === 'admin') {
    if (!isAdminRole) {
      // If non-admin attempts to access admin route, redirect to student dashboard
      return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
  }

  if (userRole !== targetRole) {
    // If admin attempts to access student route, allow
    if (isAdminRole) {
      return <>{children}</>;
    }
    return <Navigate to={redirectTo || '/'} replace />;
  }

  return <>{children}</>;
};
