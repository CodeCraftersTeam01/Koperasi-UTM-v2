import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';

const Contact = () => {
  const [settings, setSettings] = useState({
    kontak_alamat: '',
    kontak_whatsapp: '',
    kontak_email: '',
    kontak_instagram: '',
    kontak_maps_embed: ''
  });
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    subjek: '',
    pesan: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    apiFetch('/api/settings').then(res => res.ok && res.json()).then(data => {
      if (data) setSettings(prev => ({ ...prev, ...data }));
    }).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (res.ok) {
        alert(data.message || `Terima kasih ${formData.nama}, pesan Anda telah dikirim!`);
        setFormData({ nama: '', email: '', subjek: '', pesan: '' });
      } else {
        alert(data.message || 'Gagal mengirim pesan. Silakan coba lagi.');
      }
    } catch (err) {
      alert('Terjadi kesalahan. Gagal menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* PAGE HERO */}
      <section className="page-hero">
        <div className="container">
          <h1>Hubungi Kami</h1>
          <p>Kami siap melayani Anda</p>
          <div className="breadcrumb">
            <span>Beranda</span>
            <i className="fas fa-chevron-right"></i>
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Kontak</span>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="contact-page">
        <div className="container">
          <div className="contact-wrap">
            <div className="contact-info-card">
              <h3>Informasi Kontak</h3>
              <p>Jangan ragu untuk menghubungi kami melalui kontak di bawah ini.</p>

              <div className="contact-detail-item">
                <div className="contact-detail-icon"><i className="fas fa-map-marker-alt"></i></div>
                <div className="contact-detail-text">
                  <h4>Alamat</h4>
                  <p>{settings.kontak_alamat.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}</p>
                </div>
              </div>

              <div className="contact-detail-item">
                <div className="contact-detail-icon"><i className="fab fa-whatsapp"></i></div>
                <div className="contact-detail-text">
                  <h4>WhatsApp</h4>
                  <p>{settings.kontak_whatsapp}</p>
                </div>
              </div>

              <div className="contact-detail-item">
                <div className="contact-detail-icon"><i className="fas fa-envelope"></i></div>
                <div className="contact-detail-text">
                  <h4>Email</h4>
                  <p>{settings.kontak_email}</p>
                </div>
              </div>

              <div className="contact-detail-item">
                <div className="contact-detail-icon"><i className="fab fa-instagram"></i></div>
                <div className="contact-detail-text">
                  <h4>Instagram</h4>
                  <p>{settings.kontak_instagram}</p>
                </div>
              </div>
            </div>

            <div className="contact-form-card">
              <h3>Kirim Pesan</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <input 
                    type="text" 
                    name="nama" 
                    placeholder="Nama Lengkap" 
                    value={formData.nama}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="Email" 
                    value={formData.email}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="text" 
                    name="subjek" 
                    placeholder="Subjek" 
                    value={formData.subjek}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <textarea 
                    name="pesan" 
                    placeholder="Tulis pesan Anda..." 
                    value={formData.pesan}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <><i className="fas fa-spinner fa-spin"></i> Mengirim...</> : <><i className="fas fa-paper-plane"></i> Kirim Pesan</>}
                </button>
              </form>
            </div>
          </div>

          <div className="map-wrap">
            <iframe 
              src={settings.kontak_maps_embed}
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Peta Lokasi Koperasi UTM"
            ></iframe>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
