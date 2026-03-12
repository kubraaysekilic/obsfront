import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { dersService, bolumService } from '../services/api';

const emptyForm = { dersAdi: '', dersKodu: '', kredi: 3, bolumId: '', ogretimUyesi: '', donem: 'Güz', aktif: true };

const PlusIcon   = () => <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const EditIcon   = () => <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon  = () => <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const SearchIcon = () => <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const CloseIcon  = () => <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

function DerslerPage() {
  const [dersler, setDersler]   = useState([]);
  const [bolumler, setBolumler] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [saving, setSaving]     = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [d, b] = await Promise.all([dersService.getAll(), bolumService.getAll()]);
      setDersler(d); setBolumler(b);
    } catch { toast.error('Veriler yüklenemedi'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = dersler.filter(d => {
    const q = search.toLowerCase();
    return !search || [d.dersAdi, d.dersKodu, d.ogretimUyesi || ''].some(v => v.toLowerCase().includes(q));
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = d => {
    setEditing(d.id);
    setForm({ dersAdi: d.dersAdi, dersKodu: d.dersKodu, kredi: d.kredi,
      bolumId: d.bolumId || '', ogretimUyesi: d.ogretimUyesi || '',
      donem: d.donem || 'Güz', aktif: d.aktif });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.dersAdi || !form.dersKodu) { toast.error('Ders adı ve kodu zorunludur'); return; }
    setSaving(true);
    try {
      const payload = { ...form, bolumId: form.bolumId ? Number(form.bolumId) : null, kredi: Number(form.kredi) };
      if (editing) { await dersService.update(editing, payload); toast.success('Güncellendi'); }
      else         { await dersService.create(payload);          toast.success('Eklendi'); }
      setModal(false); fetchAll();
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, ad) => {
    if (!window.confirm(`"${ad}" silinsin mi?`)) return;
    try { await dersService.delete(id); toast.success('Silindi'); fetchAll(); }
    catch (e) { toast.error(e.message); }
  };

  const inp = (f, v) => setForm(p => ({ ...p, [f]: v }));

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Dersler</h1>
        <button className="btn btn-primary" onClick={openCreate}><PlusIcon /> Yeni Ders</button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-wrapper">
            <span className="search-icon-svg"><SearchIcon /></span>
            <input className="form-control" placeholder="Ders adı, kodu..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Ders Adı</th>
                <th>Kod</th>
                <th>Kredi</th>
                <th>Bölüm</th>
                <th>Öğretim Üyesi</th>
                <th>Dönem</th>
                <th>Durum</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={8}><div className="empty-state"><p>Kayıt bulunamadı.</p></div></td></tr>
                : filtered.map(d => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 500 }}>{d.dersAdi}</td>
                    <td><span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12.5, background: 'var(--cream-dark)', padding: '2px 8px', borderRadius: 4, color: 'var(--brown-mid)' }}>{d.dersKodu}</span></td>
                    <td><span className="badge badge-default"><span className="badge-dot" />{d.kredi} AKTS</span></td>
                    <td style={{ fontSize: 13 }}>{d.bolumAdi || '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{d.ogretimUyesi || '—'}</td>
                    <td style={{ fontSize: 13 }}>{d.donem || '—'}</td>
                    <td>
                      <span className={`badge ${d.aktif ? 'badge-success' : 'badge-default'}`}>
                        <span className="badge-dot" />{d.aktif ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn-icon" onClick={() => openEdit(d)}><EditIcon /></button>
                        <button className="btn-icon danger" onClick={() => handleDelete(d.id, d.dersAdi)}><TrashIcon /></button>
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
              <h3>{editing ? 'Ders Düzenle' : 'Yeni Ders'}</h3>
              <button className="btn-icon" onClick={() => setModal(false)}><CloseIcon /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Ders Adı *</label>
                <input className="form-control" value={form.dersAdi} onChange={e => inp('dersAdi', e.target.value)} />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Ders Kodu *</label>
                  <input className="form-control" value={form.dersKodu} onChange={e => inp('dersKodu', e.target.value)} disabled={!!editing} />
                </div>
                <div className="form-group">
                  <label className="form-label">Kredi (AKTS)</label>
                  <input className="form-control" type="number" min={1} max={9} value={form.kredi} onChange={e => inp('kredi', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Bölüm</label>
                  <select className="form-control" value={form.bolumId} onChange={e => inp('bolumId', e.target.value)}>
                    <option value="">— Seçiniz —</option>
                    {bolumler.map(b => <option key={b.id} value={b.id}>{b.bolumAdi}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Dönem</label>
                  <select className="form-control" value={form.donem} onChange={e => inp('donem', e.target.value)}>
                    <option>Güz</option><option>Bahar</option><option>Yaz</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Öğretim Üyesi</label>
                  <input className="form-control" value={form.ogretimUyesi} onChange={e => inp('ogretimUyesi', e.target.value)} />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.aktif} onChange={e => inp('aktif', e.target.checked)} />
                Aktif ders
              </label>
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

export default DerslerPage;
