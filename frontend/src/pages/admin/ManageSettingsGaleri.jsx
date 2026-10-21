import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { apiFetch, getApiUrl, extractApiErrorMessage, PLACEHOLDER_IMG } from '../../utils/api';
import { compressImage } from '../../utils/imageCompressor';

const ManageSettingsGaleri = () => {
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const fileInputRefs = useRef({});

  const fetchSettings = async () => {
    try {
      const res = await apiFetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setJudul(data.galeri_judul || '');
        setDeskripsi(data.galeri_deskripsi || '');
        try {
          const parsed = JSON.parse(data.galeri_items || '[]');
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
    const newIndex = items.length;
    setItems(prev => [...prev, { gambar: '', judul: '' }]);
    setTimeout(() => {
      if (fileInputRefs.current[newIndex]) {
        fileInputRefs.current[newIndex].click();
      }
    }, 100);
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
      const processedFile = await compressImage(file);
      const formData = new FormData();
      formData.append('file', processedFile);

      const res = await apiFetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        handleItemChange(index, 'gambar', data.url);
      } else {
        const errorMsg = await extractApiErrorMessage(res, 'Gagal mengupload gambar');
        window.Swal.fire('Gagal', errorMsg, 'error');
      }
    } catch (err) {
      console.error(err);
      window.Swal.fire('Koneksi Gagal', 'Pastikan koneksi internet stabil dan server backend berjalan.', 'error');
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
            galeri_judul: judul,
            galeri_deskripsi: deskripsi,
            galeri_items: JSON.stringify(items),
          }
        })
      });
      if (res.ok) {
        window.Swal.fire('Berhasil', 'Setelan Galeri Kegiatan berhasil disimpan', 'success');
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
      <AdminLayout title="Setelan Galeri Kegiatan">
        <div style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '32px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Memuat setelan...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Setelan Galeri Kegiatan">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '32px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', margin: '0 0 20px 0', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <i className="fas fa-heading" style={{ color: 'var(--primary)', marginRight: '8px' }}></i> Judul & Deskripsi Bagian Galeri
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>Judul Galeri</label>
              <input
                type="text"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                required
                style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--border-strong)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '0' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>Deskripsi Galeri</label>
              <textarea
                rows="3"
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                required
                style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--border-strong)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical', lineHeight: '1.6' }}
              ></textarea>
            </div>
          </div>

          <div style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '32px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                <i className="fas fa-images" style={{ color: 'var(--primary)', marginRight: '8px' }}></i> Foto Kegiatan
              </h3>
              <button type="button" onClick={addItem} style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600, background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                <i className="fas fa-plus" style={{ marginRight: '6px' }}></i>Tambah Foto
              </button>
            </div>

            {items.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                Belum ada foto kegiatan. Klik "Tambah Foto" untuk menambahkan.
              </p>
            )}

            <div className="admin-settings-items">
            {items.map((item, index) => (
              <div key={index} className="admin-settings-item" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '16px', marginBottom: '12px', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '4px' }}>
                  <button type="button" onClick={() => moveItem(index, -1)} disabled={index === 0} title="Pindah ke atas" style={{ padding: '4px 8px', fontSize: '12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', cursor: index === 0 ? 'not-allowed' : 'pointer', opacity: index === 0 ? 0.3 : 1, color: 'var(--text)' }}>
                    <i className="fas fa-chevron-up"></i>
                  </button>
                  <button type="button" onClick={() => moveItem(index, 1)} disabled={index === items.length - 1} title="Pindah ke bawah" style={{ padding: '4px 8px', fontSize: '12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', cursor: index === items.length - 1 ? 'not-allowed' : 'pointer', opacity: index === items.length - 1 ? 0.3 : 1, color: 'var(--text)' }}>
                    <i className="fas fa-chevron-down"></i>
                  </button>
                </div>
                <div
                  style={{ flex: '0 0 120px', height: '80px', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', position: 'relative', background: 'var(--border)' }}
                  onClick={() => triggerFileInput(index)}
                >
                  {uploadingIndex === index ? (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.05)' }}>
                      <i className="fas fa-spinner fa-spin" style={{ fontSize: '20px', color: 'var(--primary)' }}></i>
                    </div>
                  ) : item.gambar ? (
                    <img
                      src={getApiUrl(item.gambar)}
                      alt={item.judul || 'Foto'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER_IMG; }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: 'var(--text-muted)' }}>
                      <i className="fas fa-plus"></i>
                    </div>
                  )}
                  <input
                    ref={el => fileInputRefs.current[index] = el}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileInputChange(index, e)}
                    style={{ display: 'none' }}
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>
                    Nama / Judul Kegiatan:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Launching Unit Usaha Koperasi UTM"
                    value={item.judul}
                    onChange={(e) => handleItemChange(index, 'judul', e.target.value)}
                    required
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border-strong)', borderRadius: '8px', fontSize: '13px', outline: 'none', backgroundColor: 'var(--card-bg)', color: 'var(--text)', boxSizing: 'border-box' }}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Nama ini akan muncul saat foto disorot (hover) pada halaman Profil. Klik gambar untuk mengganti foto.</span>
                </div>
                <button type="button" onClick={() => removeItem(index)} title="Hapus foto" style={{ padding: '6px 10px', fontSize: '14px', background: 'transparent', border: '1px solid #ef4444', borderRadius: '8px', cursor: 'pointer', color: '#ef4444' }}>
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-primary" disabled={saving} style={{ padding: '10px 24px', fontSize: '14px', fontWeight: 600 }}>
              {saving ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Menyimpan...</> : <><i className="fas fa-save" style={{ marginRight: '8px' }}></i> Simpan Setelan Galeri</>}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default ManageSettingsGaleri;
