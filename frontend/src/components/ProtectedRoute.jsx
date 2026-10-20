import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If student attempts to access admin route, redirect to their fees page
    if (user?.role === 'student') {
      return <Navigate to="/my-fees" replace />;
    }
    // If admin attempts to access student-only route, redirect to admin dashboard
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};
