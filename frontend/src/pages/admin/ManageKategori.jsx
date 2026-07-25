import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { apiFetch } from '../../utils/api';

const ManageKategori = () => {
  const [kategoris, setKategoris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const utamaList = kategoris.filter(k => k.tipe === 'utama');

  const fetchKategoris = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/kategori');
      const data = await res.json();
      setKategoris(data || []);
      setSelectedIds([]);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKategoris();
  }, []);

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(kategoris.map(k => k.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Yakin ingin menghapus ${selectedIds.length} kategori terpilih?`)) return;
    
    setIsBulkProcessing(true);
    try {
      const res = await apiFetch('/api/kategori/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        setSelectedIds([]);
        fetchKategoris();
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal menghapus kategori');
      }
    } catch (err) {
      alert('Koneksi gagal');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const getParentOptionsHtml = (selectedId) => {
    return utamaList.map(k =>
      `<option value="${k.id}" ${k.id === selectedId ? 'selected' : ''}>${k.nama}</option>`
    ).join('');
  };

  const showTambahForm = (editData) => {
    const isEdit = !!editData;
    const title = isEdit ? 'Edit Kategori' : 'Tambah Kategori';
    const parentOptions = getParentOptionsHtml(isEdit ? editData.parent_id : '');

    window.Swal.fire({
      title,
      html: `
        <input id="swal-nama" class="swal2-input" placeholder="Nama kategori" value="${isEdit ? editData.nama : ''}" style="box-sizing:border-box">
        <select id="swal-tipe" class="swal2-input" style="padding:10px; box-sizing:border-box" onchange="document.getElementById('swal-parent-wrap').style.display=this.value==='sub'?'':'none'">
          <option value="utama" ${isEdit && editData.tipe === 'utama' ? 'selected' : ''}>Kategori Utama</option>
          <option value="sub" ${isEdit && editData.tipe === 'sub' ? 'selected' : ''}>Subkategori</option>
        </select>
        <div id="swal-parent-wrap" style="${isEdit && editData.tipe === 'sub' ? '' : 'display:none'}; margin-top:8px">
          <select id="swal-parent_id" class="swal2-input" style="padding:10px; box-sizing:border-box">
            <option value="">— Pilih Induk —</option>
            ${parentOptions}
          </select>
        </div>
      `,
      confirmButtonText: 'Simpan',
      showCancelButton: true,
      cancelButtonText: 'Batal',
      confirmButtonColor: '#0F5132',
      cancelButtonColor: '#6C757D',
      didOpen: () => {
        const tipeEl = document.getElementById('swal-tipe');
        const parentWrap = document.getElementById('swal-parent-wrap');
        tipeEl.addEventListener('change', () => {
          parentWrap.style.display = tipeEl.value === 'sub' ? '' : 'none';
        });
      },
      preConfirm: () => {
        const nama = document.getElementById('swal-nama').value;
        if (!nama) {
          window.Swal.showValidationMessage('Nama kategori harus diisi');
          return false;
        }
        const tipe = document.getElementById('swal-tipe').value;
        const parent_id = tipe === 'sub' ? document.getElementById('swal-parent_id').value : null;
        return { nama, tipe, parent_id: parent_id || null };
      }
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit ? `/api/kategori/${editData.id}` : '/api/kategori';
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(result.value),
      });
      const data = await res.json();
      window.Swal.fire('Berhasil!', data.message || 'Kategori berhasil disimpan.', 'success');
      fetchKategoris();
    });
  };

  const handleHapusKategori = (id) => {
    if (window.Swal) {
      window.Swal.fire({
        title: 'Yakin ingin menghapus?',
        text: 'Kategori yang dihapus tidak dapat dikembalikan!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6C757D',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
      }).then(async (result) => {
        if (result.isConfirmed) {
          const res = await apiFetch(`/api/kategori/${id}`, {
            method: 'DELETE',
          });
          const data = await res.json();
          window.Swal.fire('Terhapus!', data.message || 'Kategori berhasil dihapus.', 'success');
          fetchKategoris();
        }
      });
    } else {
      if (window.confirm('Yakin ingin menghapus kategori ini?')) {
        apiFetch(`/api/kategori/${id}`, {
          method: 'DELETE',
        }).then(() => fetchKategoris());
      }
    }
  };

  const renderKategoriRows = () => {
    const childrenMap = {};
    const utamaKategoris = [];

    kategoris.forEach(k => {
      if (k.tipe === 'utama') {
        utamaKategoris.push(k);
        childrenMap[k.id] = [];
      }
    });
    kategoris.forEach(k => {
      if (k.tipe === 'sub' && k.parent_id && childrenMap[k.parent_id]) {
        childrenMap[k.parent_id].push(k);
      }
    });

    Object.values(childrenMap).forEach(arr => arr.sort((a, b) => a.id - b.id));
    utamaKategoris.sort((a, b) => a.id - b.id);

    const orphanSubs = kategoris.filter(
      k => k.tipe === 'sub' && (!k.parent_id || !childrenMap[k.parent_id])
    );

    let idx = 0;
    const rows = [];

    utamaKategoris.forEach(parent => {
      idx++;
      rows.push(
        <tr key={parent.id}>
          <td><input type="checkbox" checked={selectedIds.includes(parent.id)} onChange={() => toggleSelect(parent.id)} /></td>
          <td>{idx}</td>
          <td><strong>{parent.nama}</strong></td>
          <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}><span style={{ color: 'transparent' }}>—</span></td>
          <td><span className="badge badge-primary">Kategori Utama</span></td>
          <td>
            <button className="admin-btn-sm admin-btn-edit" onClick={() => showTambahForm({ id: parent.id, nama: parent.nama, tipe: parent.tipe, parent_id: parent.parent_id })} title="Edit" style={{ marginRight: '4px' }}><i className="fas fa-edit"></i></button>
            <button className="admin-btn-sm admin-btn-delete" onClick={() => handleHapusKategori(parent.id)} title="Hapus"><i className="fas fa-trash"></i></button>
          </td>
        </tr>
      );

      childrenMap[parent.id].forEach(child => {
        idx++;
        rows.push(
          <tr key={child.id} style={{ background: 'rgba(15,81,50,0.03)' }}>
            <td><input type="checkbox" checked={selectedIds.includes(child.id)} onChange={() => toggleSelect(child.id)} /></td>
            <td>{idx}</td>
            <td>
              <strong style={{ marginLeft: '28px' }}>
                <i className="fas fa-level-down-alt" style={{ marginRight: '8px', color: 'var(--text-muted)', fontSize: '11px', transform: 'rotate(90deg)' }}></i>
                {child.nama}
              </strong>
            </td>
            <td style={{ color: 'var(--primary)', fontSize: '13px' }}>{parent.nama}</td>
            <td><span className="badge badge-accent">Subkategori</span></td>
            <td>
              <button className="admin-btn-sm admin-btn-edit" onClick={() => showTambahForm({ id: child.id, nama: child.nama, tipe: child.tipe, parent_id: child.parent_id })} title="Edit" style={{ marginRight: '4px' }}><i className="fas fa-edit"></i></button>
              <button className="admin-btn-sm admin-btn-delete" onClick={() => handleHapusKategori(child.id)} title="Hapus"><i className="fas fa-trash"></i></button>
            </td>
          </tr>
        );
      });
    });

    orphanSubs.forEach(k => {
      idx++;
      rows.push(
        <tr key={k.id} style={{ background: 'rgba(255,193,7,0.05)' }}>
          <td><input type="checkbox" checked={selectedIds.includes(k.id)} onChange={() => toggleSelect(k.id)} /></td>
          <td>{idx}</td>
          <td>
            <strong style={{ marginLeft: '28px' }}>
              <i className="fas fa-exclamation-triangle" style={{ marginRight: '8px', color: '#ffc107', fontSize: '11px' }}></i>
              {k.nama}
            </strong>
          </td>
          <td style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>Tanpa induk</td>
          <td><span className="badge badge-accent">Subkategori</span></td>
          <td>
            <button className="admin-btn-sm admin-btn-edit" onClick={() => showTambahForm({ id: k.id, nama: k.nama, tipe: k.tipe, parent_id: k.parent_id })} title="Edit" style={{ marginRight: '4px' }}><i className="fas fa-edit"></i></button>
            <button className="admin-btn-sm admin-btn-delete" onClick={() => handleHapusKategori(k.id)} title="Hapus"><i className="fas fa-trash"></i></button>
          </td>
        </tr>
      );
    });

    return rows;
  };

  const renderSkeletonRows = () => (
    <>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <tr key={i}>
          <td><input type="checkbox" disabled /></td>
          <td><div className="skeleton skeleton-text short"></div></td>
          <td><div className="skeleton skeleton-text"></div></td>
          <td><div className="skeleton skeleton-badge"></div></td>
          <td><div className="skeleton skeleton-btn"></div></td>
        </tr>
      ))}
    </>
  );

  return (
    <AdminLayout title="Kelola Kategori">
      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h3><i className="fas fa-tags" style={{ color: 'var(--primary)', marginRight: '8px' }}></i> Daftar Kategori</h3>
          <button className="btn-primary btn-sm" onClick={() => showTambahForm(null)}>
            <i className="fas fa-plus"></i> Tambah Kategori
          </button>
        </div>

        {selectedIds.length > 0 && (
          <div style={{ background: 'rgba(15, 81, 50, 0.1)', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '14px' }}>{selectedIds.length} kategori terpilih</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn-primary btn-sm" 
                onClick={handleBulkDelete} 
                disabled={isBulkProcessing}
                style={{ background: '#dc3545' }}
              >
                {isBulkProcessing ? 'Memproses...' : <><i className="fas fa-trash"></i> Hapus</>}
              </button>
            </div>
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input 
                    type="checkbox" 
                    onChange={toggleSelectAll} 
                    checked={kategoris.length > 0 && selectedIds.length === kategoris.length}
                  />
                </th>
                <th>No</th>
                <th>Nama Kategori</th>
                <th>Induk</th>
                <th>Tipe</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? renderSkeletonRows() : kategoris.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Tidak ada kategori</td>
                </tr>
              ) : renderKategoriRows()}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageKategori;
