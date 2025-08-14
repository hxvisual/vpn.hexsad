import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, user, token } = useAppSelector((state) => state.auth);

  // If we have a token but no user data yet (and not currently loading), show loading
  // This handles the case when the page is refreshed and we're waiting for user data
  if (token && !user) {
    return (
      <div className="min-h-screen bg-dark-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  // If no token and not authenticated, redirect to login
  if (!token && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If we have user data but they're not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
};
