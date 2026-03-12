import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { ogrenciService, bolumService } from '../services/api';

const emptyForm = {
  ad: '', soyad: '', ogrenciNo: '', email: '', telefon: '',
  dogumTarihi: '', cinsiyet: 'ERKEK', adres: '', bolumId: '',
  sinif: 1, kayitTarihi: new Date().toISOString().split('T')[0], aktif: true
};

const PlusIcon   = () => <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const EditIcon   = () => <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon  = () => <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const SearchIcon = () => <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const CloseIcon  = () => <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

function OgrencilerPage() {
  const [ogrenciler, setOgrenciler] = useState([]);
  const [bolumler, setBolumler]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [modal, setModal]           = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(emptyForm);
  const [saving, setSaving]         = useState(false);
  const [filterBolum, setFilterBolum] = useState('');

  const fetchAll = useCallback(async () => {
    try {
      const [o, b] = await Promise.all([ogrenciService.getAll(), bolumService.getAll()]);
      setOgrenciler(o); setBolumler(b);
    } catch { toast.error('Veriler yüklenemedi'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = ogrenciler.filter(o => {
    const q = search.toLowerCase();
    const ms = !search || [o.ad, o.soyad, o.ogrenciNo, o.email].some(v => v?.toLowerCase().includes(q));
    const mb = !filterBolum || String(o.bolumId) === filterBolum;
    return ms && mb;
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = o => {
    setEditing(o.id);
    setForm({ ad: o.ad, soyad: o.soyad, ogrenciNo: o.ogrenciNo, email: o.email,
      telefon: o.telefon || '', dogumTarihi: o.dogumTarihi || '',
      cinsiyet: o.cinsiyet || 'ERKEK', adres: o.adres || '',
      bolumId: o.bolumId || '', sinif: o.sinif || 1,
      kayitTarihi: o.kayitTarihi || '', aktif: o.aktif });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.ad || !form.soyad || !form.ogrenciNo || !form.email) {
      toast.error('Ad, soyad, numara ve e-posta zorunludur'); return;
    }
    setSaving(true);
    try {
      const payload = { ...form, bolumId: form.bolumId ? Number(form.bolumId) : null, sinif: Number(form.sinif) };
      if (editing) { await ogrenciService.update(editing, payload); toast.success('Güncellendi'); }
      else         { await ogrenciService.create(payload);          toast.success('Eklendi'); }
      setModal(false); fetchAll();
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, ad, soyad) => {
    if (!window.confirm(`${ad} ${soyad} silinsin mi?`)) return;
    try { await ogrenciService.delete(id); toast.success('Silindi'); fetchAll(); }
    catch (e) { toast.error(e.message); }
  };

  const handleToggle = async id => {
    try { await ogrenciService.toggleAktif(id); fetchAll(); }
    catch (e) { toast.error(e.message); }
  };

  const inp = (f, v) => setForm(p => ({ ...p, [f]: v }));

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Öğrenciler</h1>
        <button className="btn btn-primary" onClick={openCreate}><PlusIcon /> Yeni Öğrenci</button>
      </div>

      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
          <div className="search-wrapper">
            <span className="search-icon-svg"><SearchIcon /></span>
            <input className="form-control" placeholder="Ad, soyad, numara..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control" style={{ width: 200 }} value={filterBolum} onChange={e => setFilterBolum(e.target.value)}>
            <option value="">Tüm Bölümler</option>
            {bolumler.map(b => <option key={b.id} value={b.id}>{b.bolumAdi}</option>)}
          </select>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Öğrenci</th>
                <th>Numara</th>
                <th>Bölüm</th>
                <th>Sınıf</th>
                <th>E-posta</th>
                <th>Durum</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={7}><div className="empty-state"><p>Kayıt bulunamadı.</p></div></td></tr>
                : filtered.map(o => (
                  <tr key={o.id}>
                    <td>
                      <div className="table-name-cell">
                        <div className="table-avatar">{o.ad[0]}{o.soyad[0]}</div>
                        <div>
                          <div className="name">{o.ad} {o.soyad}</div>
                          <div className="sub">{o.cinsiyet}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, color: 'var(--ink-mid)' }}>{o.ogrenciNo}</span></td>
                    <td>
                      {o.bolumAdi
                        ? <span className="badge badge-info"><span className="badge-dot"/>{o.bolumAdi}</span>
                        : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td style={{ color: 'var(--ink-mid)', fontSize: 13 }}>{o.sinif}. Sınıf</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{o.email}</td>
                    <td>
                      <button onClick={() => handleToggle(o.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <span className={`badge ${o.aktif ? 'badge-success' : 'badge-default'}`}>
                          <span className="badge-dot" />{o.aktif ? 'Aktif' : 'Pasif'}
                        </span>
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn-icon" onClick={() => openEdit(o)}><EditIcon /></button>
                        <button className="btn-icon danger" onClick={() => handleDelete(o.id, o.ad, o.soyad)}><TrashIcon /></button>
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
              <h3>{editing ? 'Öğrenci Düzenle' : 'Yeni Öğrenci'}</h3>
              <button className="btn-icon" onClick={() => setModal(false)}><CloseIcon /></button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Ad *</label>
                  <input className="form-control" value={form.ad} onChange={e => inp('ad', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Soyad *</label>
                  <input className="form-control" value={form.soyad} onChange={e => inp('soyad', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Öğrenci No *</label>
                  <input className="form-control" value={form.ogrenciNo} onChange={e => inp('ogrenciNo', e.target.value)} disabled={!!editing} />
                </div>
                <div className="form-group">
                  <label className="form-label">E-posta *</label>
                  <input className="form-control" type="email" value={form.email} onChange={e => inp('email', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Telefon</label>
                  <input className="form-control" value={form.telefon} onChange={e => inp('telefon', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Doğum Tarihi</label>
                  <input className="form-control" type="date" value={form.dogumTarihi} onChange={e => inp('dogumTarihi', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Cinsiyet</label>
                  <select className="form-control" value={form.cinsiyet} onChange={e => inp('cinsiyet', e.target.value)}>
                    <option value="ERKEK">Erkek</option>
                    <option value="KADIN">Kadın</option>
                    <option value="DIGER">Diğer</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Bölüm</label>
                  <select className="form-control" value={form.bolumId} onChange={e => inp('bolumId', e.target.value)}>
                    <option value="">— Seçiniz —</option>
                    {bolumler.map(b => <option key={b.id} value={b.id}>{b.bolumAdi}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Sınıf</label>
                  <select className="form-control" value={form.sinif} onChange={e => inp('sinif', e.target.value)}>
                    {[1,2,3,4,5,6].map(s => <option key={s} value={s}>{s}. Sınıf</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Kayıt Tarihi</label>
                  <input className="form-control" type="date" value={form.kayitTarihi} onChange={e => inp('kayitTarihi', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Adres</label>
                <textarea className="form-control" rows={2} value={form.adres} onChange={e => inp('adres', e.target.value)} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.aktif} onChange={e => inp('aktif', e.target.checked)} />
                Aktif öğrenci
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

export default OgrencilerPage;
