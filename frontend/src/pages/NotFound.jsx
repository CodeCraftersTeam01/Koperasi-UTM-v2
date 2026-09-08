import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section className="not-found-page" style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      textAlign: 'center',
      padding: '40px 20px',
      background: 'var(--bg)'
    }}>
      <div className="container" style={{ marginTop: '100px' }}>
        <h1 style={{ 
          fontSize: 'clamp(80px, 15vw, 150px)', 
          fontWeight: 800, 
          color: 'var(--primary)', 
          lineHeight: 1, 
          margin: '0 0 10px 0',
          textShadow: '0 10px 30px rgba(0, 98, 65, 0.15)'
        }}>
          404
        </h1>
        <h2 style={{ 
          fontSize: 'clamp(24px, 4vw, 32px)', 
          fontWeight: 700, 
          color: 'var(--text)', 
          margin: '0 0 16px 0' 
        }}>
          Halaman Tidak Ditemukan
        </h2>
        <p style={{ 
          fontSize: '16px', 
          color: 'var(--text-muted)', 
          maxWidth: '500px', 
          margin: '0 auto 32px' 
        }}>
          Maaf, halaman yang Anda cari mungkin telah dihapus, diubah namanya, atau tidak pernah ada sama sekali.
        </p>
        <Link to="/" className="btn-primary" style={{ padding: '14px 32px', fontSize: '15px' }}>
          <i className="fas fa-home" style={{ marginRight: '8px' }}></i> Kembali ke Beranda
        </Link>
      </div>
    </section>
  );
};

export default NotFound;
