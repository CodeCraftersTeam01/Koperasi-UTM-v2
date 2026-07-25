import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { apiFetch } from '../../utils/api';

const ManageSettingsCheckout = () => {
  const [settings, setSettings] = useState({
    checkout_method: 'direct',
    admin_whatsapp: '',
    admin_email: ''
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
        window.Swal.fire('Berhasil', 'Setelan Checkout berhasil disimpan', 'success');
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
      <AdminLayout title="Setelan Checkout">
        <div style={{ background: 'var(--card-bg)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Memuat setelan...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Setelan Checkout">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
        <form onSubmit={handleSubmit} style={{ background: 'var(--card-bg)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '18px', fontWeight: 700, color: 'var(--text)', margin: '0 0 20px 0', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
            <i className="fas fa-shopping-bag" style={{ color: 'var(--primary)', marginRight: '8px' }}></i> Setelan Checkout
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>Metode Checkout</label>
              <select 
                name="checkout_method"
                value={settings.checkout_method}
                onChange={handleChange}
                style={{ width: '100%', padding: '11px 14px', border: '2px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' }}
              >
                <option value="direct">Direct WhatsApp</option>
                <option value="advanced">Advanced (Fonnte WA & SMTP)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>No. WA Admin (Penerima)</label>
              <input 
                type="text" 
                name="admin_whatsapp"
                placeholder="Contoh: 6285727877235"
                value={settings.admin_whatsapp}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '11px 14px', border: '2px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' }}
              />
            </div>
            {settings.checkout_method === 'advanced' && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>Email Admin (Penerima Notif)</label>
                <input 
                  type="email" 
                  name="admin_email"
                  placeholder="Contoh: admin@domain.com"
                  value={settings.admin_email}
                  onChange={handleChange}
                  required={settings.checkout_method === 'advanced'}
                  style={{ width: '100%', padding: '11px 14px', border: '2px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' }}
                />
              </div>
            )}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '16px', lineHeight: '1.5' }}>
            <strong>Catatan Keamanan:</strong> Untuk metode <em>Advanced Notification</em>, kredensial sensitif (seperti API Token Fonnte dan SMTP Email Password) diatur secara aman langsung pada file konfigurasi server backend (<code>.env</code>) untuk menjamin perlindungan data.
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="submit" className="btn-primary" disabled={saving} style={{ padding: '10px 24px', fontSize: '14px', fontWeight: 600 }}>
              {saving ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Menyimpan...</> : <><i className="fas fa-save" style={{ marginRight: '8px' }}></i> Simpan Setelan Checkout</>}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default ManageSettingsCheckout;
