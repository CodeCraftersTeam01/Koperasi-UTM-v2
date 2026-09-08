import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch, getApiUrl } from '../utils/api';
import { useCart } from '../context/CartContext';
import { playFlyToCartAnimation } from '../utils/animation';
import LazyImage from '../components/LazyImage';

const Home = () => {
  const { addToCart } = useCart();
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalQty, setModalQty] = useState(1);
  const [kategoriTampil, setKategoriTampil] = useState([]);

  const handleAddToCart = (e, product, qty = 1) => {
    const imgUrl = product.gambar ? getApiUrl(product.gambar) : '';
    playFlyToCartAnimation(e.currentTarget, imgUrl, () => {
      addToCart(product, qty);
    });
  };
  const [settings, setSettings] = useState({
    hero_title_accent: 'Koperasi',
    hero_title_sub: 'Universitas Trunojoyo Madura',
    hero_tagline: 'Dari Anggota, Oleh Anggota, Untuk Anggota',
    hero_desc: 'Menyediakan berbagai kebutuhan mahasiswa dengan pelayanan yang mudah, cepat, dan terpercaya.',
    about_tag: 'Tentang Koperasi UTM',
    about_title: 'Koperasi Universitas Trunojoyo Madura',
    about_desc: 'Koperasi UTM adalah koperasi yang berorientasi pada pelayanan mahasiswa, mendukung ekonomi kreatif mahasiswa, dan menyediakan berbagai kebutuhan sehari-hari di lingkungan kampus.\n\nSebagai wadah pengembangan ekonomi mahasiswa, Koperasi UTM berkomitmen untuk memberikan pelayanan terbaik dengan harga yang terjangkau dan produk yang berkualitas.',
    about_year: '1997',
    about_badge_text: 'Melayani Mahasiswa',
    layanan_judul: 'Layanan Koperasi UTM',
    layanan_deskripsi: 'Berbagai layanan yang tersedia untuk memenuhi kebutuhan seluruh civitas akademika Universitas Trunojoyo Madura.',
    layanan_items: '[]',
  });

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);

    // Fetch latest products and settings
    const fetchData = async () => {
      try {
        const [prodRes, settingsRes] = await Promise.all([
          apiFetch('/api/produk?arsip=0'),
          apiFetch('/api/settings')
        ]);

        if (prodRes.ok) {
          const data = await prodRes.json();
          const list = Array.isArray(data) ? data : (data.data || []);
          setLatestProducts(list.slice(0, 6));
        }

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(prev => ({ ...prev, ...settingsData }));
          if (settingsData.kategori_tampil) {
            try {
              const parsed = JSON.parse(settingsData.kategori_tampil);
              setKategoriTampil(Array.isArray(parsed) ? parsed : []);
            } catch {
              setKategoriTampil([]);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      {/* HERO */}
      <section id="hero" className="hero">
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: "url('/img/cakra.jpeg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0
          }}
        />
        <div className="container hero-grid">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="hero-title-accent">{settings.hero_title_accent}</span><br />
              <span className="hero-title-sub">{settings.hero_title_sub}</span>
            </h1>
            <p className="hero-tagline">{settings.hero_tagline}</p>
            <p className="hero-desc">
              {settings.hero_desc}
            </p>
            <div className="hero-actions">
              <Link to="/katalog" className="btn-primary">Jelajahi Produk <i className="fas fa-arrow-right"></i></Link>
              <Link to="/kontak" className="btn-outline">Hubungi Kami <i className="fas fa-phone-alt"></i></Link>
            </div>
          </div>
        </div>
        <div className="scroll-indicator" onClick={() => document.getElementById('tentang')?.scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer' }}>
          <span>Scroll</span>
          <i className="fas fa-chevron-down"></i>
        </div>
      </section>

      {/* TENTANG KOPERASI */}
      <section id="tentang" className="section about">
        <div className="container">
          <div className="about-grid">
            <div className="about-image">
              <div className="about-img-wrapper">
                <LazyImage src={getApiUrl('img/layanan/koperasi.jpeg')} alt="Kegiatan Koperasi Mahasiswa" wrapperStyle={{ width: '100%', height: '100%' }} />
                <div className="about-badge-exp">
                  <strong>Sejak {settings.about_year}</strong>
                  <span>{settings.about_badge_text}</span>
                </div>
              </div>
            </div>
            <div className="about-text">
              <h2>{settings.about_title}</h2>
              <div style={{ whiteSpace: 'pre-line', color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '20px', textAlign: 'justify' }}>
                {settings.about_desc}
              </div>
              <div className="about-features">
                <div className="about-feature-item"><i className="fas fa-check-circle"></i> Berorientasi pada mahasiswa</div>
                <div className="about-feature-item"><i className="fas fa-check-circle"></i> Mendukung ekonomi kreatif</div>
                <div className="about-feature-item"><i className="fas fa-check-circle"></i> Harga terjangkau</div>
                <div className="about-feature-item"><i className="fas fa-check-circle"></i> Produk berkualitas</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LAYANAN */}
      {(() => {
        let layananItems = [];
        try {
          layananItems = JSON.parse(settings.layanan_items || '[]');
        } catch {}
        if (!Array.isArray(layananItems)) layananItems = [];
        return layananItems.length > 0 ? (
          <section id="layanan" className="section services">
            <div className="container">
              <div className="section-header">
                <h2>{settings.layanan_judul || 'Layanan Koperasi UTM'}</h2>
                <p>{settings.layanan_deskripsi || ''}</p>
              </div>
              <div className="services-grid">
                {layananItems.map((item, idx) => (
                  <div key={idx} className="service-card">
                    <div className="service-img">
                      {item.gambar ? (
                        <LazyImage src={getApiUrl(item.gambar)} alt={item.judul} wrapperStyle={{ width: '100%', height: '100%' }} />
                      ) : (
                        <i className={`fas ${item.ikon || 'fa-cogs'}`} style={{ fontSize: '32px', color: '#00754A', margin: '20px auto 0' }}></i>
                      )}
                    </div>
                    <div className="service-info">
                      <h3>{item.judul}</h3>
                      <p>{item.deskripsi}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null;
      })()}

      {/* KATEGORI */}
      <section id="kategori" className="section categories">
        <div className="container">
          <div className="section-header">
            <h2>Kategori Produk</h2>
            <p>Berbagai pilihan produk yang tersedia untuk memenuhi kebutuhan Anda di lingkungan kampus.</p>
          </div>
          <div className="categories-grid">
            {kategoriTampil.map((kat) => (
              <div key={kat.id} className="category-card">
                <div className="category-icon"><i className={`fas ${kat.icon || 'fa-tag'}`}></i></div>
                <h3>{kat.nama}</h3>
                <p>{kat.deskripsi || ''}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUK TERBARU */}
      <section id="produk" className="section latest-products">
        <div className="container">
          <div className="section-header">
            <h2>Produk Terbaru</h2>
            <p>Beberapa produk pilihan yang tersedia di Koperasi UTM. Klik untuk melihat detail dan melakukan pemesanan.</p>
          </div>
          
          {loading ? (
            <div className="products-grid">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton skeleton-card-img"></div>
                  <div className="skeleton-card-body">
                    <div className="skeleton skeleton-card-title"></div>
                    <div className="skeleton skeleton-card-badge"></div>
                    <div className="skeleton skeleton-card-price"></div>
                    <div className="skeleton skeleton-card-desc"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div id="products-grid" className="products-grid">
              {latestProducts.map((p) => (
                <div key={p.id} className="product-card" onClick={() => handleOpenModal(p)} style={{ cursor: 'pointer' }}>
                  <div className="product-img-wrap">
                    <LazyImage src={getApiUrl(p.gambar) || '/img/placeholder.jpg'} alt={p.nama} wrapperStyle={{ width: '100%', height: '100%' }} />
                  </div>
                  <div className="product-body">
                    <h3>{p.nama}</h3>
                    {(p.kategori || p.tag) && (
                      <div className="product-badges">
                        {p.kategori && (
                          <span className={`product-badge ${(p.kategori || '').toLowerCase()}`}>{p.kategori}</span>
                        )}
                        {p.tag && (
                          <span className={`product-tag tag-${p.tag.toLowerCase().replace(/\s+/g, '-')}`}>
                            {p.tag}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="product-price">Rp {p.harga.toLocaleString()}</div>
                    <p className="product-desc">{p.deskripsi}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/katalog" className="btn-primary">Lihat Semua Produk <i className="fas fa-arrow-right"></i></Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>"DARI ANGGOTA, OLEH ANGGOTA, UNTUK ANGGOTA"</h2>
            <p>Jelajahi seluruh katalog produk Koperasi UTM dan temukan kebutuhan Anda.</p>
            <Link to="/katalog" className="btn-primary"><i class="fas fa-shopping-cart"></i> Jelajahi Katalog</Link>
          </div>
        </div>
      </section>

      {/* MODAL DETAIL PRODUK */}
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
                  <span className={`product-badge ${(selectedProduct.kategori || '').toLowerCase()}`}>
                    {selectedProduct.kategori}{selectedProduct.subkategori ? ' › ' + selectedProduct.subkategori : ''}
                  </span>
                </div>
                {selectedProduct.tag && (
                  <div className="modal-tag">
                    <span className={`product-tag tag-${selectedProduct.tag.toLowerCase().replace(/\s+/g, '-')}`}>
                      {selectedProduct.tag}
                    </span>
                  </div>
                )}
                <p className="modal-desc" style={{ marginTop: '16px', color: 'var(--text-muted)' }}>{selectedProduct.deskripsi}</p>
                <div className="modal-qty" style={{ marginTop: '20px' }}>
                  <label style={{ display: 'block', fontWeight: 500, marginBottom: '8px' }}>Jumlah</label>
                  <div className="qty-control">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => setModalQty(Math.max(1, modalQty - 1))}
                      disabled={modalQty <= 1}
                      aria-label="Kurangi jumlah"
                    >
                      <i className="fas fa-minus"></i>
                    </button>
                    <input
                      type="number"
                      value={modalQty}
                      onChange={(e) => setModalQty(Math.max(1, parseInt(e.target.value) || 1))}
                      aria-label="Jumlah"
                    />
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => setModalQty(modalQty + 1)}
                      aria-label="Tambah jumlah"
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
                <div className="modal-subtotal">
                  <span>Subtotal</span>
                  <strong>Rp {(selectedProduct.harga * modalQty).toLocaleString()}</strong>
                </div>
                <div className="modal-actions" style={{ marginTop: '24px' }}>
                  <button
                    className="btn-primary"
                    onClick={(e) => {
                      handleAddToCart(e, selectedProduct, modalQty);
                      setTimeout(() => {
                        handleCloseModal();
                      }, 500);
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

export default Home;
