import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function ProtectedRoute({ children, role }) {
  const { token, user } = useApp();

  if (!token || !user) {
    // If not logged in, redirect to /auth
    return <Navigate to="/auth" replace />;
  }

  if (role && user.role !== role) {
    // If devotee tries to access admin routes, redirect to devotee chat homepage
    return <Navigate to="/" replace />;
  }

  return children;
}
