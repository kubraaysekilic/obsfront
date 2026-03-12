import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — hem giriş kontrolü hem rol kontrolü yapar.
 *
 * Kullanım:
 *   <ProtectedRoute>                          → sadece giriş şartı
 *   <ProtectedRoute roles={['ADMIN']}>        → sadece ADMIN
 *   <ProtectedRoute roles={['ADMIN','OGRETIM_UYESI']}> → iki rol
 *
 * KULLANICI rolü (öğrenci) /dashboard, /derslerim, /notlarim'a erişebilir.
 * Başka bir korumalı route'a gitmeye çalışırsa /yetkisiz'e yönlendirilir.
 */
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

  // Rol kısıtlaması varsa kontrol et
  if (roles && roles.length > 0) {
    const userRol = user?.rol;
    if (!roles.includes(userRol)) {
      return <Navigate to="/yetkisiz" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
