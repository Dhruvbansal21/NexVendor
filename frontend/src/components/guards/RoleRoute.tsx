import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store';

interface RoleRouteProps {
  allowedRoles: Array<'customer' | 'vendor' | 'admin'>;
  children: React.ReactNode;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles, children }) => {
  const auth = useAppSelector((state) => state.auth);

  if (!auth.token || !auth.user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(auth.user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
