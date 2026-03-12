import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const HARF_RENK = {
  AA: { bg:'#E8F0E6', color:'#3A6030', border:'#9BC48A' },
  BA: { bg:'#E8F0E6', color:'#3A6030', border:'#9BC48A' },
  BB: { bg:'#EDF4EC', color:'#3A6030', border:'#9BC48A' },
  CB: { bg:'#FBF0D6', color:'#A06800', border:'#F0D080' },
  CC: { bg:'#FBF0D6', color:'#A06800', border:'#F0D080' },
  DC: { bg:'#FFF0E0', color:'#B05000', border:'#F0C080' },
  DD: { bg:'#FFF0E0', color:'#B05000', border:'#F0C080' },
  FD: { bg:'#F5E8E5', color:'#A63825', border:'#E0A098' },
  FF: { bg:'#F5E8E5', color:'#A63825', border:'#E0A098' },
};
const harfRenk = h => HARF_RENK[h] || { bg:'#F5F0E8', color:'#9C7B6E', border:'#DDD4C0' };

const GradeIcon = () => (
  <svg viewBox="0 0 24 24" width={16} height={16} stroke="currentColor" fill="none"
    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);

export default function NotlarimPage() {
  const { user } = useAuth();
  const [notlar, setNotlar]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [hata, setHata]       = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/api/notlar/benim');
        setNotlar(res.data);
      } catch (e) {
        setHata(e.response?.data || 'Notlar yüklenirken hata oluştu.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const tamamlanan = notlar.filter(n => n.ortalama != null);
  const gecilen    = tamamlanan.filter(n => n.gecti).length;
  const gpa = tamamlanan.length > 0
    ? (tamamlanan.reduce((s, n) => s + (n.ortalama || 0), 0) / tamamlanan.length).toFixed(2)
    : '—';

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div style={{ padding: '28px 32px' }}>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
          <GradeIcon />
          <h1 style={{ fontSize:22, fontWeight:700, color:'var(--brown)' }}>Notlarım</h1>
        </div>
        <p style={{ fontSize:13, color:'var(--text-muted)' }}>
          {user?.adSoyad} · Öğrenci No: {user?.ogrenciNo || '—'}
        </p>
      </div>

      {hata && (
        <div style={{ padding:'16px 20px', background:'#F5E8E5', border:'1px solid #E0A098',
          borderRadius:10, color:'#A63825', fontSize:14, marginBottom:24 }}>
          {typeof hata === 'string' ? hata : 'Notlar yüklenemedi.'}
        </div>
      )}

      {!hata && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px,1fr))',
          gap:14, marginBottom:28 }}>
          {[
            { label:'Toplam Ders',   value: notlar.length,           accent:'#3D7EA6' },
            { label:'Tamamlanan',    value: tamamlanan.length,       accent:'#4A6741' },
            { label:'Geçilen',       value: gecilen,                 accent:'#4A6741' },
            { label:'Kalan',         value: tamamlanan.length - gecilen, accent:'#A63825' },
            { label:'Genel Ortalama',value: gpa,                     accent:'#C8860A' },
          ].map(s => (
            <div key={s.label} style={{
              background:'var(--surface)', border:'1px solid var(--border)',
              borderRadius:10, padding:'14px 16px',
              borderTop:`3px solid ${s.accent}`,
            }}>
              <div style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase',
                letterSpacing:'.5px', marginBottom:6 }}>{s.label}</div>
              <div style={{ fontSize:22, fontWeight:700, color:s.accent }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {!hata && notlar.length === 0 && (
        <div style={{ padding:'48px 0', textAlign:'center', color:'var(--text-muted)', fontSize:14 }}>
          Henüz not kaydı bulunamadı.
        </div>
      )}

      {!hata && notlar.length > 0 && (
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)',
          borderRadius:12, overflow:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'var(--surface2)', borderBottom:'1px solid var(--border)' }}>
                {['Ders Kodu','Ders Adı','Dönem','Vize','Final','Ortalama','Harf','Durum']
                  .map(h => (
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontWeight:700,
                    fontSize:11, textTransform:'uppercase', letterSpacing:'.6px',
                    color:'var(--ink-mid)', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {notlar.map((n, i) => {
                const rk = harfRenk(n.harfNotu);
                return (
                  <tr key={n.id} style={{ borderBottom:'1px solid var(--border-light)',
                    background: i%2===0 ? 'transparent' : 'rgba(245,240,232,.35)' }}>
                    <td style={{ padding:'10px 16px' }}>
                      <span style={{ background:'var(--amber-pale)', color:'var(--amber)',
                        border:'1px solid #F0D080', padding:'2px 8px', borderRadius:4,
                        fontSize:11, fontWeight:700 }}>{n.dersKodu}</span>
                    </td>
                    <td style={{ padding:'10px 16px', fontWeight:600, color:'var(--brown)' }}>
                      {n.dersAdi}
                    </td>
                    <td style={{ padding:'10px 16px', color:'var(--text-muted)', fontSize:12 }}>
                      {n.yil} · {n.donem}
                    </td>
                    <td style={{ padding:'10px 16px', textAlign:'center', fontWeight:600 }}>
                      {n.vizeNotu != null ? n.vizeNotu.toFixed(1) : <span style={{color:'var(--text-muted)'}}>—</span>}
                    </td>
                    <td style={{ padding:'10px 16px', textAlign:'center', fontWeight:600 }}>
                      {n.finalNotu != null ? n.finalNotu.toFixed(1) : <span style={{color:'var(--text-muted)'}}>—</span>}
                    </td>
                    <td style={{ padding:'10px 16px', textAlign:'center', fontWeight:700,
                      fontSize:15, color:'var(--brown)' }}>
                      {n.ortalama != null ? n.ortalama.toFixed(1) : <span style={{color:'var(--text-muted)',fontSize:13}}>—</span>}
                    </td>
                    <td style={{ padding:'10px 16px', textAlign:'center' }}>
                      <span style={{ padding:'3px 12px', borderRadius:20, fontSize:12,
                        fontWeight:700, border:`1px solid ${rk.border}`, ...rk }}>
                        {n.harfNotu || '—'}
                      </span>
                    </td>
                    <td style={{ padding:'10px 16px', textAlign:'center' }}>
                      {n.ortalama != null ? (
                        <span style={{ padding:'2px 10px', borderRadius:20, fontSize:11,
                          fontWeight:700,
                          background: n.gecti ? '#E8F0E6' : '#F5E8E5',
                          color:      n.gecti ? '#3A6030' : '#A63825',
                          border:`1px solid ${n.gecti ? '#9BC48A' : '#E0A098'}` }}>
                          {n.gecti ? '✓ Geçti' : '✗ Kaldı'}
                        </span>
                      ) : (
                        <span style={{ fontSize:11, color:'var(--text-muted)' }}>Sonuç Bekleniyor</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
