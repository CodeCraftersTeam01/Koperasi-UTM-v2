import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { apiFetch } from '../../utils/api';

const ManageSettingsCheckout = () => {
  const [checkoutSystem, setCheckoutSystem] = useState('current');
  const [adminWhatsapp, setAdminWhatsapp] = useState('085727877235');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await apiFetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.checkout_system) setCheckoutSystem(data.checkout_system);
        if (data.admin_whatsapp) setAdminWhatsapp(data.admin_whatsapp);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiFetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            checkout_system: checkoutSystem,
            admin_whatsapp: adminWhatsapp,
          }
        })
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
        <div style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '32px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Memuat setelan...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Setelan Checkout">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
        <form className="admin-card" onSubmit={handleSubmit} style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '32px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', margin: '0 0 20px 0', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
            <i className="fas fa-shopping-bag" style={{ color: 'var(--primary)', marginRight: '8px' }}></i> Setelan Checkout
          </h3>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '12px' }}>Pilih Sistem Checkout</label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', border: `2px solid ${checkoutSystem === 'wa' ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '12px', cursor: 'pointer', marginBottom: '12px', background: checkoutSystem === 'wa' ? 'var(--primary-light)' : 'var(--surface)', transition: 'all 0.2s' }}>
              <input type="radio" name="checkout_system" value="wa" checked={checkoutSystem === 'wa'} onChange={(e) => setCheckoutSystem(e.target.value)} style={{ marginTop: '3px' }} />
              <div>
                <strong style={{ display: 'block', color: 'var(--text)', marginBottom: '4px' }}>Sistem WhatsApp</strong>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Pelanggan diarahkan ke WhatsApp Admin dengan template pesanan otomatis. Pesanan tidak tersimpan di dashboard Admin dan tidak muncul di Riwayat Pesanan.</span>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', border: `2px solid ${checkoutSystem === 'current' ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '12px', cursor: 'pointer', background: checkoutSystem === 'current' ? 'var(--primary-light)' : 'var(--surface)', transition: 'all 0.2s' }}>
              <input type="radio" name="checkout_system" value="current" checked={checkoutSystem === 'current'} onChange={(e) => setCheckoutSystem(e.target.value)} style={{ marginTop: '3px' }} />
              <div>
                <strong style={{ display: 'block', color: 'var(--text)', marginBottom: '4px' }}>Sistem Toko</strong>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Data pesanan masuk ke dashboard Admin dan bisa dilacak pelanggan di halaman Riwayat Pesanan.</span>
              </div>
            </label>
          </div>

          {checkoutSystem === 'wa' && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>Nomor WhatsApp Admin</label>
              <input
                type="text"
                value={adminWhatsapp}
                onChange={(e) => setAdminWhatsapp(e.target.value)}
                required
                style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--border-strong)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' }}
              />
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Format: 08xxxxxxxxxx (tanpa spasi atau karakter khusus)</p>
            </div>
          )}

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
