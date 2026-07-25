import React from 'react';
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
import ManageSettingsCheckout from './pages/admin/ManageSettingsCheckout';
import ManageSettingsGaleri from './pages/admin/ManageSettingsGaleri';
import ManageSettingsKontak from './pages/admin/ManageSettingsKontak';
import ManageSettingsLayanan from './pages/admin/ManageSettingsLayanan';
import Checkout from './pages/Checkout';
import Riwayat from './pages/Riwayat';
import NotFound from './pages/NotFound';

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
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
        <Route path="/admin/settings-checkout" element={<PageWrapper><ManageSettingsCheckout /></PageWrapper>} />
        <Route path="/admin/settings-galeri" element={<PageWrapper><ManageSettingsGaleri /></PageWrapper>} />
        <Route path="/admin/settings-kontak" element={<PageWrapper><ManageSettingsKontak /></PageWrapper>} />
        <Route path="/admin/settings-layanan" element={<PageWrapper><ManageSettingsLayanan /></PageWrapper>} />
        
        {/* 404 Route */}
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <CartProvider>
      <Router>
        <Navbar />
        <CartSidebar />
        <AnimatedRoutes />
        <Footer />
      </Router>
    </CartProvider>
  );
}

export default App;

