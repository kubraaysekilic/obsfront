import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { bolumService } from '../services/api';

const emptyForm = { bolumAdi: '', bolumKodu: '', fakulte: '' };

const PlusIcon  = () => <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const EditIcon  = () => <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon = () => <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const CloseIcon = () => <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

const accents = ['#C8860A', '#4A6741', '#3D7EA6', '#7B5EA7', '#A63825', '#2A7F7F'];

function BolumlerPage() {
  const [bolumler, setBolumler] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [saving, setSaving]     = useState(false);

  const fetchAll = useCallback(async () => {
    try { setBolumler(await bolumService.getAll()); }
    catch { toast.error('Bölümler yüklenemedi'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const fakulteler = [...new Set(bolumler.map(b => b.fakulte))];

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = b => {
    setEditing(b.id);
    setForm({ bolumAdi: b.bolumAdi, bolumKodu: b.bolumKodu, fakulte: b.fakulte });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.bolumAdi || !form.bolumKodu || !form.fakulte) { toast.error('Tüm alanlar zorunludur'); return; }
    setSaving(true);
    try {
      if (editing) { await bolumService.update(editing, form); toast.success('Güncellendi'); }
      else         { await bolumService.create(form);          toast.success('Eklendi'); }
      setModal(false); fetchAll();
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, ad) => {
    if (!window.confirm(`"${ad}" silinsin mi?`)) return;
    try { await bolumService.delete(id); toast.success('Silindi'); fetchAll(); }
    catch (e) { toast.error(e.message); }
  };

  const inp = (f, v) => setForm(p => ({ ...p, [f]: v }));

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Bölümler</h1>
        <button className="btn btn-primary" onClick={openCreate}><PlusIcon /> Yeni Bölüm</button>
      </div>

      {bolumler.length === 0
        ? <div className="card"><div className="empty-state"><p>Kayıt bulunmuyor.</p></div></div>
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {bolumler.map((b, idx) => {
              const accent = accents[idx % accents.length];
              return (
                <div key={b.id} className="card" style={{ position: 'relative', overflow: 'hidden', transition: 'transform 0.18s, box-shadow 0.18s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                >
                  <div style={{ height: 3, background: accent, position: 'absolute', top: 0, left: 0, right: 0 }} />
                  <div style={{ padding: '20px 20px 16px', marginTop: 3 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 15.5, fontWeight: 600, color: 'var(--brown)', lineHeight: 1.3, marginBottom: 4 }}>
                          {b.bolumAdi}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.fakulte}</div>
                      </div>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, fontWeight: 500, background: 'var(--cream-dark)', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 8px', color: 'var(--brown-mid)', flexShrink: 0, marginLeft: 8 }}>
                        {b.bolumKodu}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 20, paddingTop: 12, borderTop: '1px solid var(--border-light)', marginBottom: 14 }}>
                      {[{ label: 'Öğrenci', value: b.ogrenciSayisi }, { label: 'Ders', value: b.dersSayisi }].map(s => (
                        <div key={s.label}>
                          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 700, color: accent, lineHeight: 1 }}>{s.value}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => openEdit(b)}><EditIcon /> Düzenle</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b.id, b.bolumAdi)}><TrashIcon /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      }

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? 'Bölüm Düzenle' : 'Yeni Bölüm'}</h3>
              <button className="btn-icon" onClick={() => setModal(false)}><CloseIcon /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Bölüm Adı *</label>
                <input className="form-control" value={form.bolumAdi} onChange={e => inp('bolumAdi', e.target.value)} />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Bölüm Kodu *</label>
                  <input className="form-control" value={form.bolumKodu} onChange={e => inp('bolumKodu', e.target.value.toUpperCase())} disabled={!!editing} />
                </div>
                <div className="form-group">
                  <label className="form-label">Fakülte *</label>
                  <input className="form-control" value={form.fakulte} onChange={e => inp('fakulte', e.target.value)} list="fak-list" />
                  <datalist id="fak-list">{fakulteler.map(f => <option key={f} value={f} />)}</datalist>
                </div>
              </div>
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

export default BolumlerPage;
