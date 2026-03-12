import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { kullaniciService } from '../services/api';

/* ───── ikonlar ───── */
const ico = { width: 14, height: 14, stroke: 'currentColor', fill: 'none', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
const ShieldIcon = () => <svg viewBox="0 0 24 24" style={ico}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const LinkIcon   = () => <svg viewBox="0 0 24 24" style={ico}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const RefreshIcon= () => <svg viewBox="0 0 24 24" style={ico}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;

/* ───── renk haritası ───── */
const rolRenk = {
  ADMIN:          { bg:'#FBF0D6', color:'#A06800', border:'#F0D080' },
  OGRETIM_UYESI:  { bg:'#E8F0E6', color:'#3A6030', border:'#9BC48A' },
  KULLANICI:      { bg:'#EEF2FF', color:'#3730A3', border:'#A5B4FC' },
};
const riskRenk = r => r >= 60 ? '#A63825' : r >= 30 ? '#C8860A' : '#4A6741';
const btnSt = (bg, color) => ({
  padding:'3px 10px', borderRadius:5, border:`1px solid ${color}40`,
  background:bg, color, cursor:'pointer', fontSize:11, fontWeight:700,
});

export default function KullanicilarPage() {
  const [kullanicilar, setKullanicilar] = useState([]);
  const [secLogs,      setSecLogs]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [aktifTab,     setAktifTab]     = useState('kullanicilar');

  /* modal state'leri */
  const [rolModal,    setRolModal]    = useState(null); // { id, kullaniciAdi, mevcutRol }
  const [baglaModal,  setBaglaModal]  = useState(null); // { id, kullaniciAdi, ogrenciId }
  const [baglaInput,  setBaglaInput]  = useState('');

  /* ──── veri yükleme ──── */
  const fetchKullanicilar = useCallback(async () => {
    setLoading(true);
    try { setKullanicilar(await kullaniciService.getAll()); }
    catch { toast.error('Kullanıcılar yüklenemedi'); }
    finally { setLoading(false); }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/security-logs', {
        headers: { Authorization: `Bearer ${localStorage.getItem('obs_token')}` },
      });
      const data = await res.json();
      setSecLogs(Array.isArray(data) ? data : []);
    } catch { setSecLogs([]); }
  }, []);

  useEffect(() => { fetchKullanicilar(); fetchLogs(); }, [fetchKullanicilar, fetchLogs]);

  /* ──── işlemler ──── */
  const handleRolDegistir = async (id, yeniRol) => {
    try {
      await kullaniciService.rolDegistir(id, yeniRol);
      toast.success('Rol güncellendi');
      setRolModal(null);
      fetchKullanicilar();
    } catch (e) { toast.error(e.message); }
  };

  const handleToggle = async (id) => {
    try { await kullaniciService.toggleAktif(id); toast.success('Durum güncellendi'); fetchKullanicilar(); }
    catch (e) { toast.error(e.message); }
  };

  const handleDelete = async (id, ad) => {
    if (!window.confirm(`"${ad}" kullanıcısını silmek istediğinizden emin misiniz?`)) return;
    try { await kullaniciService.delete(id); toast.success('Kullanıcı silindi'); fetchKullanicilar(); }
    catch (e) { toast.error(e.message); }
  };

  const handleOgrenciBagla = async () => {
    const ogrenciId = baglaInput === '' ? null : Number(baglaInput);
    try {
      await kullaniciService.ogrenciBagla(baglaModal.id, ogrenciId);
      toast.success(ogrenciId ? 'Öğrenci bağlandı' : 'Bağlantı kaldırıldı');
      setBaglaModal(null);
      setBaglaInput('');
      fetchKullanicilar();
    } catch (e) { toast.error(e.message); }
  };

  /* ──── render ──── */
  return (
    <div style={{ padding:'28px 32px' }}>

      {/* başlık */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
        <ShieldIcon />
        <h1 style={{ fontSize:22, fontWeight:700, color:'var(--brown)' }}>Kullanıcı Yönetimi</h1>
      </div>
      <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:24 }}>
        STRIDE — Elevation of Privilege deneyi · Sadece ADMIN erişebilir
      </p>

      {/* tab bar */}
      <div style={{ display:'flex', gap:4, marginBottom:20, borderBottom:'1.5px solid var(--border)' }}>
        {[['kullanicilar','Kullanıcılar'],['guvenlik-loglari','Güvenlik Logları']].map(([key, label]) => (
          <button key={key} onClick={() => setAktifTab(key)} style={{
            padding:'8px 18px', border:'none', background:'none', cursor:'pointer',
            fontSize:13, fontWeight:600,
            color: aktifTab === key ? 'var(--brown)' : 'var(--text-muted)',
            borderBottom: aktifTab === key ? '2px solid var(--amber)' : '2px solid transparent',
            marginBottom:-1.5, transition:'all .15s',
          }}>{label}</button>
        ))}
      </div>

      {/* ════════════ KULLANICILAR ════════════ */}
      {aktifTab === 'kullanicilar' && (
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, overflow:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'var(--surface2)', borderBottom:'1px solid var(--border)' }}>
                {['ID','Kullanıcı Adı','Ad Soyad','Rol','Öğrenci No','Öğrenci Adı','Durum','İşlemler'].map(h => (
                  <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontWeight:700,
                    fontSize:11, textTransform:'uppercase', letterSpacing:'.6px', color:'var(--ink-mid)',
                    whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>Yükleniyor…</td></tr>
              ) : kullanicilar.map((k, i) => (
                <tr key={k.id} style={{ borderBottom:'1px solid var(--border-light)',
                  background: i%2===0 ? 'transparent' : 'rgba(245,240,232,.4)' }}>
                  <td style={{ padding:'9px 14px', color:'var(--text-muted)' }}>{k.id}</td>
                  <td style={{ padding:'9px 14px', fontWeight:600 }}>{k.kullaniciAdi}</td>
                  <td style={{ padding:'9px 14px' }}>{k.adSoyad}</td>
                  <td style={{ padding:'9px 14px' }}>
                    <span style={{ padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:700,
                      ...(rolRenk[k.rol]||rolRenk.KULLANICI),
                      border:`1px solid ${(rolRenk[k.rol]||rolRenk.KULLANICI).border}` }}>
                      {k.rol}
                    </span>
                  </td>
                  {/* FK kolonları */}
                  <td style={{ padding:'9px 14px', fontFamily:'monospace', fontSize:12 }}>
                    {k.ogrenciNo
                      ? <span style={{ background:'#EEF2FF', color:'#3730A3', padding:'1px 8px',
                          borderRadius:4, border:'1px solid #A5B4FC' }}>{k.ogrenciNo}</span>
                      : <span style={{ color:'var(--text-muted)', fontSize:11 }}>—</span>}
                  </td>
                  <td style={{ padding:'9px 14px', fontSize:12 }}>
                    {k.ogrenciAd || <span style={{ color:'var(--text-muted)' }}>—</span>}
                  </td>
                  <td style={{ padding:'9px 14px' }}>
                    <span style={{ padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:700,
                      background: k.aktif ? '#E8F0E6' : '#F5E8E5',
                      color:      k.aktif ? '#3A6030' : '#A63825',
                      border:`1px solid ${k.aktif ? '#9BC48A' : '#E0A098'}` }}>
                      {k.aktif ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td style={{ padding:'9px 14px' }}>
                    <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                      <button onClick={() => setRolModal({ id:k.id, kullaniciAdi:k.kullaniciAdi, mevcutRol:k.rol })}
                        style={btnSt('#FBF0D6','#A06800')}>Rol</button>
                      <button onClick={() => { setBaglaModal({ id:k.id, kullaniciAdi:k.kullaniciAdi }); setBaglaInput(k.ogrenciId||''); }}
                        title="Öğrenci kaydını bağla / kaldır"
                        style={btnSt('#EEF2FF','#3730A3')}><LinkIcon /></button>
                      <button onClick={() => handleToggle(k.id)}
                        style={btnSt('#F0F4FF','#2A50A0')}>{k.aktif ? 'Pasif' : 'Aktif'}</button>
                      <button onClick={() => handleDelete(k.id, k.kullaniciAdi)}
                        style={btnSt('#F5E8E5','#A63825')}>Sil</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ════════════ GÜVENLİK LOGLARI ════════════ */}
      {aktifTab === 'guvenlik-loglari' && (
        <>
          <div style={{ marginBottom:12, padding:'10px 16px', background:'#FBF0D6',
            border:'1px solid #F0D080', borderRadius:8, fontSize:12, color:'#7A5000' }}>
            <strong>STRIDE Deney Logu</strong> — Spoofing, IDOR, Tampering, DoS, EoP ve Repudiation olayları izlenir.
            <button onClick={fetchLogs} style={{ ...btnSt('#FBF0D6','#A06800'), marginLeft:12 }}>
              <RefreshIcon />
            </button>
          </div>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, overflow:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead>
                <tr style={{ background:'var(--surface2)', borderBottom:'1px solid var(--border)' }}>
                  {['Zaman','IP','Kullanıcı','Olay Türü','Endpoint','Sonuç','Risk'].map(h => (
                    <th key={h} style={{ padding:'9px 12px', textAlign:'left', fontWeight:700,
                      fontSize:10, textTransform:'uppercase', letterSpacing:'.6px',
                      color:'var(--ink-mid)', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {secLogs.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding:32, textAlign:'center', color:'var(--text-muted)' }}>
                    Henüz log yok. Deneyler yapıldıkça burada görünecek.
                  </td></tr>
                ) : secLogs.map((l, i) => (
                  <tr key={l.id} style={{ borderBottom:'1px solid var(--border-light)',
                    background: i%2===0 ? 'transparent' : 'rgba(245,240,232,.3)' }}>
                    <td style={{ padding:'7px 12px', whiteSpace:'nowrap', color:'var(--text-muted)' }}>
                      {new Date(l.olusturmaZamani).toLocaleString('tr-TR')}
                    </td>
                    <td style={{ padding:'7px 12px', fontFamily:'monospace' }}>{l.ipAdresi}</td>
                    <td style={{ padding:'7px 12px' }}>{l.kullaniciAdi || '—'}</td>
                    <td style={{ padding:'7px 12px' }}>
                      <span style={{ padding:'2px 8px', borderRadius:4, fontSize:10, fontWeight:700,
                        background:'#F5E8E5', color:'#A63825', border:'1px solid #E0A098' }}>
                        {l.olayTuru}
                      </span>
                    </td>
                    <td style={{ padding:'7px 12px', fontFamily:'monospace', fontSize:11 }}>{l.hedefEndpoint}</td>
                    <td style={{ padding:'7px 12px' }}>
                      <span style={{ padding:'2px 8px', borderRadius:4, fontSize:10, fontWeight:700,
                        background: l.sonuc==='BASARILI' ? '#E8F0E6' : '#F5E8E5',
                        color:      l.sonuc==='BASARILI' ? '#3A6030' : '#A63825' }}>
                        {l.sonuc}
                      </span>
                    </td>
                    <td style={{ padding:'7px 12px', fontWeight:700, color:riskRenk(l.riskSeviyesi) }}>
                      {l.riskSeviyesi}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ════════════ ROL DEĞİŞTİR MODAL ════════════ */}
      {rolModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(28,20,16,.45)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 }}>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)',
            borderRadius:14, padding:28, width:340, boxShadow:'0 8px 40px rgba(28,20,16,.25)' }}>
            <h3 style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>Rol Değiştir</h3>
            <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:16 }}>
              <strong>{rolModal.kullaniciAdi}</strong> · Mevcut: {rolModal.mevcutRol}
            </p>
            <p style={{ fontSize:11, background:'#FBF0D6', padding:'8px 12px', borderRadius:6,
              color:'#7A5000', marginBottom:16, border:'1px solid #F0D080' }}>
              ⚠️ STRIDE — Elevation of Privilege: Bu işlem SecurityLog'a kaydedilir.
            </p>
            {['KULLANICI','OGRETIM_UYESI','ADMIN'].map(rol => (
              <button key={rol} onClick={() => handleRolDegistir(rolModal.id, rol)}
                disabled={rol === rolModal.mevcutRol}
                style={{ display:'block', width:'100%', marginBottom:8, padding:'9px 14px',
                  border:`1.5px solid ${(rolRenk[rol]||rolRenk.KULLANICI).border}`,
                  borderRadius:7, cursor: rol===rolModal.mevcutRol ? 'default' : 'pointer',
                  background:(rolRenk[rol]||rolRenk.KULLANICI).bg,
                  color:(rolRenk[rol]||rolRenk.KULLANICI).color,
                  fontWeight:700, fontSize:13, opacity: rol===rolModal.mevcutRol ? .5 : 1,
                  textAlign:'left' }}>
                {rol} {rol===rolModal.mevcutRol && '(mevcut)'}
              </button>
            ))}
            <button onClick={() => setRolModal(null)} style={{ width:'100%', marginTop:6, padding:'9px',
              border:'1.5px solid var(--border)', borderRadius:7, background:'none',
              cursor:'pointer', fontSize:13, color:'var(--text-muted)' }}>
              İptal
            </button>
          </div>
        </div>
      )}

      {/* ════════════ ÖĞRENCİ BAĞLA MODAL ════════════ */}
      {baglaModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(28,20,16,.45)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 }}>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)',
            borderRadius:14, padding:28, width:360, boxShadow:'0 8px 40px rgba(28,20,16,.25)' }}>
            <h3 style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>Öğrenci Kaydı Bağla</h3>
            <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:16 }}>
              <strong>{baglaModal.kullaniciAdi}</strong> hesabına öğrenci kaydı bağla/kaldır
            </p>
            <p style={{ fontSize:11, background:'#EEF2FF', padding:'8px 12px', borderRadius:6,
              color:'#3730A3', marginBottom:16, border:'1px solid #A5B4FC' }}>
              💡 Öğrenci tablosundaki ID'yi girin. Boş bırakırsanız bağlantı kaldırılır.
            </p>
            <label style={{ fontSize:11, fontWeight:700, textTransform:'uppercase',
              letterSpacing:'.6px', color:'var(--ink-mid)', display:'block', marginBottom:6 }}>
              Öğrenci ID
            </label>
            <input
              type="number"
              value={baglaInput}
              onChange={e => setBaglaInput(e.target.value)}
              placeholder="örn: 1"
              style={{ width:'100%', padding:'10px 12px', border:'1.5px solid var(--border)',
                borderRadius:7, fontSize:14, marginBottom:16, outline:'none',
                background:'var(--surface)', color:'var(--brown)' }}
            />
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={handleOgrenciBagla} style={{ flex:1, padding:'10px',
                background:'var(--brown)', color:'var(--cream)', border:'none', borderRadius:7,
                cursor:'pointer', fontWeight:700, fontSize:13 }}>
                {baglaInput ? 'Bağla' : 'Bağlantıyı Kaldır'}
              </button>
              <button onClick={() => { setBaglaModal(null); setBaglaInput(''); }}
                style={{ flex:1, padding:'10px', border:'1.5px solid var(--border)',
                  borderRadius:7, background:'none', cursor:'pointer', fontSize:13,
                  color:'var(--text-muted)' }}>
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
