import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRole: 'student' | 'admin';
  redirectTo?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRole, redirectTo }) => {
  const user = authService.getCurrentUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (user.role !== allowedRole) {
    const defaultRedirect = user.role === 'admin' ? '/admin' : '/dashboard';
    return <Navigate to={redirectTo || defaultRedirect} replace />;
  }

  return <>{children}</>;
};
