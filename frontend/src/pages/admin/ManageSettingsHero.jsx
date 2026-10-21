import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { apiFetch } from '../../utils/api';

const ManageSettingsHero = () => {
  const [settings, setSettings] = useState({
    hero_title_accent: '',
    hero_title_sub: '',
    hero_tagline: '',
    hero_desc: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await apiFetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(prev => ({ ...prev, ...data }));
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiFetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      if (res.ok) {
        window.Swal.fire('Berhasil', 'Setelan Hero berhasil disimpan', 'success');
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
      <AdminLayout title="Setelan Hero (Halaman Utama)">
        <div style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '32px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Memuat setelan...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Setelan Hero (Halaman Utama)">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
        <form className="admin-card" onSubmit={handleSubmit} style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '32px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', margin: '0 0 20px 0', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
            <i className="fas fa-home" style={{ color: 'var(--primary)', marginRight: '8px' }}></i> Setelan Hero
          </h3>
          
          <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>Judul Aksen (Bold Hijau)</label>
              <input 
                type="text" 
                name="hero_title_accent"
                value={settings.hero_title_accent}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--border-strong)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>Judul Sub (Teks Bawah)</label>
              <input 
                type="text" 
                name="hero_title_sub"
                value={settings.hero_title_sub}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--border-strong)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>Tagline Slogan</label>
            <input 
              type="text" 
              name="hero_tagline"
              value={settings.hero_tagline}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--border-strong)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '0' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>Deskripsi Singkat</label>
            <textarea 
              name="hero_desc"
              rows="3"
              value={settings.hero_desc}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--border-strong)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}
            ></textarea>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="submit" className="btn-primary" disabled={saving} style={{ padding: '10px 24px', fontSize: '14px', fontWeight: 600 }}>
              {saving ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Menyimpan...</> : <><i className="fas fa-save" style={{ marginRight: '8px' }}></i> Simpan Setelan Hero</>}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default ManageSettingsHero;
