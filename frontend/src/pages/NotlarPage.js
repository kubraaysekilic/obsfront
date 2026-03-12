import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { notService, ogrenciService, dersService } from '../services/api';

const emptyForm = { ogrenciId: '', dersId: '', vizeNotu: '', finalNotu: '', yil: new Date().getFullYear(), donem: 'Güz' };

const HARF_BADGE = {
  'AA': 'badge-success', 'BA': 'badge-success', 'BB': 'badge-success',
  'CB': 'badge-info',    'CC': 'badge-info',
  'DC': 'badge-warning', 'DD': 'badge-warning',
  'FD': 'badge-error',   'FF': 'badge-error', '-': 'badge-default'
};

const PlusIcon  = () => <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const EditIcon  = () => <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon = () => <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const CloseIcon = () => <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

function NotlarPage() {
  const [notlar, setNotlar]         = useState([]);
  const [ogrenciler, setOgrenciler] = useState([]);
  const [dersler, setDersler]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(emptyForm);
  const [saving, setSaving]         = useState(false);
  const [filterOgr, setFilterOgr]   = useState('');

  const fetchAll = useCallback(async () => {
    try {
      const [n, o, d] = await Promise.all([notService.getAll(), ogrenciService.getAll(), dersService.getAll()]);
      setNotlar(n); setOgrenciler(o); setDersler(d);
    } catch { toast.error('Veriler yüklenemedi'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = notlar.filter(n => !filterOgr || String(n.ogrenciId) === filterOgr);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = n => {
    setEditing(n.id);
    setForm({ ogrenciId: n.ogrenciId, dersId: n.dersId,
      vizeNotu: n.vizeNotu ?? '', finalNotu: n.finalNotu ?? '',
      yil: n.yil, donem: n.donem });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.ogrenciId || !form.dersId) { toast.error('Öğrenci ve ders seçimi zorunludur'); return; }
    setSaving(true);
    try {
      const payload = {
        ogrenciId: Number(form.ogrenciId), dersId: Number(form.dersId),
        vizeNotu:  form.vizeNotu  !== '' ? Number(form.vizeNotu)  : null,
        finalNotu: form.finalNotu !== '' ? Number(form.finalNotu) : null,
        yil: Number(form.yil), donem: form.donem
      };
      if (editing) { await notService.update(editing, payload); toast.success('Güncellendi'); }
      else         { await notService.create(payload);          toast.success('Eklendi'); }
      setModal(false); fetchAll();
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Bu not kaydı silinsin mi?')) return;
    try { await notService.delete(id); toast.success('Silindi'); fetchAll(); }
    catch (e) { toast.error(e.message); }
  };

  const inp = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const preview = ((Number(form.vizeNotu || 0) * 0.4) + (Number(form.finalNotu || 0) * 0.6)).toFixed(1);

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Not Yönetimi</h1>
        <button className="btn btn-primary" onClick={openCreate}><PlusIcon /> Not Ekle</button>
      </div>

      <div className="card">
        <div className="card-header">
          <select className="form-control" style={{ maxWidth: 320 }} value={filterOgr} onChange={e => setFilterOgr(e.target.value)}>
            <option value="">Tüm Öğrenciler</option>
            {ogrenciler.map(o => <option key={o.id} value={o.id}>{o.ad} {o.soyad} — {o.ogrenciNo}</option>)}
          </select>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Öğrenci</th>
                <th>Ders</th>
                <th>Dönem</th>
                <th>Vize</th>
                <th>Final</th>
                <th>Ortalama</th>
                <th>Harf</th>
                <th>Sonuç</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={9}><div className="empty-state"><p>Kayıt bulunamadı.</p></div></td></tr>
                : filtered.map(n => (
                  <tr key={n.id}>
                    <td>
                      <div className="table-name-cell">
                        <div className="table-avatar">{(n.ogrenciAd||'?')[0]}{(n.ogrenciSoyad||'?')[0]}</div>
                        <div>
                          <div className="name">{n.ogrenciAd} {n.ogrenciSoyad}</div>
                          <div className="sub" style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>{n.ogrenciNo}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13.5 }}>{n.dersAdi}</div>
                      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11.5, color: 'var(--text-muted)' }}>{n.dersKodu}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>{n.yil} / {n.donem}</td>
                    <td><span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 600 }}>{n.vizeNotu != null ? n.vizeNotu.toFixed(1) : '—'}</span></td>
                    <td><span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 600 }}>{n.finalNotu != null ? n.finalNotu.toFixed(1) : '—'}</span></td>
                    <td>
                      {n.ortalama != null
                        ? <strong style={{ fontFamily: 'DM Mono, monospace', color: n.ortalama >= 60 ? 'var(--sage)' : 'var(--rust)', fontSize: 14 }}>{n.ortalama.toFixed(1)}</strong>
                        : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td>
                      <span className={`badge ${HARF_BADGE[n.harfNotu] || 'badge-default'}`}>
                        <span className="badge-dot" />{n.harfNotu || '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${n.gecti ? 'badge-success' : 'badge-error'}`}>
                        <span className="badge-dot" />{n.gecti ? 'Geçti' : 'Kaldı'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn-icon" onClick={() => openEdit(n)}><EditIcon /></button>
                        <button className="btn-icon danger" onClick={() => handleDelete(n.id)}><TrashIcon /></button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? 'Not Düzenle' : 'Not Ekle'}</h3>
              <button className="btn-icon" onClick={() => setModal(false)}><CloseIcon /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Öğrenci *</label>
                <select className="form-control" value={form.ogrenciId} onChange={e => inp('ogrenciId', e.target.value)} disabled={!!editing}>
                  <option value="">— Seçiniz —</option>
                  {ogrenciler.map(o => <option key={o.id} value={o.id}>{o.ad} {o.soyad} ({o.ogrenciNo})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Ders *</label>
                <select className="form-control" value={form.dersId} onChange={e => inp('dersId', e.target.value)} disabled={!!editing}>
                  <option value="">— Seçiniz —</option>
                  {dersler.map(d => <option key={d.id} value={d.id}>{d.dersAdi} ({d.dersKodu})</option>)}
                </select>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Vize Notu</label>
                  <input className="form-control" type="number" min={0} max={100} step={0.5} value={form.vizeNotu} onChange={e => inp('vizeNotu', e.target.value)} placeholder="0 – 100" />
                </div>
                <div className="form-group">
                  <label className="form-label">Final Notu</label>
                  <input className="form-control" type="number" min={0} max={100} step={0.5} value={form.finalNotu} onChange={e => inp('finalNotu', e.target.value)} placeholder="0 – 100" />
                </div>
                <div className="form-group">
                  <label className="form-label">Yıl</label>
                  <input className="form-control" type="number" value={form.yil} onChange={e => inp('yil', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Dönem</label>
                  <select className="form-control" value={form.donem} onChange={e => inp('donem', e.target.value)}>
                    <option>Güz</option><option>Bahar</option><option>Yaz</option>
                  </select>
                </div>
              </div>
              {(form.vizeNotu !== '' || form.finalNotu !== '') && (
                <div style={{ background: 'var(--cream-dark)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 13, color: 'var(--ink-mid)' }}>
                  Tahmini ortalama: <strong style={{ fontFamily: 'DM Mono, monospace', color: 'var(--brown)', fontSize: 14 }}>{preview}</strong>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>İptal</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Kaydediliyor...' : editing ? 'Güncelle' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotlarPage;
