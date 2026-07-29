import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { apiFetch, getApiUrl } from '../utils/api';
import { useCart } from '../context/CartContext';
import { playFlyToCartAnimation } from '../utils/animation';
import LazyImage from '../components/LazyImage';

const Catalog = () => {
  const { addToCart, openCart } = useCart();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleAddToCart = (e, product, qty = 1) => {
    const imgUrl = product.gambar ? getApiUrl(product.gambar) : '';
    playFlyToCartAnimation(e.currentTarget, imgUrl);
    addToCart(product, qty);
  };

  // Filter and Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState('Semua Produk');
  const [currentSubFilter, setCurrentSubFilter] = useState('Semua');
  const [currentSort, setCurrentSort] = useState('terbaru');

  // Build filter tree from categories
  const filterTree = useMemo(() => {
    const utama = categories.filter(c => c.tipe === 'utama');
    return utama.map(u => ({
      ...u,
      children: categories.filter(c => c.parent_id === u.id),
    }));
  }, [categories]);

  const utamaNames = useMemo(() => filterTree.map(f => f.nama), [filterTree]);

  // Custom Select dropdown toggle states
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState({});

  // Modal detail states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalQty, setModalQty] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filterParam = params.get('filter');
    if (filterParam && utamaNames.includes(filterParam)) {
      setCurrentFilter(filterParam);
      setCurrentSubFilter('Semua');
    }
  }, [location.search, utamaNames]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          apiFetch('/api/produk?arsip=0'),
          apiFetch('/api/kategori'),
        ]);
        if (prodRes.ok) {
          const data = await prodRes.json();
          setProducts(Array.isArray(data) ? data : (data.data || []));
        }
        if (catRes.ok) {
          const data = await catRes.json();
          setCategories(data || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Reset filter dropdown state when filterTree changes
  useEffect(() => {
    const state = {};
    filterTree.forEach(f => { state[f.nama] = false; });
    setIsFilterOpen(state);
  }, [filterTree]);

  // Handle outside click to close custom dropdowns
  useEffect(() => {
    const handleOutsideClick = () => {
      setIsSortOpen(false);
      setIsFilterOpen(prev => { const next = {}; Object.keys(prev).forEach(k => { next[k] = false; }); return next; });
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleFilterClick = (filter) => {
    setCurrentFilter(filter);
    setCurrentSubFilter('Semua');
  };

  const handleSubFilterSelect = (category, subCategory) => {
    setCurrentFilter(category);
    setCurrentSubFilter(subCategory);
  };

  const toggleFilter = (name) => {
    setIsFilterOpen(prev => {
      const next = {};
      Object.keys(prev).forEach(k => { next[k] = false; });
      next[name] = !prev[name];
      return next;
    });
    setIsSortOpen(false);
  };

  // Perform search, filtering, and sorting
  let filtered = [...products];

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.nama.toLowerCase().includes(q) ||
        p.deskripsi.toLowerCase().includes(q) ||
        p.kategori.toLowerCase().includes(q)
    );
  }

  if (currentFilter !== 'Semua Produk') {
    if (currentSubFilter !== 'Semua') {
      filtered = filtered.filter(
        (p) => p.kategori === currentFilter && p.subkategori === currentSubFilter
      );
    } else {
      filtered = filtered.filter((p) => p.kategori === currentFilter);
    }
  }

  switch (currentSort) {
    case 'nama-asc':
      filtered.sort((a, b) => a.nama.localeCompare(b.nama));
      break;
    case 'nama-desc':
      filtered.sort((a, b) => b.nama.localeCompare(a.nama));
      break;
    case 'harga-termurah':
      filtered.sort((a, b) => a.harga - b.harga);
      break;
    case 'harga-tertinggi':
      filtered.sort((a, b) => b.harga - a.harga);
      break;
    default:
      filtered.sort((a, b) => b.id - a.id); // newest by ID desc
      break;
  }

  const getSortLabel = () => {
    switch (currentSort) {
      case 'nama-asc': return 'Nama A-Z';
      case 'nama-desc': return 'Nama Z-A';
      case 'harga-termurah': return 'Harga Termurah';
      case 'harga-tertinggi': return 'Harga Tertinggi';
      default: return 'Terbaru';
    }
  };

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setModalQty(1);
    document.body.classList.add('no-scroll');
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    document.body.classList.remove('no-scroll');
  };

  return (
    <>
      {/* PAGE HERO */}
      <section className="page-hero">
        <div className="container">
          <h1>Katalog Produk</h1>
          <p>Temukan kebutuhan Anda di Koperasi UTM</p>
          <div className="breadcrumb">
            <span>Beranda</span>
            <i className="fas fa-chevron-right"></i>
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Katalog</span>
          </div>
        </div>
      </section>

      {/* CATALOG */}
      <section className="catalog-page">
        <div className="container">
          {/* TOOLBAR */}
          <div className="catalog-toolbar">
            <div className="catalog-search">
              <i className="fas fa-search"></i>
              <input 
                type="text" 
                placeholder="Cari produk..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off" 
              />
            </div>
            <div className="catalog-sort-wrap">
              <i className="fas fa-arrow-down-wide-short"></i>
              <div 
                className="custom-select" 
                id="catalog-sort"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSortOpen(!isSortOpen);
                  setIsFilterOpen({ Retail: false, Konsinyasi: false, Cafe: false });
                }}
              >
                <button type="button" className={`custom-select-trigger catalog-sort ${isSortOpen ? 'active' : ''}`}>
                  <span>{getSortLabel()}</span>
                </button>
                <div className={`custom-select-menu ${isSortOpen ? 'open' : ''}`}>
                  <div 
                    className={`custom-select-option ${currentSort === 'terbaru' ? 'selected' : ''}`}
                    onClick={() => setCurrentSort('terbaru')}
                  >
                    <span>Terbaru</span>
                  </div>
                  <div 
                    className={`custom-select-option ${currentSort === 'nama-asc' ? 'selected' : ''}`}
                    onClick={() => setCurrentSort('nama-asc')}
                  >
                    <span>Nama A-Z</span>
                  </div>
                  <div 
                    className={`custom-select-option ${currentSort === 'nama-desc' ? 'selected' : ''}`}
                    onClick={() => setCurrentSort('nama-desc')}
                  >
                    <span>Nama Z-A</span>
                  </div>
                  <div 
                    className={`custom-select-option ${currentSort === 'harga-termurah' ? 'selected' : ''}`}
                    onClick={() => setCurrentSort('harga-termurah')}
                  >
                    <span>Harga Termurah</span>
                  </div>
                  <div 
                    className={`custom-select-option ${currentSort === 'harga-tertinggi' ? 'selected' : ''}`}
                    onClick={() => setCurrentSort('harga-tertinggi')}
                  >
                    <span>Harga Tertinggi</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FILTERS */}
          <div className="catalog-filters">
            <button 
              className={`filter-btn ${currentFilter === 'Semua Produk' ? 'active' : ''}`}
              onClick={() => handleFilterClick('Semua Produk')}
            >
              Semua Produk
            </button>

            {filterTree.map((utama) => (
              <div 
                key={utama.id}
                className="custom-select filter-select"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFilter(utama.nama);
                }}
              >
                <button type="button" className={`filter-btn ${currentFilter === utama.nama ? 'active' : ''}`}>
                  <span>{currentFilter === utama.nama && currentSubFilter !== 'Semua' ? `${utama.nama} • ${currentSubFilter}` : utama.nama}</span>
                  <i className="fas fa-chevron-down" style={{ marginLeft: '6px', fontSize: '11px' }}></i>
                </button>
                <div className={`custom-select-menu ${isFilterOpen[utama.nama] ? 'open' : ''}`}>
                  <div 
                    className={`custom-select-option ${currentFilter === utama.nama && currentSubFilter === 'Semua' ? 'selected' : ''}`}
                    onClick={() => handleSubFilterSelect(utama.nama, 'Semua')}
                  >
                    <span>Semua</span>
                  </div>
                  {utama.children.map((sub) => (
                    <div 
                      key={sub.id}
                      className={`custom-select-option ${currentFilter === utama.nama && currentSubFilter === sub.nama ? 'selected' : ''}`}
                      onClick={() => handleSubFilterSelect(utama.nama, sub.nama)}
                    >
                      <span>{sub.nama}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* RESULTS */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>Memuat katalog produk...</div>
          ) : filtered.length === 0 ? (
            <div className="catalog-empty">
              <i className="fas fa-search"></i>
              <h3>Produk Tidak Ditemukan</h3>
              <p>Coba gunakan kata kunci atau filter lain.</p>
            </div>
          ) : (
            <div id="catalog-results" className="catalog-results">
              {filtered.map((p) => (
                <div key={p.id} className="product-card">
                  <div className="product-img-wrap" onClick={() => handleOpenModal(p)} style={{ cursor: 'pointer' }}>
                    <LazyImage src={getApiUrl(p.gambar) || '/img/placeholder.jpg'} alt={p.nama} wrapperStyle={{ width: '100%', height: '100%' }} />
                    <span className={`product-badge ${(p.kategori || '').toLowerCase()}`}>
                      {p.kategori}{p.subkategori ? ' • ' + p.subkategori : ''}
                    </span>
                    {p.tag && (
                      <span className={`product-tag tag-${p.tag.toLowerCase().replace(/\s+/g, '-')}`}>
                        {p.tag}
                      </span>
                    )}
                  </div>
                  <div className="product-body">
                    <h3 onClick={() => handleOpenModal(p)} style={{ cursor: 'pointer' }}>{p.nama}</h3>
                    <div className="product-price">Rp {p.harga.toLocaleString()}</div>
                    <p className="product-desc">{p.deskripsi}</p>
                    <div className="product-actions">
                       <button className="btn-primary btn-sm" onClick={(e) => handleAddToCart(e, p)}>
                        <i className="fas fa-shopping-cart"></i> Tambah
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PRODUCT MODAL */}
      {selectedProduct && (
        <div id="product-modal" className="modal active">
          <div className="modal-overlay" onClick={handleCloseModal}></div>
          <div className="modal-content">
            <button id="modal-close" className="modal-close" onClick={handleCloseModal}><i className="fas fa-times"></i></button>
            <div className="product-modal-body">
              <div className="product-modal-img-container">
                <LazyImage
                  src={getApiUrl(selectedProduct.gambar) || '/img/placeholder.jpg'}
                  alt={selectedProduct.nama}
                  className="modal-img"
                  wrapperStyle={{ width: '100%', height: '100%' }}
                />
              </div>
              <div className="product-modal-content">
                <h2>{selectedProduct.nama}</h2>
                <div className="modal-price">Rp {selectedProduct.harga.toLocaleString()}</div>
                <div className="modal-category">
                  <span>{selectedProduct.kategori}{selectedProduct.subkategori ? ' • ' + selectedProduct.subkategori : ''}</span>
                </div>
                {selectedProduct.tag && (
                  <div className="modal-tag">
                    <span className={`tag-badge tag-${selectedProduct.tag.toLowerCase().replace(/\s+/g, '-')}`}>
                      {selectedProduct.tag}
                    </span>
                  </div>
                )}
                <p className="modal-desc" style={{ marginTop: '16px', color: 'var(--text-muted)' }}>{selectedProduct.deskripsi}</p>
                <div className="modal-qty" style={{ marginTop: '20px' }}>
                  <label style={{ display: 'block', fontWeight: 500, marginBottom: '8px' }}>Jumlah</label>
                  <div className="qty-control" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => setModalQty(Math.max(1, modalQty - 1))} className="btn-outline" style={{ padding: '6px 12px' }}><i className="fas fa-minus"></i></button>
                    <input 
                      type="number" 
                      value={modalQty} 
                      onChange={(e) => setModalQty(Math.max(1, parseInt(e.target.value) || 1))}
                      style={{ width: '60px', textAlign: 'center', padding: '6px', border: '1px solid var(--border)' }}
                    />
                    <button onClick={() => setModalQty(modalQty + 1)} className="btn-outline" style={{ padding: '6px 12px' }}><i className="fas fa-plus"></i></button>
                  </div>
                </div>
                <div className="modal-actions" style={{ marginTop: '24px' }}>
                  <button 
                    className="btn-primary" 
                    onClick={(e) => {
                      handleAddToCart(e, selectedProduct, modalQty);
                      setTimeout(() => {
                        handleCloseModal();
                      }, 450);
                      setTimeout(() => {
                        openCart();
                      }, 1000);
                    }}
                  >
                    <i className="fas fa-shopping-cart"></i> Tambah ke Keranjang
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Catalog;
