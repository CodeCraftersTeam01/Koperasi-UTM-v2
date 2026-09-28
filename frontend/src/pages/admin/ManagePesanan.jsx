import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { apiFetch } from '../../utils/api';

const ManagePesanan = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await apiFetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Real-time polling every 10 seconds
    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (id, currentStatus) => {
    const statuses = ['pending', 'proses', 'selesai', 'batal'];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];

    try {
      const res = await apiFetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: nextStatus })
      });

      if (res.ok) {
        fetchOrders();
      } else {
        window.Swal.fire('Gagal', 'Gagal memperbarui status', 'error');
      }
    } catch (err) {
      console.error('Error updating order:', err);
      window.Swal.fire('Koneksi Gagal', 'Terjadi kesalahan jaringan', 'error');
    }
  };

  const handleDelete = async (id) => {
    window.Swal.fire({
      title: 'Yakin ingin menghapus?',
      text: 'Pesanan yang dihapus tidak dapat dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6C757D',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        const res = await apiFetch(`/api/orders/${id}`, {
          method: 'DELETE'
        });

        if (res.ok) {
          window.Swal.fire('Terhapus!', 'Pesanan berhasil dihapus.', 'success');
          fetchOrders();
        } else {
          window.Swal.fire('Gagal', 'Gagal menghapus pesanan', 'error');
        }
      } catch (err) {
        console.error('Error deleting order:', err);
        window.Swal.fire('Koneksi Gagal', 'Terjadi kesalahan jaringan', 'error');
      }
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="badge badge-accent"><i className="fas fa-clock"></i> Pending</span>;
      case 'proses': return <span className="badge badge-primary"><i className="fas fa-spinner fa-spin"></i> Diproses</span>;
      case 'selesai': return <span className="badge" style={{ background: 'rgba(0, 117, 74, 0.08)', color: 'var(--primary)', border: '1px solid rgba(0, 117, 74, 0.25)' }}><i className="fas fa-check-circle"></i> Selesai</span>;
      case 'batal': return <span className="badge badge-premium"><i className="fas fa-times-circle"></i> Batal</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  // Filter orders based on search query (name or order ID)
  const filteredOrders = orders.filter(order => {
    const q = searchQuery.toLowerCase();
    return (
      order.nama.toLowerCase().includes(q) ||
      (order.nomor_nota || '').toString().includes(q) ||
      order.id.toString().includes(q) ||
      order.whatsapp.includes(q)
    );
  });

  return (
    <AdminLayout title="Kelola Pesanan Masuk">
      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h3>
            <i className="fas fa-shopping-cart" style={{ color: 'var(--primary)', marginRight: '8px' }}></i> 
            Daftar Pesanan Masuk
          </h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={fetchOrders} className="btn-outline btn-sm">
              <i className="fas fa-sync-alt"></i> Refresh Manual
            </button>
          </div>
        </div>

        <div className="admin-search-wrap" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <input 
            type="text" 
            placeholder="Cari berdasarkan nama, WhatsApp, atau ID pesanan..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', maxWidth: '420px', padding: '10px 16px', border: '1px solid var(--border-strong)', borderRadius: '100px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' }}
          />
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Total: <strong>{filteredOrders.length} pesanan</strong>
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '24px', marginBottom: '10px' }}></i>
            <p>Memuat data pesanan...</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '130px' }}>No Nota</th>
                  <th>Tanggal</th>
                  <th>Pelanggan</th>
                  <th>Daftar Belanja</th>
                  <th>Total Harga</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      Tidak ada pesanan yang sesuai pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.id}>
                      <td><strong>#{order.nomor_nota || order.id}</strong></td>
                      <td>{new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{order.nama}</div>
                        <a 
                          href={`https://wa.me/${order.whatsapp}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}
                        >
                          <i className="fab fa-whatsapp" style={{ color: '#25D366' }}></i> {order.whatsapp}
                        </a>
                      </td>
                      <td>
                        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                          {(order.items || []).map((item, idx) => (
                            <li key={idx}>
                              <strong>{item.nama}</strong> <span style={{ fontSize: '11px' }}>(x{item.qty})</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--primary)' }}>
                          Rp {Number(order.total_harga).toLocaleString('id-ID')}
                        </strong>
                      </td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="admin-btn-sm admin-btn-edit" 
                          onClick={() => handleUpdateStatus(order.id, order.status)} 
                          title="Ubah Status (Pending -> Proses -> Selesai -> Batal)"
                          style={{ marginRight: '6px' }}
                        >
                          <i className="fas fa-exchange-alt"></i> Status
                        </button>
                        <button 
                          className="admin-btn-sm admin-btn-delete"
                          onClick={() => handleDelete(order.id)}
                          title="Hapus Pesanan"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManagePesanan;
