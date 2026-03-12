import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, roles }) {
  const { isLoggedIn, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  if (roles && roles.length > 0) {
    const userRol = user?.rol;
    if (!roles.includes(userRol)) {
      return <Navigate to="/yetkisiz" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
