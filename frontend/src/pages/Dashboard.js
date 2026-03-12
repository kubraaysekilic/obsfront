import React, { useState, useEffect } from 'react';
import { ogrenciService, dersService, bolumService, notService } from '../services/api';

const statConfig = [
  { key: 'ogrenci', label: 'Toplam Öğrenci', accent: '#C8860A' },
  { key: 'aktif',   label: 'Aktif Öğrenci',  accent: '#4A6741' },
  { key: 'ders',    label: 'Toplam Ders',     accent: '#3D7EA6' },
  { key: 'bolum',   label: 'Bölüm Sayısı',    accent: '#7B5EA7' },
  { key: 'not',     label: 'Not Kaydı',       accent: '#A63825' },
];

function Dashboard() {
  const [stats, setStats] = useState({ ogrenci: 0, ders: 0, bolum: 0, not: 0, aktif: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [ogrenciler, dersler, bolumler, notlar] = await Promise.all([
          ogrenciService.getAll(), dersService.getAll(),
          bolumService.getAll(), notService.getAll(),
        ]);
        setStats({
          ogrenci: ogrenciler.length,
          ders: dersler.length,
          bolum: bolumler.length,
          not: notlar.length,
          aktif: ogrenciler.filter(o => o.aktif).length,
        });
        setRecent(ogrenciler.slice(-5).reverse());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <div className="loading-container">
      <div className="spinner" />
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1>Genel Bakış</h1>
      </div>

      <div className="stats-grid">
        {statConfig.map(s => (
          <div key={s.key} className="stat-card" style={{ '--stat-accent': s.accent }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{stats[s.key]}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 style={{ fontSize: 17 }}>Son Kayıtlı Öğrenciler</h2>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Öğrenci</th>
                <th>Numara</th>
                <th>Bölüm</th>
                <th>E-posta</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0
                ? <tr><td colSpan={5}><div className="empty-state"><p>Kayıt bulunmuyor.</p></div></td></tr>
                : recent.map(o => (
                  <tr key={o.id}>
                    <td>
                      <div className="table-name-cell">
                        <div className="table-avatar">{o.ad[0]}{o.soyad[0]}</div>
                        <div className="name">{o.ad} {o.soyad}</div>
                      </div>
                    </td>
                    <td><span style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, color: 'var(--ink-mid)' }}>{o.ogrenciNo}</span></td>
                    <td>
                      {o.bolumAdi
                        ? <span className="badge badge-info"><span className="badge-dot" />{o.bolumAdi}</span>
                        : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{o.email}</td>
                    <td>
                      <span className={`badge ${o.aktif ? 'badge-success' : 'badge-default'}`}>
                        <span className="badge-dot" />{o.aktif ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
