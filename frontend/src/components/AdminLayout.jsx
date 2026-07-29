import React, { useEffect, useState, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { apiFetch } from '../utils/api';

const AdminLayout = ({ children, title }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const token = localStorage.getItem('kopma_admin_token');
  const adminUser = localStorage.getItem('kopma_admin_user') || 'Admin';
  const role = localStorage.getItem('kopma_admin_role') || 'petugas';

  const [openMenus, setOpenMenus] = useState({
    transaksi: pathname.includes('/admin/pesanan'),
    master: pathname.includes('/admin/produk') || pathname.includes('/admin/kategori'),
    website: pathname.includes('/admin/pengurus') || pathname.includes('/admin/settings'),
    security: pathname.includes('/admin/users'),
  });

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
    } else if (role === 'petugas') {
      if (pathname.includes('/admin/settings') || pathname.includes('/admin/pengurus') || pathname.includes('/admin/users')) {
        navigate('/admin');
      }
    } else if (role === 'admin') {
      if (pathname.includes('/admin/users')) {
        navigate('/admin');
      }
    }
  }, [token, role, pathname, navigate]);

  useEffect(() => {
    setOpenMenus({
      transaksi: pathname.includes('/admin/pesanan'),
      master: pathname.includes('/admin/produk') || pathname.includes('/admin/kategori'),
      website: pathname.includes('/admin/pengurus') || pathname.includes('/admin/settings'),
      security: pathname.includes('/admin/users'),
    });
  }, [pathname]);

  // Real-time Order Notification System
  const [toastMessage, setToastMessage] = useState(null);
  const latestOrderId = useRef(null);

  useEffect(() => {
    if (!token) return;

    let isInitialLoad = true;

    const checkNewOrders = async () => {
      try {
        const res = await apiFetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          const orders = data.data || [];
          
          if (orders.length > 0) {
            const currentLatest = orders[0].id;
            
            if (!isInitialLoad && latestOrderId.current !== null && currentLatest > latestOrderId.current) {
              // New order detected!
              setToastMessage(`Pesanan Baru dari ${orders[0].nama}! (Order #${currentLatest})`);
              
              // Play notification sound
              try {
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.play().catch(e => console.log('Audio autoplay blocked', e));
              } catch (e) {}

              // Hide toast after 5 seconds
              setTimeout(() => {
                setToastMessage(null);
              }, 5000);
            }
            latestOrderId.current = currentLatest;
          }
          isInitialLoad = false;
        }
      } catch (err) {
        console.error('Error checking new orders:', err);
      }
    };

    checkNewOrders();
    const interval = setInterval(checkNewOrders, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, [token]);

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('kopma_admin_token');
    localStorage.removeItem('kopma_admin_user');
    localStorage.removeItem('kopma_admin_role');
    navigate('/admin/login');
  };

  if (!token) return null;

  return (
    <div className="admin-body">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              top: '30px',
              left: '50%',
              zIndex: 99999,
              background: 'var(--primary)',
              color: '#fff',
              padding: '16px 24px',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(15,81,50,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            onClick={() => {
              setToastMessage(null);
              navigate('/admin/pesanan');
            }}
          >
            <i className="fas fa-bell" style={{ fontSize: '20px', animation: 'ring 2s infinite' }}></i>
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="admin-wrapper">
        <div 
          className={`admin-sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}
          onClick={() => setIsSidebarOpen(false)}
        ></div>
        <aside className={`admin-sidebar ${isSidebarOpen ? 'active' : ''}`}>
          <div className="admin-sidebar-brand">
            <h3>
              <img src="/img/logo-koperasi.png" alt="Koperasi UTM" className="admin-logo-img" /> Koperasi <span>UTM</span>
            </h3>
            <span>Panel Administrasi</span>
          </div>
          <nav className="admin-sidebar-nav">
            <NavLink to="/admin" end className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fas fa-tachometer-alt"></i> <span>Dashboard</span>
            </NavLink>

            {/* Collapse Transaksi */}
            <div className={`admin-sidebar-collapse ${openMenus.transaksi ? 'open' : ''}`}>
              <button type="button" className="collapse-trigger" onClick={() => toggleMenu('transaksi')}>
                <i className="fas fa-shopping-cart"></i> <span>Transaksi</span>
                <i className={`fas fa-chevron-${openMenus.transaksi ? 'down' : 'right'} chevron-icon`}></i>
              </button>
              <div className="collapse-menu">
                <NavLink to="/admin/pesanan" className={({ isActive }) => isActive ? 'active' : ''}>
                  <i className="fas fa-inbox"></i> <span>Pesanan Masuk</span>
                </NavLink>
              </div>
            </div>

            {/* Collapse Master Data */}
            <div className={`admin-sidebar-collapse ${openMenus.master ? 'open' : ''}`}>
              <button type="button" className="collapse-trigger" onClick={() => toggleMenu('master')}>
                <i className="fas fa-database"></i> <span>Master Data</span>
                <i className={`fas fa-chevron-${openMenus.master ? 'down' : 'right'} chevron-icon`}></i>
              </button>
              <div className="collapse-menu">
                <NavLink to="/admin/produk" className={({ isActive }) => isActive ? 'active' : ''}>
                  <i className="fas fa-box"></i> <span>Kelola Produk</span>
                </NavLink>
                <NavLink to="/admin/kategori" className={({ isActive }) => isActive ? 'active' : ''}>
                  <i className="fas fa-tags"></i> <span>Kelola Kategori</span>
                </NavLink>
              </div>
            </div>

            {/* Collapse Website Settings (Hidden for petugas) */}
            {role !== 'petugas' && (
              <div className={`admin-sidebar-collapse ${openMenus.website ? 'open' : ''}`}>
              <button type="button" className="collapse-trigger" onClick={() => toggleMenu('website')}>
                <i className="fas fa-cogs"></i> <span>Setelan Website</span>
                <i className={`fas fa-chevron-${openMenus.website ? 'down' : 'right'} chevron-icon`}></i>
              </button>
              <div className="collapse-menu">
                <NavLink to="/admin/settings-hero" className={({ isActive }) => isActive ? 'active' : ''}>
                  <i className="fas fa-home"></i> <span>Setelan Hero</span>
                </NavLink>
                <NavLink to="/admin/settings-about" className={({ isActive }) => isActive ? 'active' : ''}>
                  <i className="fas fa-info-circle"></i> <span>Setelan Tentang</span>
                </NavLink>
                <NavLink to="/admin/settings-identity" className={({ isActive }) => isActive ? 'active' : ''}>
                  <i className="fas fa-bullseye"></i> <span>Setelan Visi Misi</span>
                </NavLink>
                <NavLink to="/admin/settings-galeri" className={({ isActive }) => isActive ? 'active' : ''}>
                  <i className="fas fa-images"></i> <span>Galeri Kegiatan</span>
                </NavLink>
                <NavLink to="/admin/settings-layanan" className={({ isActive }) => isActive ? 'active' : ''}>
                  <i className="fas fa-concierge-bell"></i> <span>Setelan Layanan</span>
                </NavLink>
                <NavLink to="/admin/settings-kontak" className={({ isActive }) => isActive ? 'active' : ''}>
                  <i className="fas fa-map-marked-alt"></i> <span>Setelan Kontak</span>
                </NavLink>
                <NavLink to="/admin/settings-checkout" className={({ isActive }) => isActive ? 'active' : ''}>
                  <i className="fas fa-shopping-bag"></i> <span>Setelan Checkout</span>
                </NavLink>
                <NavLink to="/admin/settings-kategori" className={({ isActive }) => isActive ? 'active' : ''}>
                  <i className="fas fa-th-large"></i> <span>Kategori Tampil</span>
                </NavLink>
                <NavLink to="/admin/pengurus" className={({ isActive }) => isActive ? 'active' : ''}>
                  <i className="fas fa-sitemap"></i> <span>Kelola Pengurus</span>
                </NavLink>
              </div>
            </div>
            )}

            {/* Collapse Security (Hidden for petugas and admin) */}
            {role === 'super_admin' && (
              <div className={`admin-sidebar-collapse ${openMenus.security ? 'open' : ''}`}>
              <button type="button" className="collapse-trigger" onClick={() => toggleMenu('security')}>
                <i className="fas fa-shield-alt"></i> <span>Keamanan</span>
                <i className={`fas fa-chevron-${openMenus.security ? 'down' : 'right'} chevron-icon`}></i>
              </button>
              <div className="collapse-menu">
                <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''}>
                  <i className="fas fa-users"></i> <span>Kelola Admin</span>
                </NavLink>
              </div>
            </div>
            )}
          </nav>
          <div className="admin-sidebar-footer">
            <a href="#" onClick={handleLogout}><i className="fas fa-sign-out-alt"></i> <span>Logout</span></a>
          </div>
        </aside>
        
        <main className="admin-main">
          <header className="admin-header">
            <div className="admin-header-left">
              <button className="admin-sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                <i className="fas fa-bars"></i>
              </button>
              <h2>{title}</h2>
            </div>
            <div className="admin-header-right">
              <span>Selamat datang, {adminUser}</span>
              <div className="admin-avatar"><i className="fas fa-user"></i></div>
            </div>
          </header>
          <div className="admin-content">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
