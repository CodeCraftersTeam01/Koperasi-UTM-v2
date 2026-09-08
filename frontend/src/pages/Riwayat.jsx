import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch, getApiUrl } from '../utils/api';

const Riwayat = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrderHistory = async () => {
    const savedOrders = JSON.parse(localStorage.getItem('kopma_user_orders') || '[]');
    if (savedOrders.length === 0) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      const res = await apiFetch(`/api/orders/track?ids=${savedOrders.join(',')}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch tracking details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchOrderHistory();

    // Poll for status update in real-time every 10 seconds
    const interval = setInterval(() => {
      fetchOrderHistory();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span style={{ background: '#fef3c7', color: '#92400e', padding: '6px 12px', borderRadius: '100px', fontSize: '13px', fontWeight: 600 }}><i className="fas fa-clock"></i> Pending</span>;
      case 'proses':
        return <span style={{ background: '#dbeafe', color: '#1e40af', padding: '6px 12px', borderRadius: '100px', fontSize: '13px', fontWeight: 600 }}><i className="fas fa-spinner fa-spin"></i> Diproses</span>;
      case 'selesai':
        return <span style={{ background: '#d1fae5', color: '#065f46', padding: '6px 12px', borderRadius: '100px', fontSize: '13px', fontWeight: 600 }}><i className="fas fa-check-circle"></i> Selesai</span>;
      case 'batal':
        return <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '6px 12px', borderRadius: '100px', fontSize: '13px', fontWeight: 600 }}><i className="fas fa-times-circle"></i> Batal</span>;
      default:
        return <span style={{ background: 'var(--border)', color: 'var(--text-muted)', padding: '6px 12px', borderRadius: '100px', fontSize: '13px' }}>{status}</span>;
    }
  };

  return (
    <>
      {/* PAGE HERO */}
      <section className="page-hero">
        <div className="container">
          <h1>Riwayat Belanja</h1>
          <p>Lacak status pemesanan barang Anda secara real-time</p>
          <div className="breadcrumb">
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Beranda</span>
            <i className="fas fa-chevron-right"></i>
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Riwayat Pesanan</span>
          </div>
        </div>
      </section>

      {/* HISTORY CONTAINER */}
      <section className="history-page" style={{ padding: '60px 0 100px', background: 'var(--bg)', minHeight: '60vh' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', marginBottom: '16px', color: 'var(--primary)' }}></i>
              <p style={{ fontSize: '16px' }}>Memuat riwayat transaksi Anda...</p>
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', background: 'var(--card-bg)', borderRadius: '16px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0,0,0,0.02)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '36px' }}>
                <i className="fas fa-receipt"></i>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>Belum Ada Transaksi</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', maxWidth: '360px', marginInline: 'auto' }}>
                Anda belum melakukan pembelian apa pun. Silakan jelajahi katalog produk kami untuk memulai belanja!
              </p>
              <Link to="/katalog" className="btn-primary" style={{ display: 'inline-flex', padding: '12px 28px' }}>
                Mulai Belanja
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Menampilkan <strong>{orders.length}</strong> pesanan terakhir di perangkat ini.</span>
                <button onClick={fetchOrderHistory} className="btn-outline btn-sm" style={{ padding: '6px 12px', fontSize: '12px' }}>
                  <i className="fas fa-sync-alt"></i> Segarkan Status
                </button>
              </div>

              {orders.map((order) => (
                <div 
                  key={order.id} 
                  style={{ 
                    background: 'var(--card-bg)', 
                    padding: '24px', 
                    borderRadius: '16px', 
                    boxShadow: 'var(--shadow)', 
                    border: '1px solid var(--border)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '16px' 
                  }}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Nomor Pesanan</span>
                      <strong style={{ fontSize: '16px', color: 'var(--text)' }}>#{order.nomor_nota || order.id}</strong>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Tanggal Pemesanan</span>
                      <span style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 500 }}>
                        {new Date(order.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '14px', color: 'var(--text)' }}>{item.nama}</strong>
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: '8px' }}>x{item.qty}</span>
                        </div>
                        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                          Rp {(item.harga * item.qty).toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Card Footer */}
                  <div 
                    style={{ 
                      borderTop: '1px solid var(--border)', 
                      paddingTop: '16px', 
                      marginTop: '8px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Total Pembayaran</span>
                      <strong style={{ fontSize: '18px', color: 'var(--primary)', fontWeight: 800 }}>
                        Rp {Number(order.total_harga).toLocaleString('id-ID')}
                      </strong>
                    </div>
                    <div>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>
    </>
  );
};

export default Riwayat;
