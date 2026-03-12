import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Sidebar.css';

const Icons = {
  dashboard: <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  students:  <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  courses:   <svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  depts:     <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  grades:    <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  myGrades:  <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  shield:    <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  logout:    <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

const navItems = [
  { path: '/dashboard',    icon: Icons.dashboard, label: 'Genel Bakış',       roles: ['ADMIN','OGRETIM_UYESI'] },
  { path: '/ogrenciler',   icon: Icons.students,  label: 'Öğrenciler',        roles: ['ADMIN','OGRETIM_UYESI'] },
  { path: '/dersler',      icon: Icons.courses,   label: 'Dersler',           roles: ['ADMIN','OGRETIM_UYESI'] },
  { path: '/bolumler',     icon: Icons.depts,     label: 'Bölümler',          roles: ['ADMIN','OGRETIM_UYESI'] },
  { path: '/notlar',       icon: Icons.grades,    label: 'Not Yönetimi',      roles: ['ADMIN','OGRETIM_UYESI'] },
  { path: '/kullanicilar', icon: Icons.shield,    label: 'Kullanıcı Yönetimi',roles: ['ADMIN'] },
  { path: '/derslerim',    icon: Icons.courses,   label: 'Derslerim',         roles: ['KULLANICI'] },
  { path: '/notlarim',     icon: Icons.myGrades,  label: 'Notlarım',          roles: ['KULLANICI'] },
];

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Çıkış yapıldı');
    navigate('/login');
  };

  const initials = user?.adSoyad
    ? user.adSoyad.split(' ').map(w => w[0]).slice(0, 2).join('')
    : 'U';

  const gorulecekItems = navItems.filter(item =>
    item.roles.includes(user?.rol)
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-lockup">
          <span className="logo-wordmark">OBS</span>
          <div className="logo-accent-line" />
          <span className="logo-subtitle">Öğrenci Bilgi Sistemi</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {gorulecekItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon-wrap">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {user?.rol === 'KULLANICI' && user?.ogrenciNo && (
          <div style={{
            margin: '0 12px 8px', padding: '8px 12px',
            background: 'rgba(245,240,232,0.08)', borderRadius: 8,
            fontSize: 11, color: 'rgba(245,240,232,0.55)', textAlign: 'center',
          }}>
            Öğrenci No: <strong style={{ color: 'rgba(245,240,232,0.8)' }}>{user.ogrenciNo}</strong>
          </div>
        )}
        <div className="user-card">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.adSoyad || 'Kullanıcı'}</div>
            <div className="user-role">{
              user?.rol === 'KULLANICI'       ? 'Öğrenci'       :
              user?.rol === 'OGRETIM_UYESI'   ? 'Öğretim Üyesi' :
              user?.rol === 'ADMIN'           ? 'Yönetici'      : user?.rol
            }</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Çıkış Yap">
            {Icons.logout}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
