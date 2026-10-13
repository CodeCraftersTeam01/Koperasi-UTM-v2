import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { isAdminPath } from '../config/admin';

const Footer = () => {
  const location = useLocation();
  const isAdminRoute = isAdminPath(location.pathname);

  if (isAdminRoute) return null;

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <img src="/img/logo-koperasi.png" alt="Koperasi UTM" className="footer-logo-img" />
          <h3>Koperasi UTM</h3>
          <p>Koperasi Universitas Trunojoyo Madura — Dari Anggota, Oleh Anggota, Untuk Anggota.</p>
          <div className="footer-social">
            <a href="https://www.instagram.com/koperasiutm/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
            <a href="https://www.tiktok.com/@koperasiutm" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><i className="fab fa-tiktok"></i></a>
            <a href="https://www.youtube.com/@KoperasiTrunojoyo" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
          </div>
        </div>
        <div className="footer-links">
          <h4>Navigasi</h4>
          <Link to="/">Beranda</Link>
          <Link to="/profil">Profil</Link>
          <Link to="/katalog">Katalog</Link>
          <Link to="/kontak">Kontak</Link>
        </div>
        <div className="footer-links">
          <h4>Kategori</h4>
          <Link to="/katalog?filter=Retail">Retail</Link>
          <Link to="/katalog?filter=Konsinyasi">Konsinyasi</Link>
          <Link to="/katalog?filter=Cafe">Cafe</Link>
        </div>
        <div className="footer-links">
          <h4>Kontak</h4>
          <div className="footer-contact-item">
            <i className="fas fa-map-marker-alt"></i>
            <span>Jl. Raya Telang PO BOX 2 Kamal, Bangkalan 69162</span>
          </div>
          <div className="footer-contact-item">
            <i className="fas fa-phone-alt"></i>
            <span>+62 811-3300-676</span>
          </div>
          <div className="footer-contact-item">
            <i className="fas fa-envelope"></i>
            <span>koperasitrunojoyo@gmail.com</span>
          </div>
          <div className="footer-contact-item">
            <i className="fab fa-instagram"></i>
            <span>@koperasiutm</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 UKMFT-ITC. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
