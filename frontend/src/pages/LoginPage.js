import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import './LoginPage.css';

const SchoolIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const UserIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const LockIcon = () => (
  <svg viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const EyeIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

function LoginPage() {
  const [form, setForm]        = useState({ kullaniciAdi: '', sifre: '' });
  const [loading, setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login }              = useAuth();
  const navigate               = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.kullaniciAdi || !form.sifre) return;
    setLoading(true);
    try {
      const res = await authService.login(form);
      login(res.token, {
        kullaniciAdi: res.kullaniciAdi,
        adSoyad:      res.adSoyad,
        email:        res.email,
        rol:          res.rol,
        ogrenciId:    res.ogrenciId   || null,
        ogrenciNo:    res.ogrenciNo   || null,
      });
      toast.success('Hoş geldiniz, ' + res.adSoyad);
      navigate(res.rol === 'KULLANICI' ? '/derslerim' : '/dashboard');
    } catch (err) {
      if (err?.response?.status === 429) {
        toast.error('Çok fazla başarısız deneme. Lütfen bekleyin.');
      } else {
        toast.error('Kullanıcı adı veya şifre hatalı');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">

        <div className="login-logo">
          <SchoolIcon />
        </div>

        <h1 className="login-title">Öğrenci Bilgi Sistemi</h1>
        <p className="login-sub">Düzce Üniversitesi · OBS</p>

        <div className="login-divider" />

        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label>Kullanıcı Adı</label>
            <div className="login-input-wrap">
              <span className="login-input-icon"><UserIcon /></span>
              <input
                type="text"
                value={form.kullaniciAdi}
                onChange={e => setForm(f => ({ ...f, kullaniciAdi: e.target.value }))}
                placeholder="Kullanıcı adınız"
                autoFocus
                autoComplete="username"
              />
            </div>
          </div>

          <div className="login-field">
            <label>Şifre</label>
            <div className="login-input-wrap">
              <span className="login-input-icon"><LockIcon /></span>
              <input
                type={showPass ? 'text' : 'password'}
                value={form.sifre}
                onChange={e => setForm(f => ({ ...f, sifre: e.target.value }))}
                placeholder="Şifreniz"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="pass-eye"
                onClick={() => setShowPass(s => !s)}
                tabIndex={-1}
              >
                {showPass ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <button className="login-submit" type="submit" disabled={loading}>
            {loading ? <span className="login-spinner" /> : 'Giriş Yap'}
          </button>
        </form>

        <p className="login-footer">
          Bilgi Güvenliği Deneyi · STRIDE Modeli
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
