import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { apiFetch, getApiUrl } from '../../utils/api';

const ManageProduk = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Tambah Produk');
  const [editId, setEditId] = useState('');

  // Dynamic Kategori
  const [kategoriList, setKategoriList] = useState([]);
  const [subkategoriList, setSubkategoriList] = useState([]);
  
  // Form Fields State
  const [nama, setNama] = useState('');
  const [harga, setHarga] = useState('');
  const [tag, setTag] = useState('');
  const [kategori, setKategori] = useState('');
  const [subkategori, setSubkategori] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [gambarFile, setGambarFile] = useState(null);
  const [gambarPreview, setGambarPreview] = useState('');

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/api/produk';
      if (searchQuery) {
        url += `?search=${encodeURIComponent(searchQuery)}`;
      } else {
        url += `?page=${currentPage}&per_page=7`;
      }

      const res = await apiFetch(url);
      const data = await res.json();
      
      if (searchQuery) {
        setProducts(data.data || []);
        setTotalItems(data.total || 0);
        setTotalPages(1);
      } else {
        setProducts(data.data || []);
        setTotalItems(data.total || 0);
        setTotalPages(data.total_pages || 1);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchKategoris = async () => {
    try {
      const res = await apiFetch('/api/kategori');
      if (res.ok) {
        const data = await res.json();
        setKategoriList(data.filter(k => k.tipe === 'utama'));
        setSubkategoriList(data.filter(k => k.tipe === 'sub'));
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchKategoris();
    setSelectedIds([]); // Reset selection when page/search changes
  }, [currentPage, searchQuery]);

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(products.map(p => p.id));
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
    if (!window.confirm(`Yakin ingin menghapus ${selectedIds.length} produk terpilih?`)) return;
    
    setIsBulkProcessing(true);
    try {
      const res = await apiFetch('/api/produk/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.status === 200) {
        setSelectedIds([]);
        fetchProducts();
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal menghapus produk');
      }
    } catch (err) {
      alert('Koneksi gagal');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Handle edit query param if redirected from dashboard
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const editIdParam = params.get('edit');
    if (editIdParam) {
      handleEditProduk(editIdParam);
      // Clean query params
      navigate('/admin/produk', { replace: true });
    }
  }, [location.search]);

  const handleOpenTambahModal = () => {
    setModalTitle('Tambah Produk');
    setEditId('');
    setNama('');
    setHarga('');
    setTag('');
    setKategori('');
    setSubkategori('');
    setDeskripsi('');
    setGambarFile(null);
    setGambarPreview('');
    setIsModalOpen(true);
    document.body.classList.add('no-scroll');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    document.body.classList.remove('no-scroll');
  };

  const handleEditProduk = async (id) => {
    try {
      // Find product
      const res = await apiFetch(`/api/produk`);
      const allProducts = await res.json();
      const list = Array.isArray(allProducts) ? allProducts : (allProducts.data || []);
      const p = list.find((prod) => prod.id == id);
      
      if (!p) return;

      setModalTitle('Edit Produk');
      setEditId(p.id);
      setNama(p.nama);
      setHarga(p.harga);
      setTag(p.tag || '');
      setKategori(p.kategori);
      setSubkategori(p.subkategori || '');
      setDeskripsi(p.deskripsi || '');
      setGambarFile(null);
      setGambarPreview(p.gambar ? getApiUrl(p.gambar) : '');
      setIsModalOpen(true);
      document.body.classList.add('no-scroll');
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGambarFile(file);
      setGambarPreview(URL.createObjectURL(file));
    }
  };

  const handleSimpanProduk = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append('nama', nama);
    fd.append('harga', harga);
    fd.append('tag', tag);
    fd.append('kategori', kategori);
    fd.append('subkategori', subkategori);
    fd.append('deskripsi', deskripsi);
    
    if (gambarFile) {
      fd.append('gambar', gambarFile);
    }

    try {
      let response;
      if (editId) {
        response = await apiFetch(`/api/produk/${editId}`, {
          method: 'POST', // POST is used for file upload compatibility in PHP/Lumen
          body: fd,
        });
      } else {
        response = await apiFetch('/api/produk', {
          method: 'POST',
          body: fd,
        });
      }

      const result = await response.json();
      if (response.status === 200 || response.status === 201) {
        if (window.Swal) {
          window.Swal.fire('Berhasil', result.message, 'success');
        } else {
          alert(result.message);
        }
        handleCloseModal();
        fetchProducts();
      } else {
        if (window.Swal) {
          window.Swal.fire('Gagal', result.error || 'Terjadi kesalahan', 'error');
        } else {
          alert(result.error || 'Terjadi kesalahan');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Koneksi gagal');
    }
  };

  const handleArsipProduk = (id, currentArsip) => {
    const newArsip = currentArsip ? 0 : 1;
    const label = newArsip ? 'nonaktifkan' : 'aktifkan';
    const labelTitle = newArsip ? 'Nonaktifkan' : 'Aktifkan';

    const action = async () => {
      try {
        const res = await apiFetch(`/api/produk/${id}/archive`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ arsip: newArsip }),
        });
        if (!res.ok) {
          let msg;
          try {
            const err = await res.json();
            msg = err.error || err.message || `HTTP ${res.status}`;
          } catch {
            msg = await res.text().catch(() => `HTTP ${res.status}`);
          }
          throw new Error(msg);
        }
        if (window.Swal) {
          window.Swal.fire('Berhasil!', `Produk berhasil di${label}.`, 'success');
        }
        fetchProducts();
      } catch (err) {
        if (window.Swal) {
          window.Swal.fire('Gagal', err.message, 'error');
        } else {
          alert(err.message);
        }
      }
    };

    if (window.Swal) {
      window.Swal.fire({
        title: `${labelTitle} produk ini?`,
        text: `Produk akan di${label}. Produk ${newArsip ? 'tidak akan' : 'akan'} muncul di halaman utama.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: newArsip ? '#6C757D' : '#0F5132',
        cancelButtonColor: '#6C757D',
        confirmButtonText: `Ya, ${label}!`,
        cancelButtonText: 'Batal'
      }).then((result) => {
        if (result.isConfirmed) action();
      });
    } else if (window.confirm(`Yakin ingin meng${label} produk ini?`)) {
      action();
    }
  };

  const handleHapusProduk = (id) => {
    if (window.Swal) {
      window.Swal.fire({
        title: 'Yakin ingin menghapus?',
        text: 'Data yang dihapus tidak dapat dikembalikan!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6C757D',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
      }).then(async (result) => {
        if (result.isConfirmed) {
          await apiFetch(`/api/produk/${id}`, {
            method: 'DELETE',
          });
          window.Swal.fire('Terhapus!', 'Produk berhasil dihapus.', 'success');
          fetchProducts();
        }
      });
    } else {
      if (window.confirm('Yakin ingin menghapus produk ini?')) {
        apiFetch(`/api/produk/${id}`, {
          method: 'DELETE',
        }).then(() => fetchProducts());
      }
    }
  };

  const renderSkeletonRows = () => (
    <>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <tr key={i}>
          <td><input type="checkbox" disabled /></td>
          <td><div className="skeleton skeleton-img"></div></td>
          <td>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text short"></div>
          </td>
          <td><div className="skeleton skeleton-badge"></div></td>
          <td><div className="skeleton skeleton-text short"></div></td>
          <td><div className="skeleton skeleton-text short"></div></td>
          <td><div className="skeleton skeleton-badge"></div></td>
          <td><div className="skeleton skeleton-btn"></div></td>
        </tr>
      ))}
    </>
  );

  return (
    <AdminLayout title="Kelola Produk">
      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h3><i className="fas fa-box" style={{ color: 'var(--primary)', marginRight: '8px' }}></i> Daftar Produk</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn-primary btn-sm" onClick={handleOpenTambahModal}>
              <i className="fas fa-plus"></i> Tambah Produk
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <input 
            type="text" 
            placeholder="Cari produk..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: '100%', maxWidth: '360px', padding: '10px 16px', border: '2px solid var(--border)', borderRadius: '100px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' }}
          />
        </div>

        {selectedIds.length > 0 && (
          <div style={{ background: 'rgba(15, 81, 50, 0.1)', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '14px' }}>{selectedIds.length} produk terpilih</span>
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
                    checked={products.length > 0 && selectedIds.length === products.length}
                  />
                </th>
                <th>Foto</th>
                <th>Nama Produk</th>
                <th>Kategori</th>
                <th>Harga</th>
                <th>Tag</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? renderSkeletonRows() : products.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Tidak ada produk</td>
                </tr>
              ) : (
                products.map((p) => {
                  const badgeClass = p.kategori === 'Konsinyasi' ? 'badge-premium' : p.kategori === 'Lainnya' ? 'badge-accent' : 'badge-primary';
                  
                  return (
                    <tr key={p.id}>
                      <td>
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(p.id)}
                          onChange={() => toggleSelect(p.id)}
                        />
                      </td>
                      <td>
                        {p.gambar ? (
                          <img 
                            src={getApiUrl(p.gambar)} 
                            style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }} 
                            alt={p.nama} 
                          />
                        ) : (
                          <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                            <i className="fas fa-box"></i>
                          </div>
                        )}
                      </td>
                      <td><strong>{p.nama}</strong></td>
                      <td>
                        <span className={`badge ${badgeClass}`}>
                          {p.kategori}{p.subkategori ? ' — ' + p.subkategori : ''}
                        </span>
                      </td>
                      <td>Rp {p.harga.toLocaleString()}</td>
                      <td>
                        {p.tag ? (
                          <span className={`tag-badge tag-${p.tag.toLowerCase().replace(/\s+/g, '-')}`}>
                            {p.tag}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>
                        )}
                      </td>
                      <td>
                        {p.arsip ? (
                          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                            <i className="fas fa-minus-circle"></i> Non Aktif
                          </span>
                        ) : (
                          <span style={{ color: 'var(--primary)', fontSize: '13px' }}>
                            <i className="fas fa-check-circle"></i> Aktif
                          </span>
                        )}
                      </td>
                      <td>
                        <button 
                          className="admin-btn-sm admin-btn-edit" 
                          onClick={() => handleEditProduk(p.id)}
                          title="Edit"
                          style={{ marginRight: '4px' }}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className={`admin-btn-sm ${p.arsip ? 'admin-btn-edit' : 'admin-btn-delete'}`} 
                          onClick={() => handleArsipProduk(p.id, p.arsip)}
                          title={p.arsip ? 'Aktifkan' : 'Nonaktifkan'}
                          style={{ marginRight: '4px' }}
                        >
                          <i className={`fas ${p.arsip ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                        </button>
                        <button 
                          className="admin-btn-sm admin-btn-delete" 
                          onClick={() => handleHapusProduk(p.id)}
                          title="Hapus"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!searchQuery && totalPages > 1 && (
          <div id="pagination-wrap" style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '20px', flexWrap: 'wrap' }}>
            {currentPage > 1 && (
              <button className="btn-outline btn-sm" onClick={() => setCurrentPage(currentPage - 1)}>
                <i className="fas fa-chevron-left"></i>
              </button>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button 
                key={page}
                className={`btn-${page === currentPage ? 'primary' : 'outline'} btn-sm`} 
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            {currentPage < totalPages && (
              <button className="btn-outline btn-sm" onClick={() => setCurrentPage(currentPage + 1)}>
                <i className="fas fa-chevron-right"></i>
              </button>
            )}
          </div>
        )}
      </div>

      {/* FORM MODAL */}
      {isModalOpen && (
        <div id="modal-produk" className="modal active">
          <div className="modal-overlay" onClick={handleCloseModal}></div>
          <div className="modal-content" style={{ maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="modal-close" onClick={handleCloseModal}><i className="fas fa-times"></i></button>
            <div style={{ padding: '32px' }}>
              <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '22px', color: 'var(--text)', marginBottom: '20px' }}>
                {modalTitle}
              </h3>
              <form onSubmit={handleSimpanProduk}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>Nama Produk</label>
                    <input 
                      type="text" 
                      placeholder="Nama produk" 
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      required 
                      style={{ width: '100%', padding: '11px 14px', border: '2px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>Harga</label>
                    <input 
                      type="number" 
                      placeholder="Harga" 
                      value={harga}
                      onChange={(e) => setHarga(e.target.value)}
                      required 
                      min="0" 
                      style={{ width: '100%', padding: '11px 14px', border: '2px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>Tag</label>
                    <select 
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', border: '2px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' }}
                    >
                      <option value="">— Tidak ada —</option>
                      <option value="Best Seller">Best Seller</option>
                      <option value="New">New</option>
                      <option value="Promo">Promo</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>Kategori</label>
                    <select 
                      value={kategori}
                      onChange={(e) => setKategori(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', border: '2px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' }}
                    >
                      <option value="">— Pilih Kategori —</option>
                      {kategoriList.map(k => (
                        <option key={k.id} value={k.nama}>{k.nama}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>Subkategori</label>
                    <select 
                      value={subkategori}
                      onChange={(e) => setSubkategori(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', border: '2px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' }}
                    >
                      <option value="">— Pilih Subkategori —</option>
                      {(() => {
                        const selectedMain = kategoriList.find(k => k.nama === kategori);
                        const filtered = selectedMain
                          ? subkategoriList.filter(s => s.parent_id === selectedMain.id)
                          : [];
                        return filtered.map(k => (
                          <option key={k.id} value={k.nama}>{k.nama}</option>
                        ));
                      })()}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>Foto Produk</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      style={{ width: '100%', padding: '8px 14px', border: '2px solid var(--border)', borderRadius: '8px', fontSize: '13px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' }}
                    />
                    {gambarPreview && (
                      <div style={{ marginTop: '8px' }}>
                        <img 
                          src={gambarPreview} 
                          style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border)' }} 
                          alt="Preview"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>Deskripsi</label>
                  <textarea 
                    rows="3" 
                    placeholder="Deskripsi produk" 
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', border: '2px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'vertical', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' }}
                  ></textarea>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}><i className="fas fa-save"></i> Simpan</button>
                  <button type="button" className="btn-outline" onClick={handleCloseModal} style={{ justifyContent: 'center' }}>Batal</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManageProduk;
