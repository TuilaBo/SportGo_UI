import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ roles, children }) => {
  const { isLoggedIn, user, isAuthLoading } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return null; // or a spinner component if you have one
  }

  if (!isLoggedIn || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0) {
    const userRole = user.role;
    if (!roles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;


