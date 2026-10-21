import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';

// Public Pages: Eager load Home for instant paint, lazy load other pages
import Home from './pages/Home';
const Catalog = lazy(() => import('./pages/Catalog'));
const Profile = lazy(() => import('./pages/Profile'));
const Contact = lazy(() => import('./pages/Contact'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Riwayat = lazy(() => import('./pages/Riwayat'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin Pages (Code split for high performance)
const Login = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ManagePesanan = lazy(() => import('./pages/admin/ManagePesanan'));
const ManageProduk = lazy(() => import('./pages/admin/ManageProduk'));
const ManageKategori = lazy(() => import('./pages/admin/ManageKategori'));
const ManageUser = lazy(() => import('./pages/admin/ManageUser'));
const ManagePengurus = lazy(() => import('./pages/admin/ManagePengurus'));
const ManageSettingsHero = lazy(() => import('./pages/admin/ManageSettingsHero'));
const ManageSettingsAbout = lazy(() => import('./pages/admin/ManageSettingsAbout'));
const ManageSettingsIdentity = lazy(() => import('./pages/admin/ManageSettingsIdentity'));
const ManageSettingsGaleri = lazy(() => import('./pages/admin/ManageSettingsGaleri'));
const ManageSettingsKontak = lazy(() => import('./pages/admin/ManageSettingsKontak'));
const ManageSettingsLayanan = lazy(() => import('./pages/admin/ManageSettingsLayanan'));
const ManageSettingsCheckout = lazy(() => import('./pages/admin/ManageSettingsCheckout'));
const ManageSettingsKategori = lazy(() => import('./pages/admin/ManageSettingsKategori'));

import { adminPath } from './config/admin';

const PageFallback = () => (
  <div style={{
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6
  }}>
    <div style={{
      width: '36px',
      height: '36px',
      border: '3px solid rgba(0, 117, 74, 0.2)',
      borderTopColor: 'var(--primary, #00754a)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
  </div>
);

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2, ease: 'easeInOut' }}
  >
    <Suspense fallback={<PageFallback />}>
      {children}
    </Suspense>
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
        <Route path={adminPath('login')} element={<PageWrapper><Login /></PageWrapper>} />
        <Route path={adminPath()} element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path={adminPath('pesanan')} element={<PageWrapper><ManagePesanan /></PageWrapper>} />
        <Route path={adminPath('produk')} element={<PageWrapper><ManageProduk /></PageWrapper>} />
        <Route path={adminPath('kategori')} element={<PageWrapper><ManageKategori /></PageWrapper>} />
        <Route path={adminPath('users')} element={<PageWrapper><ManageUser /></PageWrapper>} />
        <Route path={adminPath('pengurus')} element={<PageWrapper><ManagePengurus /></PageWrapper>} />
        <Route path={adminPath('settings-hero')} element={<PageWrapper><ManageSettingsHero /></PageWrapper>} />
        <Route path={adminPath('settings-about')} element={<PageWrapper><ManageSettingsAbout /></PageWrapper>} />
        <Route path={adminPath('settings-identity')} element={<PageWrapper><ManageSettingsIdentity /></PageWrapper>} />
        <Route path={adminPath('settings-galeri')} element={<PageWrapper><ManageSettingsGaleri /></PageWrapper>} />
        <Route path={adminPath('settings-kontak')} element={<PageWrapper><ManageSettingsKontak /></PageWrapper>} />
        <Route path={adminPath('settings-layanan')} element={<PageWrapper><ManageSettingsLayanan /></PageWrapper>} />
        <Route path={adminPath('settings-checkout')} element={<PageWrapper><ManageSettingsCheckout /></PageWrapper>} />
        <Route path={adminPath('settings-kategori')} element={<PageWrapper><ManageSettingsKategori /></PageWrapper>} />

        {/* 404 Route */}
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [isInitialLoad, setIsInitialLoad] = useState(() => {
    return !sessionStorage.getItem('kopma_intro_shown');
  });

  useEffect(() => {
    if (isInitialLoad) {
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
        sessionStorage.setItem('kopma_intro_shown', 'true');
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isInitialLoad]);

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