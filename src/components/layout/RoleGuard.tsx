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

  if (userRole !== targetRole) {
    // If student attempts to access admin route, redirect to student dashboard
    if (targetRole === 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
    // If admin attempts to access student route, allow or redirect to /admin
    if (userRole === 'admin') {
      return <>{children}</>;
    }
    return <Navigate to={redirectTo || '/'} replace />;
  }

  return <>{children}</>;
};
