import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { apiFetch, getApiUrl } from '../utils/api';
import LazyImage from '../components/LazyImage';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();

  // Form details
  const [nama, setNama] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  // Request State
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Checkout system setting
  const [checkoutSystem, setCheckoutSystem] = useState('current');
  const [adminWhatsapp, setAdminWhatsapp] = useState('085727877235');

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);

    // Redirect to home if cart empty (unless success is true)
    if (cart.length === 0 && !success) {
      navigate('/');
    }
  }, [cart, navigate, success]);

  useEffect(() => {
    apiFetch('/api/settings')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          if (data.checkout_system) setCheckoutSystem(data.checkout_system);
          if (data.admin_whatsapp) setAdminWhatsapp(data.admin_whatsapp);
        }
      })
      .catch(() => {});
  }, []);

  const formatPhone = (phone) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('0')) return '62' + digits.slice(1);
    if (digits.startsWith('62')) return digits;
    return '62' + digits;
  };

  const generateNotaNumber = () => {
    const pad = (x) => String(x).padStart(2, '0');
    const now = new Date();
    const rand = String(Math.floor(1000 + Math.random() * 9000));
    return `${pad(now.getDate())}${pad(now.getMonth() + 1)}${String(now.getFullYear()).slice(2)}${rand}`;
  };

  const buildWhatsAppMessage = (nota) => {
    const pad = (x) => String(x).padStart(2, '0');
    const now = new Date();
    const tanggal = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const fmt = (n) => n.toLocaleString('id-ID');
    const WIDTH = 31;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const center = (text) => {
      if (isMobile) return text;
      const total = Math.max(0, WIDTH - text.length);
      return ' '.repeat(Math.floor(total / 2)) + text + ' '.repeat(Math.ceil(total / 2));
    };

    const items = cart.map((item) => {
      const subtotal = fmt(item.harga * item.qty);
      return `${item.nama}\n${`${item.qty} Pcs x ${fmt(item.harga)}`.padEnd(21)}${subtotal.padStart(10)}`;
    }).join('\n\n');

    const phonePad = isMobile ? '' : ' '.repeat(Math.floor((WIDTH - 13) / 2));

    const notaLine = isMobile ? `No Nota : ${nota}` : `No Nota : ${nota}`;
    const pelangganLine = isMobile ? `Pelanggan : ${nama.toUpperCase()}` : `Pelanggan : ${nama.toUpperCase()}`;
    const tanggalLine = isMobile ? `Tanggal : ${tanggal}` : `Tanggal : ${tanggal}`;

    const message =
`\`\`\`
${center('KOPERASI UTM')}
${center('Jl. Raya Telang PO BOX Kamal')}
${phonePad}0811-3904-676
${'='.repeat(WIDTH)}
${notaLine}
${pelangganLine}
${tanggalLine}
${'='.repeat(WIDTH)}
${items}
${'-'.repeat(WIDTH)}
${'TOTAL'.padEnd(21)}${fmt(cartTotal).padStart(10)}
${'='.repeat(WIDTH)}

${center('TERIMA KASIH')}
\`\`\``;

    return encodeURIComponent(message);
  };

  const submitOrder = async (nota) => {
    const res = await apiFetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nama,
        whatsapp,
        nomor_nota: nota,
        items: cart.map(item => ({
          nama: item.nama,
          harga: item.harga,
          qty: item.qty
        }))
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.order_id) {
        const currentOrders = JSON.parse(localStorage.getItem('kopma_user_orders') || '[]');
        currentOrders.unshift(data.order_id);
        localStorage.setItem('kopma_user_orders', JSON.stringify(currentOrders));
      }
      return true;
    } else {
      const errData = await res.json();
      throw new Error(errData.error || 'Gagal memproses checkout');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (nama.trim().length < 3) {
      window.Swal.fire('Validasi', 'Nama lengkap harus terdiri dari minimal 3 karakter.', 'warning');
      return;
    }

    const cleanPhone = whatsapp.replace(/\D/g, '');
    const phoneRegex = /^(0|62)[0-9]{8,13}$/;
    if (!phoneRegex.test(cleanPhone)) {
      window.Swal.fire('Validasi', 'Format nomor WhatsApp tidak valid. Pastikan nomor diawali dengan 0 atau 62 dan berisi 10-15 digit angka.', 'warning');
      return;
    }

    setLoading(true);

    try {
      const nota = generateNotaNumber();
      if (checkoutSystem === 'wa') {
        const adminNumber = formatPhone(adminWhatsapp);
        const message = buildWhatsAppMessage(nota);
        window.open(`https://wa.me/${adminNumber}?text=${message}`, '_blank');
        await submitOrder(nota);
      } else {
        await submitOrder(nota);
      }

      clearCart();
      setSuccess(true);
    } catch (err) {
      window.Swal.fire('Gagal', err.message || 'Gagal memproses checkout. Silakan coba lagi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneDisplay = (phone) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('62')) return '0' + digits.slice(2);
    return digits;
  };

  if (success) {
    return (
      <section className="checkout-success-page" style={{ padding: '140px 0 100px', background: 'var(--bg)', textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(15,81,50,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '36px' }}>
            <i className={`fas ${checkoutSystem === 'wa' ? 'fa-comment-dots' : 'fa-check-double'}`}></i>
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)', marginBottom: '16px' }}>
            {checkoutSystem === 'wa' ? 'Pesanan Tersimpan!' : 'Pesanan Berhasil Dibuat!'}
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '32px' }}>
            {checkoutSystem === 'wa' ? (
              <>
                Halaman WhatsApp akan terbuka secara otomatis. Silakan kirim pesanan Anda ke nomor{' '}
                <strong>{formatPhoneDisplay(adminWhatsapp)}</strong> untuk dikonfirmasi oleh Admin.
              </>
            ) : (
              'Terima kasih telah berbelanja di Koperasi UTM. Pesanan Anda telah masuk ke sistem kami dan akan segera diproses oleh Admin. Silakan tunggu konfirmasi lebih lanjut.'
            )}
          </p>
          <button onClick={() => navigate('/katalog')} className="btn-primary" style={{ padding: '14px 32px', fontSize: '15px' }}>
            Kembali ke Katalog
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Konfirmasi Pemesanan</h1>
          <p>Lengkapi data diri Anda untuk menyelesaikan pesanan</p>
          <div className="breadcrumb">
            <span>Beranda</span>
            <i className="fas fa-chevron-right"></i>
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Checkout</span>
          </div>
        </div>
      </section>

      <section className="checkout-page" style={{ padding: '60px 0 100px', background: 'var(--bg)' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div className="checkout-grid-mobile">
          
          {/* BUYER DATA FORM */}
          <div style={{ background: 'var(--card-bg)', padding: '40px', borderRadius: '16px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <i className="fas fa-user-edit" style={{ marginRight: '8px', color: 'var(--primary)' }}></i> Data Diri Pembeli
            </h3>
            
            <form id="checkout-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>Nama</label>
                <input 
                  type="text" 
                  placeholder="Masukkan nama Anda"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  required
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-strong)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>Nomor WhatsApp (Aktif)</label>
                <input 
                  type="text" 
                  placeholder="Contoh: 081234567890"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-strong)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' }}
                />
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Pastikan nomor WhatsApp aktif untuk menerima update status pesanan dari Admin.</p>
              </div>
            </form>
          </div>

          {/* ORDER SUMMARY */}
          <div style={{ background: 'var(--card-bg)', padding: '40px', borderRadius: '16px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <i className="fas fa-shopping-cart" style={{ marginRight: '8px', color: 'var(--primary)' }}></i> Ringkasan Belanja
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', flex: 1, maxHeight: '350px', overflowY: 'auto', paddingRight: '8px' }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <LazyImage
                    src={getApiUrl(item.gambar) || '/img/placeholder.jpg'}
                    alt={item.nama}
                    style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border)' }}
                    wrapperStyle={{ width: '56px', height: '56px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', margin: '0 0 4px 0' }}>{item.nama}</h4>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.qty} x Rp {item.harga.toLocaleString()}</span>
                  </div>
                  <strong style={{ fontSize: '14px', color: 'var(--text)' }}>Rp {(item.harga * item.qty).toLocaleString()}</strong>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '2px solid var(--border)', paddingTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>Total</span>
                <strong style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>Rp {cartTotal.toLocaleString()}</strong>
              </div>
              
              <button 
                type="submit" 
                form="checkout-form"
                className="btn-primary" 
                disabled={loading}
                style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: 600, justifyContent: 'center', display: 'flex', alignItems: 'center' }}
              >
                {loading ? (
                  <><i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Memproses...</>
                ) : (
                  <><i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i> Konfirmasi & Bayar</>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  </>
  );
};

export default Checkout;
