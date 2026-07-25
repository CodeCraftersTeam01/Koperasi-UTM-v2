import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { apiFetch } from '../../utils/api';

const ICONS = [
  'fa-coins', 'fa-file-invoice', 'fa-truck', 'fa-bus', 'fa-mobile-alt',
  'fa-shopping-cart', 'fa-utensils', 'fa-wifi', 'fa-print', 'fa-laptop',
  'fa-book', 'fa-graduation-cap', 'fa-hand-holding-usd', 'fa-piggy-bank',
  'fa-exchange-alt', 'fa-cogs', 'fa-conveyor-belt', 'fa-box-open',
  'fa-store', 'fa-wallet',
];

const ManageSettingsLayanan = () => {
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const fileInputRefs = useRef({});

  const fetchSettings = async () => {
    try {
      const res = await apiFetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setJudul(data.layanan_judul || '');
        setDeskripsi(data.layanan_deskripsi || '');
        try {
          const parsed = JSON.parse(data.layanan_items || '[]');
          setItems(Array.isArray(parsed) ? parsed : []);
        } catch {
          setItems([]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleItemChange = (index, field, value) => {
    setItems(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const addItem = () => {
    setItems(prev => [...prev, { gambar: '', ikon: 'fa-cogs', judul: '', deskripsi: '' }]);
  };

  const removeItem = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const moveItem = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    setItems(prev => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleFileUpload = async (index, file) => {
    if (!file) return;
    setUploadingIndex(index);
    try {
      const token = localStorage.getItem('kopma_admin_token');
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        handleItemChange(index, 'gambar', data.url);
        handleItemChange(index, 'ikon', '');
      } else {
        window.Swal.fire('Gagal', 'Gagal mengupload gambar', 'error');
      }
    } catch (err) {
      console.error(err);
      window.Swal.fire('Koneksi Gagal', 'Pastikan server backend berjalan.', 'error');
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleFileInputChange = (index, e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(index, file);
    }
    e.target.value = '';
  };

  const triggerFileInput = (index) => {
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index].click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiFetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            layanan_judul: judul,
            layanan_deskripsi: deskripsi,
            layanan_items: JSON.stringify(items),
          }
        })
      });
      if (res.ok) {
        window.Swal.fire('Berhasil', 'Setelan Layanan berhasil disimpan', 'success');
      } else {
        window.Swal.fire('Gagal', 'Gagal menyimpan setelan', 'error');
      }
    } catch (err) {
      window.Swal.fire('Koneksi Gagal', 'Pastikan server backend berjalan.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Setelan Layanan">
        <div style={{ background: 'var(--card-bg)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Memuat setelan...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Setelan Layanan">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ background: 'var(--card-bg)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '24px' }}>
            <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '18px', fontWeight: 700, color: 'var(--text)', margin: '0 0 20px 0', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <i className="fas fa-heading" style={{ color: 'var(--primary)', marginRight: '8px' }}></i> Judul & Deskripsi Bagian Layanan
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>Judul Layanan</label>
              <input
                type="text"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                required
                style={{ width: '100%', padding: '11px 14px', border: '2px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '0' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>Deskripsi Layanan</label>
              <textarea
                rows="3"
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                required
                style={{ width: '100%', padding: '11px 14px', border: '2px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical', lineHeight: '1.6' }}
              ></textarea>
            </div>
          </div>

          <div style={{ background: 'var(--card-bg)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '18px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                <i className="fas fa-concierge-bell" style={{ color: 'var(--primary)', marginRight: '8px' }}></i> Daftar Layanan
              </h3>
              <button type="button" onClick={addItem} style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600, background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                <i className="fas fa-plus" style={{ marginRight: '6px' }}></i>Tambah Layanan
              </button>
            </div>

            {items.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                Belum ada layanan. Klik "Tambah Layanan" untuk menambahkan.
              </p>
            )}

            {items.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '16px', marginBottom: '12px', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '4px' }}>
                  <button type="button" onClick={() => moveItem(index, -1)} disabled={index === 0} title="Pindah ke atas" style={{ padding: '4px 8px', fontSize: '12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', cursor: index === 0 ? 'not-allowed' : 'pointer', opacity: index === 0 ? 0.3 : 1, color: 'var(--text)' }}>
                    <i className="fas fa-chevron-up"></i>
                  </button>
                  <button type="button" onClick={() => moveItem(index, 1)} disabled={index === items.length - 1} title="Pindah ke bawah" style={{ padding: '4px 8px', fontSize: '12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', cursor: index === items.length - 1 ? 'not-allowed' : 'pointer', opacity: index === items.length - 1 ? 0.3 : 1, color: 'var(--text)' }}>
                    <i className="fas fa-chevron-down"></i>
                  </button>
                </div>

                {item.gambar ? (
                  <div style={{ flex: '0 0 120px', height: '80px', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', position: 'relative', background: 'var(--border)' }} onClick={() => triggerFileInput(index)}>
                    {uploadingIndex === index ? (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.05)' }}>
                        <i className="fas fa-spinner fa-spin" style={{ fontSize: '20px', color: 'var(--primary)' }}></i>
                      </div>
                    ) : (
                      <img
                        src={item.gambar.startsWith('upload/') ? `${BASE_URL}/${item.gambar}` : item.gambar.startsWith('http') ? item.gambar : `${BASE_URL}/${item.gambar}`}
                        alt={item.judul || 'Layanan'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:24px;color:var(--text-muted)"><i class="fas fa-image"></i></div>'; }}
                      />
                    )}
                    <input ref={el => fileInputRefs.current[index] = el} type="file" accept="image/*" onChange={(e) => handleFileInputChange(index, e)} style={{ display: 'none' }} />
                    <div style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: '4px', padding: '2px 6px', fontSize: '10px' }}>Ganti</div>
                  </div>
                ) : (
                  <div style={{ flex: '0 0 120px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '8px', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '28px', color: 'var(--primary)' }} onClick={() => triggerFileInput(index)}>
                        <i className={`fas ${item.ikon || 'fa-cogs'}`}></i>
                      </div>
                      <div style={{ position: 'relative', width: '100%' }}>
                        <select
                          value={item.ikon || 'fa-cogs'}
                          onChange={(e) => {
                            handleItemChange(index, 'ikon', e.target.value);
                            handleItemChange(index, 'gambar', '');
                          }}
                          style={{ width: '100%', padding: '4px 6px', fontSize: '11px', border: '2px solid var(--border)', borderRadius: '6px', outline: 'none', backgroundColor: 'var(--card-bg)', color: 'var(--text)', boxSizing: 'border-box', cursor: 'pointer' }}
                        >
                          {ICONS.map(ico => (
                            <option key={ico} value={ico}>{ico}</option>
                          ))}
                        </select>
                      </div>
                      <input ref={el => fileInputRefs.current[index] = el} type="file" accept="image/*" onChange={(e) => handleFileInputChange(index, e)} style={{ display: 'none' }} />
                      <button type="button" onClick={() => triggerFileInput(index)} style={{ fontSize: '10px', padding: '2px 8px', background: 'transparent', border: '1px dashed var(--border)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-muted)', width: '100%' }}>
                        <i className="fas fa-upload"></i> Upload Gambar
                      </button>
                    </div>
                  </div>
                )}

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Nama Layanan"
                    value={item.judul}
                    onChange={(e) => handleItemChange(index, 'judul', e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px 12px', border: '2px solid var(--border)', borderRadius: '8px', fontSize: '13px', outline: 'none', backgroundColor: 'var(--card-bg)', color: 'var(--text)', boxSizing: 'border-box' }}
                  />
                  <textarea
                    placeholder="Deskripsi Layanan"
                    rows="2"
                    value={item.deskripsi}
                    onChange={(e) => handleItemChange(index, 'deskripsi', e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px 12px', border: '2px solid var(--border)', borderRadius: '8px', fontSize: '13px', outline: 'none', backgroundColor: 'var(--card-bg)', color: 'var(--text)', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical', lineHeight: '1.5' }}
                  ></textarea>
                </div>

                <button type="button" onClick={() => removeItem(index)} title="Hapus layanan" style={{ padding: '6px 10px', fontSize: '14px', background: 'transparent', border: '1px solid #ef4444', borderRadius: '8px', cursor: 'pointer', color: '#ef4444' }}>
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-primary" disabled={saving} style={{ padding: '10px 24px', fontSize: '14px', fontWeight: 600 }}>
              {saving ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Menyimpan...</> : <><i className="fas fa-save" style={{ marginRight: '8px' }}></i> Simpan Setelan Layanan</>}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default ManageSettingsLayanan;
