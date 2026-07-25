import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import GradualBlur from './GradualBlur';

const Navbar = () => {
  const { cartCount, openCart } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollWidth, setScrollWidth] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const sy = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      setIsScrolled(sy > 50);
      setScrollWidth(docHeight > 0 ? (sy / docHeight) * 100 : 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when navigation happens
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // If in admin dashboard, we show different navigation or handle dashboard layouts.
  // The user approved showing dashboard separately, but let's hide navbar for admin routes.
  const isAdminRoute = location.pathname.startsWith('/admin');
  if (isAdminRoute) return null;

  return (
    <>
      <div className={`hero-nav-overlay ${isMenuOpen ? 'hidden-up' : ''} ${isScrolled ? 'scrolled-out' : ''}`}></div>
      <GradualBlur
        target="page"
        position="top"
        height="100px"
        strength={1.5}
        divCount={4}
        zIndex={9000}
        className={`${isMenuOpen ? 'hidden-blur' : ''}`}
      />
      <nav id="navbar" className={`${isScrolled ? 'scrolled' : ''} ${isMenuOpen ? 'hidden-up' : ''}`}>
        <div className="nav-inner container">
          <Link to="/" className="nav-logo">
            <img src="/img/logo-koperasi.png" alt="Koperasi UTM" className="nav-logo-img" /> Koperasi UTM
          </Link>
          
          <div className="nav-menu-desktop">
            <ul className="nav-menu-list-desktop">
              <li>
                <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Beranda
                </NavLink>
              </li>
              <li>
                <NavLink to="/profil" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Profil
                </NavLink>
              </li>
              <li>
                <NavLink to="/katalog" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Katalog
                </NavLink>
              </li>
              <li>
                <NavLink to="/kontak" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Kontak
                </NavLink>
              </li>
            </ul>
          </div>
          <div className="nav-actions">
            <Link 
              to="/riwayat" 
              className="cart-btn" 
              aria-label="Riwayat Transaksi" 
              style={{ marginRight: '8px' }}
              title="Riwayat Pesanan"
            >
              <i className="fas fa-history"></i>
            </Link>
            <button className="cart-btn" aria-label="Keranjang" onClick={openCart}>
              <i className="fas fa-shopping-bag"></i>
              <span className={`cart-badge ${cartCount > 0 ? 'show' : ''}`}>{cartCount}</span>
            </button>
            <button 
              id="hamburger" 
              className={`hamburger ${isMenuOpen ? 'active' : ''}`} 
              aria-label="Menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`nav-menu-overlay ${isMenuOpen ? 'active' : ''}`} 
        onClick={() => setIsMenuOpen(false)}
      ></div>

      {/* Mobile Menu */}
      <div id="nav-menu" className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
        <button className="nav-menu-close" onClick={() => setIsMenuOpen(false)}>
           <i className="fas fa-times"></i>
        </button>
        <ul className="nav-menu-list">
          <li style={{ '--delay': '0.1s' }}>
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Beranda
            </NavLink>
          </li>
          <li style={{ '--delay': '0.15s' }}>
            <NavLink to="/profil" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Profil
            </NavLink>
          </li>
          <li style={{ '--delay': '0.2s' }}>
            <NavLink to="/katalog" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Katalog
            </NavLink>
          </li>
          <li style={{ '--delay': '0.25s' }}>
            <NavLink to="/kontak" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Kontak
            </NavLink>
          </li>
        </ul>
      </div>

      <div id="scroll-bar" className="scroll-bar" style={{ width: `${scrollWidth}%` }}></div>
    </>
  );
};

export default Navbar;
