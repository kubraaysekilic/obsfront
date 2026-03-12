import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import OgrencilerPage from './pages/OgrencilerPage';
import DerslerPage from './pages/DerslerPage';
import BolumlerPage from './pages/BolumlerPage';
import NotlarPage from './pages/NotlarPage';
import KullanicilarPage from './pages/KullanicilarPage';
import DerslerimPage from './pages/DerslerimPage';
import NotlarimPage from './pages/NotlarimPage';
import YetkisizPage from './pages/YetkisizPage';

const ADMIN_OGRETIM = ['ADMIN', 'OGRETIM_UYESI'];

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-container">{children}</div>
      </div>
    </div>
  );
}

function RootRedirect() {
  const { user } = useAuth();
  if (user?.rol === 'KULLANICI') return <Navigate to="/derslerim" replace />;
  return <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/yetkisiz" element={<YetkisizPage />} />

          <Route path="/" element={
            <ProtectedRoute><RootRedirect /></ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute roles={ADMIN_OGRETIM}>
              <AppLayout><Dashboard /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/ogrenciler" element={
            <ProtectedRoute roles={ADMIN_OGRETIM}>
              <AppLayout><OgrencilerPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/dersler" element={
            <ProtectedRoute roles={ADMIN_OGRETIM}>
              <AppLayout><DerslerPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/bolumler" element={
            <ProtectedRoute roles={ADMIN_OGRETIM}>
              <AppLayout><BolumlerPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/notlar" element={
            <ProtectedRoute roles={ADMIN_OGRETIM}>
              <AppLayout><NotlarPage /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/kullanicilar" element={
            <ProtectedRoute roles={['ADMIN']}>
              <AppLayout><KullanicilarPage /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/derslerim" element={
            <ProtectedRoute roles={['KULLANICI']}>
              <AppLayout><DerslerimPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/notlarim" element={
            <ProtectedRoute roles={['KULLANICI']}>
              <AppLayout><NotlarimPage /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3200,
            style: {
              background: '#1C1410', color: '#F5F0E8', borderRadius: '8px',
              fontSize: '13.5px', fontFamily: "'DM Sans', sans-serif",
              border: '1px solid rgba(245,240,232,0.1)',
              boxShadow: '0 8px 32px rgba(28,20,16,0.25)', padding: '12px 16px',
            },
            success: { style: { background: '#4A6741', border: '1px solid rgba(245,240,232,0.15)' },
              iconTheme: { primary: '#A8D5A0', secondary: '#4A6741' } },
            error: { style: { background: '#A63825', border: '1px solid rgba(245,240,232,0.15)' },
              iconTheme: { primary: '#F5C5BB', secondary: '#A63825' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
