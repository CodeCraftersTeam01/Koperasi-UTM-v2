import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { apiFetch, getApiUrl, AVATAR_IMG, extractApiErrorMessage } from '../../utils/api';
import { compressImage } from '../../utils/imageCompressor';

const ManagePengurus = () => {
  const [pengurusList, setPengurusList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Tambah Pengurus');
  const [editId, setEditId] = useState('');
  
  const [nama, setNama] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [level, setLevel] = useState(3);
  const [urutan, setUrutan] = useState(0);
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState('');
  const fileInputRef = useRef(null);

  const fetchPengurus = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/pengurus', { skipCache: true, cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setPengurusList(data || []);
        setSelectedIds([]);
      }
    } catch (err) {
      console.error('Error fetching pengurus:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPengurus();
  }, []);

  const getGrouped = () => {
    const groups = {
      ketua: [],
      pengawas: [],
      bph: [],
      divisi: [],
      manajer: []
    };
    pengurusList.forEach(p => {
      if (p.level === 1) {
        groups.ketua.push(p);
      } else if (p.level === 2) {
        if (/pengawas/i.test(p.jabatan)) {
          groups.pengawas.push(p);
        } else {
          groups.bph.push(p);
        }
      } else if (p.level === 3) {
        groups.divisi.push(p);
      } else if (p.level === 4) {
        groups.manajer.push(p);
      }
    });
    return groups;
  };

  const moveItem = async (id, direction) => {
    const item = pengurusList.find(p => p.id === id);
    if (!item) return;

    const isItemPengawas = item.level === 2 && /pengawas/i.test(item.jabatan);
    const sameGroup = pengurusList.filter(p => {
      if (item.level !== p.level) return false;
      if (item.level === 2) {
        const isPPengawas = /pengawas/i.test(p.jabatan);
        return isItemPengawas ? isPPengawas : !isPPengawas;
      }
      return true;
    }).sort((a, b) => a.urutan - b.urutan);

    const idx = sameGroup.findIndex(p => p.id === id);
    const target = idx + direction;
    if (target < 0 || target >= sameGroup.length) return;

    const swapped = [...sameGroup];
    [swapped[idx], swapped[target]] = [swapped[target], swapped[idx]];
    const updates = swapped.map((p, i) => ({ id: p.id, urutan: i }));

    try {
      const res = await apiFetch('/api/pengurus/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updates })
      });
      if (res.ok) fetchPengurus();
    } catch {
      window.Swal.fire('Gagal', 'Gagal mengubah urutan', 'error');
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    const result = await window.Swal.fire({
      title: 'Yakin ingin menghapus?',
      text: `${selectedIds.length} pengurus akan dihapus secara permanen.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6C757D',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });
    if (!result.isConfirmed) return;
    
    setIsBulkProcessing(true);
    try {
      const res = await apiFetch('/api/pengurus/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        setSelectedIds([]);
        fetchPengurus();
      } else {
        const data = await res.json();
        window.Swal.fire('Gagal', data.error || 'Gagal menghapus pengurus', 'error');
      }
    } catch (err) {
      window.Swal.fire('Koneksi Gagal', 'Pastikan server backend berjalan.', 'error');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleOpenTambahModal = () => {
    setModalTitle('Tambah Pengurus');
    setEditId('');
    setNama('');
    setJabatan('');
    setLevel(3);
    setUrutan(0);
    setFotoFile(null);
    setFotoPreview('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p) => {
    setModalTitle('Edit Pengurus');
    setEditId(p.id);
    setNama(p.nama);
    setJabatan(p.jabatan);
    setLevel(p.level);
    setUrutan(p.urutan);
    setFotoFile(null);
    setFotoPreview(p.foto ? getApiUrl(p.foto) : '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setFotoFile(compressed);
        setFotoPreview(URL.createObjectURL(compressed));
      } catch (err) {
        console.warn('Compress failed, fallback to original', err);
        setFotoFile(file);
        setFotoPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSimpan = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('nama', nama);
    fd.append('jabatan', jabatan);
    fd.append('level', level);
    fd.append('urutan', urutan);
    if (fotoFile) {
      fd.append('foto', fotoFile);
    }

    try {
      let res;
      if (editId) {
        res = await apiFetch(`/api/pengurus/${editId}`, {
          method: 'POST', // Use POST to support FormData upload with file payload
          body: fd
        });
      } else {
        res = await apiFetch('/api/pengurus', {
          method: 'POST',
          body: fd
        });
      }

      if (res.ok) {
        window.Swal.fire('Berhasil', 'Data pengurus berhasil disimpan', 'success');
        setIsModalOpen(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        fetchPengurus();
      } else {
        const errorMsg = await extractApiErrorMessage(res, 'Gagal menyimpan pengurus');
        window.Swal.fire('Gagal', errorMsg, 'error');
      }
    } catch (err) {
      console.error(err);
      window.Swal.fire('Koneksi Gagal', 'Pastikan koneksi internet stabil dan server backend berjalan.', 'error');
    }
  };

  const handleDelete = async (id) => {
    const confirm = await window.Swal.fire({
      title: 'Yakin ingin menghapus?',
      text: 'Pengurus yang dihapus tidak dapat dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6C757D',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });
    if (!confirm.isConfirmed) return;
    try {
      const res = await apiFetch(`/api/pengurus/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setPengurusList(prev => prev.filter(p => p.id !== id));
        window.Swal.fire('Berhasil', 'Pengurus berhasil dihapus', 'success');
        fetchPengurus();
      } else {
        const errorMsg = await extractApiErrorMessage(res, 'Gagal menghapus pengurus');
        window.Swal.fire('Gagal', errorMsg, 'error');
      }
    } catch (err) {
      window.Swal.fire('Koneksi Gagal', 'Pastikan server backend berjalan.', 'error');
    }
  };

  const renderSkeletonRows = () => (
    <>
      {[1, 2, 3].map((i) => (
        <tr key={i}>
          <td style={{ width: '40px' }}><input type="checkbox" disabled /></td>
          <td style={{ width: '50px' }}><div className="skeleton skeleton-text" style={{ width: '30px' }}></div></td>
          <td>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%' }}></div>
              <div className="skeleton skeleton-text" style={{ width: '120px' }}></div>
            </div>
          </td>
          <td><div className="skeleton skeleton-text" style={{ width: '100px' }}></div></td>
          <td><div className="skeleton" style={{ width: '60px', height: '28px', borderRadius: '4px' }}></div></td>
          <td>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div className="skeleton" style={{ width: '32px', height: '32px', borderRadius: '4px' }}></div>
              <div className="skeleton" style={{ width: '32px', height: '32px', borderRadius: '4px' }}></div>
            </div>
          </td>
        </tr>
      ))}
    </>
  );

  return (
    <AdminLayout title="Kelola Struktur Pengurus">
      <div className="admin-pengurus-wrap" style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '32px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
        
        {/* Header Actions */}
        <div className="admin-pengurus-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>Daftar Pengurus Koperasi UTM</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>Kelola posisi, level struktur, dan foto para pengurus koperasi</p>
          </div>
          <button onClick={handleOpenTambahModal} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-plus"></i> Tambah Pengurus
          </button>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--primary-light)', padding: '12px 24px', borderRadius: '12px', marginBottom: '20px', animation: 'fadeIn 0.3s' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary)' }}>
              {selectedIds.length} pengurus terpilih
            </span>
            <button 
              onClick={handleBulkDelete}
              disabled={isBulkProcessing}
              className="btn-outline" 
              style={{ padding: '6px 12px', fontSize: '13px', borderColor: '#dc3545', color: '#dc3545', backgroundColor: '#fff' }}
            >
              <i className="fas fa-trash"></i> Hapus Terpilih
            </button>
          </div>
        )}

        {/* Table / Grouped Display */}
        {loading ? (
          <div className="admin-table-wrap" style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '16px' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}><input type="checkbox" disabled /></th>
                  <th style={{ width: '50px' }}>No</th>
                  <th>Nama</th>
                  <th>Jabatan</th>
                  <th>Tingkat</th>
                  <th style={{ width: '80px' }}>Urut</th>
                  <th style={{ width: '150px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>{renderSkeletonRows()}</tbody>
            </table>
          </div>
        ) : pengurusList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '16px' }}>
            <i className="fas fa-sitemap" style={{ fontSize: '48px', opacity: 0.3, marginBottom: '16px' }}></i>
            <p>Belum ada data pengurus. Klik Tambah Pengurus untuk memulai.</p>
          </div>
        ) : (
          (() => {
            const groups = getGrouped();
            const levelMeta = {
              ketua: { label: 'Ketua Koperasi', icon: 'fa-crown', color: 'var(--primary, #00754a)', bg: 'rgba(15,81,50,0.06)' },
              pengawas: { label: 'Badan Pengawas', icon: 'fa-shield-alt', color: '#6f42c1', bg: 'rgba(111,66,193,0.06)' },
              bph: { label: 'Badan Pengurus Harian (BPH)', icon: 'fa-user-tie', color: '#0056b3', bg: 'rgba(0,123,255,0.06)' },
              divisi: { label: 'Divisi / Sie', icon: 'fa-users', color: '#495057', bg: 'rgba(108,117,125,0.06)' },
              manajer: { label: 'Manajer Operasional', icon: 'fa-briefcase', color: '#b45309', bg: 'rgba(217,119,6,0.06)' },
            };
            const groupOrder = ['ketua', 'pengawas', 'bph', 'divisi', 'manajer'];
            let globalIdx = 0;
            return groupOrder.map(groupKey => {
              const items = groups[groupKey] || [];
              const meta = levelMeta[groupKey];
              if (items.length === 0) return null;
              return (
                <div key={groupKey} style={{ marginBottom: '24px', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                  <div style={{ minWidth: '600px' }}>
                  <div style={{ padding: '14px 20px', background: meta.bg, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className={`fas ${meta.icon}`} style={{ color: meta.color, fontSize: '16px' }}></i>
                    <span style={{ fontWeight: 700, fontSize: '15px', color: meta.color }}>{meta.label}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)' }}>{items.length} orang</span>
                  </div>
                  <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <tbody>
                      {items.map((p, idx) => {
                        globalIdx++;
                        return (
                          <tr key={p.id}>
                            <td style={{ width: '40px', padding: '12px 8px' }}>
                              <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} />
                            </td>
                            <td style={{ width: '50px', padding: '12px 8px' }}>{idx + 1}</td>
                            <td style={{ padding: '12px 8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <img src={p.foto ? getApiUrl(p.foto) : AVATAR_IMG} alt={p.nama} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-strong)' }} onError={(e) => { e.target.src = AVATAR_IMG }} />
                                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{p.nama}</span>
                              </div>
                            </td>
                            <td style={{ padding: '12px 8px' }}>{p.jabatan}</td>
                            <td style={{ padding: '12px 8px' }}>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button type="button" onClick={() => moveItem(p.id, -1)} disabled={idx === 0} title="Naik" style={{ padding: '4px 7px', fontSize: '11px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.3 : 1, color: 'var(--text)' }}>
                                  <i className="fas fa-chevron-up"></i>
                                </button>
                                <button type="button" onClick={() => moveItem(p.id, 1)} disabled={idx === items.length - 1} title="Turun" style={{ padding: '4px 7px', fontSize: '11px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', cursor: idx === items.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === items.length - 1 ? 0.3 : 1, color: 'var(--text)' }}>
                                  <i className="fas fa-chevron-down"></i>
                                </button>
                              </div>
                            </td>
                            <td style={{ padding: '12px 8px' }}>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button onClick={() => handleOpenEditModal(p)} className="btn-outline btn-sm" style={{ padding: '6px 10px' }} title="Edit"><i className="fas fa-edit"></i></button>
                                <button onClick={() => handleDelete(p.id)} className="btn-outline btn-sm" style={{ padding: '6px 10px', color: '#dc3545', borderColor: 'rgba(220,53,69,0.2)' }} title="Hapus"><i className="fas fa-trash"></i></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  </div>
                  </div>
                </div>
              );
            });
          })()
        )}
      </div>

      {/* FORM MODAL */}
      {isModalOpen && (
        <div className="modal active">
          <div className="modal-overlay" onClick={handleCloseModal}></div>
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <button className="modal-close" onClick={handleCloseModal}><i className="fas fa-times"></i></button>
            <div style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '22px', color: 'var(--text)', marginBottom: '24px' }}>
                {modalTitle}
              </h3>
              <form onSubmit={handleSimpan}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>Nama Lengkap</label>
                  <input 
                    type="text" 
                    placeholder="Nama lengkap pengurus" 
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    required 
                    style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--border-strong)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>Jabatan</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Ketua, Pengawas, Sekretaris, Bendahara, Sie Usaha" 
                    value={jabatan}
                    onChange={(e) => setJabatan(e.target.value)}
                    required 
                    style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--border-strong)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>Tingkat (Struktur Tree)</label>
                    <select 
                      value={level}
                      onChange={(e) => setLevel(parseInt(e.target.value))}
                      style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--border-strong)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' }}
                    >
                      <option value={1}>Tingkat 1 - Ketua Koperasi</option>
                      <option value={2}>Tingkat 2 - Badan Pengawas / Pengurus Harian (BPH)</option>
                      <option value={3}>Tingkat 3 - Divisi / Sie</option>
                      <option value={4}>Tingkat 4 - Manajer Operasional</option>
                    </select>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                      *Jabatan dengan kata "Pengawas" otomatis masuk ke seksi Badan Pengawas.
                    </p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>Urutan Tampilan</label>
                    <input 
                      type="number" 
                      min="0"
                      value={urutan}
                      onChange={(e) => setUrutan(parseInt(e.target.value) || 0)}
                      required 
                      style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--border-strong)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>Foto Pengurus</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {fotoPreview ? (
                        <img src={fotoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <i className="fas fa-user" style={{ fontSize: '24px', color: 'var(--text-muted)' }}></i>
                      )}
                    </div>
                    <div>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ fontSize: '13px' }}
                      />
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 0' }}>Ukuran maks 5MB, format JPG/PNG/WEBP (otomatis dioptimasi)</p>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" onClick={handleCloseModal} className="btn-outline" style={{ padding: '10px 20px' }}>Batal</button>
                  <button type="submit" className="btn-primary" style={{ padding: '10px 24px' }}>Simpan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManagePengurus;
