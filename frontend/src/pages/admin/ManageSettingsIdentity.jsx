import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { apiFetch } from '../../utils/api';

const ManageSettingsIdentity = () => {
  const [settings, setSettings] = useState({
    visi: '',
    misi: ''
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
        window.Swal.fire('Berhasil', 'Setelan Identitas (Visi & Misi) berhasil disimpan', 'success');
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
      <AdminLayout title="Setelan Visi & Misi">
        <div style={{ background: 'var(--card-bg)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Memuat setelan...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Setelan Visi & Misi">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
        <form onSubmit={handleSubmit} style={{ background: 'var(--card-bg)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '18px', fontWeight: 700, color: 'var(--text)', margin: '0 0 20px 0', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
            <i className="fas fa-bullseye" style={{ color: 'var(--primary)', marginRight: '8px' }}></i> Setelan Visi & Misi
          </h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>Visi Koperasi</label>
            <input 
              type="text" 
              name="visi"
              value={settings.visi}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '11px 14px', border: '2px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '0' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>Misi Koperasi (Pemisah Baris Baru)</label>
            <textarea 
              name="misi"
              rows="6"
              value={settings.misi}
              onChange={handleChange}
              required
              placeholder="Masukkan setiap misi di baris baru"
              style={{ width: '100%', padding: '11px 14px', border: '2px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical', lineHeight: '1.6' }}
            ></textarea>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>TIPS: Tekan ENTER untuk memisahkan butir-butir misi. Setiap baris baru otomatis dihitung menjadi satu nomor misi.</p>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="submit" className="btn-primary" disabled={saving} style={{ padding: '10px 24px', fontSize: '14px', fontWeight: 600 }}>
              {saving ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Menyimpan...</> : <><i className="fas fa-save" style={{ marginRight: '8px' }}></i> Simpan Setelan Visi & Misi</>}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default ManageSettingsIdentity;
