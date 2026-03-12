import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const BookIcon = () => (
  <svg viewBox="0 0 24 24" width={16} height={16} stroke="currentColor" fill="none"
    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

export default function DerslerimPage() {
  const { user }          = useAuth();
  const [loading, setLoading] = useState(true);
  const [hata, setHata]       = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/api/notlar/benim');
        setNotlar(res.data);
      } catch (e) {
        setHata(e.response?.data || 'Dersler yüklenirken hata oluştu.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const harfRenk = (harf) => {
    if (!harf || harf === '-') return { bg:'#F5F0E8', color:'#9C7B6E', border:'#DDD4C0' };
    if (['AA','BA','BB'].includes(harf)) return { bg:'#E8F0E6', color:'#3A6030', border:'#9BC48A' };
    if (['CB','CC'].includes(harf))      return { bg:'#FBF0D6', color:'#A06800', border:'#F0D080' };
    if (['DC','DD'].includes(harf))      return { bg:'#FFF0E0', color:'#B05000', border:'#F0C080' };
    return { bg:'#F5E8E5', color:'#A63825', border:'#E0A098' };
  };

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div style={{ padding:'28px 32px' }}>

      <div style={{ marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
          <BookIcon />
          <h1 style={{ fontSize:22, fontWeight:700, color:'var(--brown)' }}>Derslerim</h1>
        </div>
        <p style={{ fontSize:13, color:'var(--text-muted)' }}>
          {user?.adSoyad} · Öğrenci No: {user?.ogrenciNo || '—'}
        </p>
      </div>

      {hata && (
        <div style={{ padding:'16px 20px', background:'#F5E8E5', border:'1px solid #E0A098',
          borderRadius:10, color:'#A63825', fontSize:14, marginBottom:24 }}>
          {typeof hata === 'string' ? hata : 'Dersler yüklenemedi.'}
        </div>
      )}

      {!hata && notlar.length === 0 && (
        <div style={{ padding:'48px 0', textAlign:'center', color:'var(--text-muted)', fontSize:14 }}>
          Kayıtlı ders bulunamadı.
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:16 }}>
        {notlar.map(n => {
          const rk = harfRenk(n.harfNotu);
          return (
            <div key={n.id} style={{
              background:'var(--surface)', border:'1px solid var(--border)',
              borderRadius:12, padding:'20px 22px',
              boxShadow:'0 2px 8px rgba(28,20,16,0.06)',
            }}>
              <div style={{ display:'flex', justifyContent:'space-between',
                alignItems:'flex-start', marginBottom:12 }}>
                <span style={{ fontSize:11, fontWeight:700, letterSpacing:'.6px',
                  textTransform:'uppercase', color:'var(--amber)', background:'var(--amber-pale)',
                  padding:'2px 8px', borderRadius:4, border:'1px solid #F0D080' }}>
                  {n.dersKodu}
                </span>
                <span style={{ padding:'3px 12px', borderRadius:20, fontSize:13,
                  fontWeight:700, ...rk, border:`1px solid ${rk.border}` }}>
                  {n.harfNotu || '—'}
                </span>
              </div>

              <h3 style={{ fontSize:15, fontWeight:700, color:'var(--brown)',
                marginBottom:14, lineHeight:1.4 }}>
                {n.dersAdi}
              </h3>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:12 }}>
                {[
                  { label:'Vize',    value: n.vizeNotu   != null ? n.vizeNotu.toFixed(1)   : '—' },
                  { label:'Final',   value: n.finalNotu  != null ? n.finalNotu.toFixed(1)  : '—' },
                  { label:'Ort.',    value: n.ortalama   != null ? n.ortalama.toFixed(1)   : '—' },
                ].map(item => (
                  <div key={item.label} style={{ background:'var(--surface2)', borderRadius:8,
                    padding:'8px 10px', textAlign:'center' }}>
                    <div style={{ fontSize:10, color:'var(--text-muted)', marginBottom:2,
                      textTransform:'uppercase', letterSpacing:'.4px' }}>{item.label}</div>
                    <div style={{ fontSize:16, fontWeight:700, color:'var(--brown)' }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                paddingTop:10, borderTop:'1px solid var(--border-light)' }}>
                <span style={{ fontSize:12, color:'var(--text-muted)' }}>
                  {n.yil} · {n.donem}
                </span>
                {n.ortalama != null && (
                  <span style={{ fontSize:11, fontWeight:700, padding:'2px 10px',
                    borderRadius:20,
                    background: n.gecti ? '#E8F0E6' : '#F5E8E5',
                    color:      n.gecti ? '#3A6030' : '#A63825',
                    border:`1px solid ${n.gecti ? '#9BC48A' : '#E0A098'}` }}>
                    {n.gecti ? '✓ Geçti' : '✗ Kaldı'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
