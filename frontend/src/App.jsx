import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';

// Pages
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ManagePesanan from './pages/admin/ManagePesanan';
import ManageProduk from './pages/admin/ManageProduk';
import ManageKategori from './pages/admin/ManageKategori';
import ManageUser from './pages/admin/ManageUser';
import ManagePengurus from './pages/admin/ManagePengurus';
import ManageSettingsHero from './pages/admin/ManageSettingsHero';
import ManageSettingsAbout from './pages/admin/ManageSettingsAbout';
import ManageSettingsIdentity from './pages/admin/ManageSettingsIdentity';
import ManageSettingsGaleri from './pages/admin/ManageSettingsGaleri';
import ManageSettingsKontak from './pages/admin/ManageSettingsKontak';
import ManageSettingsLayanan from './pages/admin/ManageSettingsLayanan';
import ManageSettingsCheckout from './pages/admin/ManageSettingsCheckout';
import ManageSettingsKategori from './pages/admin/ManageSettingsKategori';
import Checkout from './pages/Checkout';
import Riwayat from './pages/Riwayat';
import NotFound from './pages/NotFound';

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/profil" element={<PageWrapper><Profile /></PageWrapper>} />
        <Route path="/katalog" element={<PageWrapper><Catalog /></PageWrapper>} />
        <Route path="/kontak" element={<PageWrapper><Contact /></PageWrapper>} />
        <Route path="/checkout" element={<PageWrapper><Checkout /></PageWrapper>} />
        <Route path="/riwayat" element={<PageWrapper><Riwayat /></PageWrapper>} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/admin" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="/admin/pesanan" element={<PageWrapper><ManagePesanan /></PageWrapper>} />
        <Route path="/admin/produk" element={<PageWrapper><ManageProduk /></PageWrapper>} />
        <Route path="/admin/kategori" element={<PageWrapper><ManageKategori /></PageWrapper>} />
        <Route path="/admin/users" element={<PageWrapper><ManageUser /></PageWrapper>} />
        <Route path="/admin/pengurus" element={<PageWrapper><ManagePengurus /></PageWrapper>} />
        <Route path="/admin/settings-hero" element={<PageWrapper><ManageSettingsHero /></PageWrapper>} />
        <Route path="/admin/settings-about" element={<PageWrapper><ManageSettingsAbout /></PageWrapper>} />
        <Route path="/admin/settings-identity" element={<PageWrapper><ManageSettingsIdentity /></PageWrapper>} />
        <Route path="/admin/settings-galeri" element={<PageWrapper><ManageSettingsGaleri /></PageWrapper>} />
        <Route path="/admin/settings-kontak" element={<PageWrapper><ManageSettingsKontak /></PageWrapper>} />
        <Route path="/admin/settings-layanan" element={<PageWrapper><ManageSettingsLayanan /></PageWrapper>} />
        <Route path="/admin/settings-checkout" element={<PageWrapper><ManageSettingsCheckout /></PageWrapper>} />
        <Route path="/admin/settings-kategori" element={<PageWrapper><ManageSettingsKategori /></PageWrapper>} />

        {/* 404 Route */}
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Simulate loading time or wait for assets
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 1500); // 1.5s loading time
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isInitialLoad && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: 0.6, ease: 'easeInOut' }
            }}
            style={{
              position: 'fixed',
              top: 0, left: 0, width: '100%', height: '100vh',
              backgroundColor: 'var(--bg)',
              zIndex: 999999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            {/* Ambient Background Glow */}
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.15, 0.25, 0.15]
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: 'easeInOut'
              }}
              style={{
                position: 'absolute',
                width: '350px',
                height: '350px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, var(--accent) 0%, rgba(255,255,255,0) 70%)',
                filter: 'blur(30px)',
                pointerEvents: 'none',
                zIndex: 1
              }}
            />

            {/* Central Logo Container */}
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

              {/* Outer Slow Rotating Dashed Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                style={{
                  position: 'absolute',
                  width: '140px',
                  height: '140px',
                  borderRadius: '50%',
                  border: '2px dashed var(--accent)',
                  opacity: 0.35,
                }}
              />

              {/* Inner Soft Pulsing Glowing Ring */}
              <motion.div
                animate={{
                  scale: [0.93, 1.05, 0.93],
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  width: '115px',
                  height: '115px',
                  borderRadius: '50%',
                  border: '2px solid var(--accent)',
                  boxShadow: '0 0 20px rgba(0, 117, 74, 0.35)',
                }}
              />

              {/* Logo itself with elegant pulsing scale */}
              <motion.img
                src="/img/logo-koperasi.png"
                alt="Koperasi UTM Logo"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: 1
                }}
                transition={{
                  scale: {
                    repeat: Infinity,
                    duration: 2.2,
                    ease: 'easeInOut'
                  },
                  opacity: {
                    duration: 0.4
                  }
                }}
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'contain',
                  zIndex: 3,
                  filter: 'drop-shadow(0px 8px 16px rgba(0, 0, 0, 0.12))'
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartProvider>
        <Router>
          <Navbar />
          <CartSidebar />
          <AnimatedRoutes />
          <Footer />
        </Router>
      </CartProvider>
    </>
  );
}

export default App;