import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { apiFetch } from '../../utils/api';

const ICON_OPTIONS = [
  'fa-shopping-bag', 'fa-handshake', 'fa-coffee', 'fa-box', 'fa-tags',
  'fa-tshirt', 'fa-laptop', 'fa-mobile-alt', 'fa-utensils', 'fa-book',
  'fa-gem', 'fa-leaf', 'fa-cogs', 'fa-star', 'fa-heart',
  'fa-bolt', 'fa-certificate', 'fa-trophy', 'fa-gift', 'fa-store',
];

const DEFAULT_ICONS = {
  'Retail': 'fa-shopping-bag',
  'Konsinyasi': 'fa-handshake',
  'Cafe': 'fa-coffee',
};

const ManageSettingsKategori = () => {
  const [kategoris, setKategoris] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [katRes, setRes] = await Promise.all([
          apiFetch('/api/kategori'),
          apiFetch('/api/settings'),
        ]);

        let kategoriData = [];
        if (katRes.ok) {
          const data = await katRes.json();
          kategoriData = (data || []).filter(k => k.tipe === 'utama');
        }
        setKategoris(kategoriData);

        if (setRes.ok) {
          const setData = await setRes.json();
          if (setData.kategori_tampil) {
            try {
              setSelected(JSON.parse(setData.kategori_tampil));
            } catch {
              setSelected(kategoriData.map(k => ({
                id: k.id,
                nama: k.nama,
                icon: DEFAULT_ICONS[k.nama] || 'fa-tag',
              })));
            }
          } else {
            setSelected(kategoriData.map(k => ({
              id: k.id,
              nama: k.nama,
              icon: DEFAULT_ICONS[k.nama] || 'fa-tag',
            })));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleCategory = (kat) => {
    setSelected(prev => {
      const exists = prev.find(s => s.id === kat.id);
      if (exists) {
        return prev.filter(s => s.id !== kat.id);
      }
      const defaultDesc = {
        'Retail': 'Produk kebutuhan sehari-hari seperti makanan ringan, minuman, dan perlengkapan kuliah yang tersedia langsung.',
        'Konsinyasi': 'Produk titipan UMKM dan mitra lokal Madura, mendukung ekonomi kreatif mahasiswa dan masyarakat sekitar.',
        'Cafe': 'Menu kopi, minuman kekinian, dan cemilan ringan yang tersedia di area kampus.',
      };
      return [...prev, { id: kat.id, nama: kat.nama, icon: DEFAULT_ICONS[kat.nama] || 'fa-tag', deskripsi: defaultDesc[kat.nama] || '' }];
    });
  };

  const setIcon = (id, icon) => {
    setSelected(prev => prev.map(s => s.id === id ? { ...s, icon } : s));
  };

  const setDeskripsi = (id, deskripsi) => {
    setSelected(prev => prev.map(s => s.id === id ? { ...s, deskripsi } : s));
  };

  const moveItem = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= selected.length) return;
    setSelected(prev => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiFetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: { kategori_tampil: JSON.stringify(selected) }
        }),
      });
      if (res.ok) {
        window.Swal.fire('Berhasil', 'Setelan kategori berhasil disimpan', 'success');
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
      <AdminLayout title="Setelan Kategori Landing Page">
        <div className="admin-card" style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '32px', border: '1px solid var(--border)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Memuat kategori...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Setelan Kategori Landing Page">
      <div style={{ paddingBottom: '40px' }}>
        <form className="admin-card" onSubmit={handleSubmit} style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '32px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', margin: '0 0 20px 0', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
            <i className="fas fa-th-large" style={{ color: 'var(--primary)', marginRight: '8px' }}></i> Kategori yang Ditampilkan di Landing Page
          </h3>

          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Centang kategori yang ingin ditampilkan di halaman utama. Atur urutan, ikon, dan deskripsi untuk setiap kategori.
          </p>

          {kategoris.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
              Belum ada kategori utama. Silakan tambah kategori terlebih dahulu.
            </p>
          ) : (
            <div className="admin-settings-items" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {kategoris.map((kat) => {
                const isSelected = selected.find(s => s.id === kat.id);
                const selIndex = selected.findIndex(s => s.id === kat.id);
                return (
                  <div key={kat.id} style={{ background: 'var(--surface)', borderRadius: '14px', border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)', padding: '16px', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <input
                        type="checkbox"
                        checked={!!isSelected}
                        onChange={() => toggleCategory(kat)}
                        style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                      />
                      <div style={{ flex: 1, fontWeight: 600, color: isSelected ? 'var(--text)' : 'var(--text-muted)', fontSize: '15px' }}>
                        <i className={`fas ${isSelected ? isSelected.icon : 'fa-tag'}`} style={{ marginRight: '8px', color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }}></i>
                        {kat.nama}
                      </div>
                      {isSelected && (
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <button type="button" onClick={() => moveItem(selIndex, -1)} disabled={selIndex === 0} title="Naikkan urutan" style={{ padding: '6px 10px', fontSize: '12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', cursor: selIndex === 0 ? 'not-allowed' : 'pointer', opacity: selIndex === 0 ? 0.3 : 1, color: 'var(--text)' }}>
                            <i className="fas fa-chevron-up"></i>
                          </button>
                          <button type="button" onClick={() => moveItem(selIndex, 1)} disabled={selIndex === selected.length - 1} title="Turunkan urutan" style={{ padding: '6px 10px', fontSize: '12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', cursor: selIndex === selected.length - 1 ? 'not-allowed' : 'pointer', opacity: selIndex === selected.length - 1 ? 0.3 : 1, color: 'var(--text)' }}>
                            <i className="fas fa-chevron-down"></i>
                          </button>
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ flex: '1 1 200px' }}>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Ikon</label>
                          <select
                            value={isSelected.icon}
                            onChange={(e) => setIcon(kat.id, e.target.value)}
                            style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border-strong)', borderRadius: '8px', fontSize: '13px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' }}
                          >
                            {ICON_OPTIONS.map(ico => (
                              <option key={ico} value={ico}>{ico.replace('fa-', '')}</option>
                            ))}
                          </select>
                        </div>
                        <div style={{ flex: '2 1 300px' }}>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Deskripsi</label>
                          <textarea
                            value={isSelected.deskripsi || ''}
                            onChange={(e) => setDeskripsi(kat.id, e.target.value)}
                            placeholder="Tulis deskripsi kategori..."
                            rows={2}
                            style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border-strong)', borderRadius: '8px', fontSize: '13px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="submit" className="btn-primary" disabled={saving} style={{ padding: '10px 24px', fontSize: '14px', fontWeight: 600 }}>
              {saving ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Menyimpan...</> : <><i className="fas fa-save" style={{ marginRight: '8px' }}></i> Simpan Setelan Kategori</>}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default ManageSettingsKategori;
