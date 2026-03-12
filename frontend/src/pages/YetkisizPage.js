import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function YetkisizPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Kullanıcının kendi dashboard'una yönlendir
  const hedef = user?.rol === 'KULLANICI' ? '/derslerim' : '/dashboard';

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--cream)',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 400, padding: '0 24px' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 18,
          background: '#F5E8E5', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', border: '1.5px solid #E0A098',
        }}>
          <svg viewBox="0 0 24 24" width={32} height={32}
            stroke="#A63825" fill="none" strokeWidth={1.8}
            strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--brown)', marginBottom: 8 }}>
          Yetkisiz Erişim
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28, lineHeight: 1.6 }}>
          Bu sayfaya erişim yetkiniz bulunmamaktadır.
          {user?.rol === 'KULLANICI' && (
            <><br />Öğrenci hesabıyla sadece <strong>Derslerim</strong> ve <strong>Notlarım</strong> sayfalarına erişebilirsiniz.</>
          )}
        </p>
        <button
          onClick={() => navigate(hedef)}
          style={{
            padding: '11px 28px', background: 'var(--brown)',
            color: 'var(--cream)', border: 'none', borderRadius: 8,
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Ana Sayfaya Dön
        </button>
      </div>
    </div>
  );
}
