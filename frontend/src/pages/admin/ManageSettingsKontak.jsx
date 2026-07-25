import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { apiFetch } from '../../utils/api';

const ManageSettingsKontak = () => {
  const [settings, setSettings] = useState({
    kontak_alamat: '',
    kontak_whatsapp: '',
    kontak_email: '',
    kontak_instagram: '',
    kontak_maps_embed: ''
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
      const token = localStorage.getItem('kopma_admin_token');
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const payload = {
        kontak_alamat: settings.kontak_alamat,
        kontak_whatsapp: settings.kontak_whatsapp,
        kontak_email: settings.kontak_email,
        kontak_instagram: settings.kontak_instagram,
        kontak_maps_embed: settings.kontak_maps_embed,
      };
      const res = await fetch(`${BASE_URL}/api/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ settings: payload })
      });
      if (res.ok) {
        window.Swal.fire('Berhasil', 'Setelan Kontak berhasil disimpan', 'success');
      } else {
        const errData = await res.json().catch(() => ({}));
        window.Swal.fire('Gagal', errData.message || 'Gagal menyimpan setelan (HTTP ' + res.status + ')', 'error');
      }
    } catch (err) {
      console.error('Kontak save error:', err);
      window.Swal.fire('Koneksi Gagal', 'Pastikan server backend berjalan di ' + (import.meta.env.VITE_API_URL || 'http://localhost:8000'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Setelan Kontak">
        <div style={{ background: 'var(--card-bg)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Memuat setelan...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Setelan Kontak">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
        <form onSubmit={handleSubmit} style={{ background: 'var(--card-bg)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '18px', fontWeight: 700, color: 'var(--text)', margin: '0 0 20px 0', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
            <i className="fas fa-map-marked-alt" style={{ color: 'var(--primary)', marginRight: '8px' }}></i> Setelan Kontak & Peta
          </h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>Alamat</label>
            <textarea
              name="kontak_alamat"
              rows="3"
              value={settings.kontak_alamat}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '11px 14px', border: '2px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical', lineHeight: '1.6' }}
            ></textarea>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>No. WhatsApp</label>
              <input
                type="text"
                name="kontak_whatsapp"
                value={settings.kontak_whatsapp}
                onChange={handleChange}
                required
                placeholder="+62 811-3300-676"
                style={{ width: '100%', padding: '11px 14px', border: '2px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>Email</label>
              <input
                type="email"
                name="kontak_email"
                value={settings.kontak_email}
                onChange={handleChange}
                required
                placeholder="koperasi@example.com"
                style={{ width: '100%', padding: '11px 14px', border: '2px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>Instagram</label>
              <input
                type="text"
                name="kontak_instagram"
                value={settings.kontak_instagram}
                onChange={handleChange}
                required
                placeholder="@koperasiutm"
                style={{ width: '100%', padding: '11px 14px', border: '2px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '0' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>Google Maps Embed URL</label>
              <input
                type="text"
                name="kontak_maps_embed"
                value={settings.kontak_maps_embed}
                onChange={handleChange}
                placeholder="https://www.google.com/maps/embed?pb=..."
              style={{ width: '100%', padding: '11px 14px', border: '2px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' }}
            />
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Masukkan URL embed dari Google Maps. Buka Google Maps, cari lokasi, klik "Bagikan" → "Sematkan peta", lalu salin URL <code>src="..."</code>.
            </p>
          </div>

          {settings.kontak_maps_embed && (
            <div style={{ marginTop: '16px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '8px 12px', margin: 0, background: 'var(--surface)' }}>Pratinjau Peta:</p>
              <iframe
                src={settings.kontak_maps_embed}
                width="100%"
                height="250"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Pratinjau Peta"
                style={{ border: 'none', display: 'block' }}
              ></iframe>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="submit" className="btn-primary" disabled={saving} style={{ padding: '10px 24px', fontSize: '14px', fontWeight: 600 }}>
              {saving ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Menyimpan...</> : <><i className="fas fa-save" style={{ marginRight: '8px' }}></i> Simpan Setelan Kontak</>}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default ManageSettingsKontak;
