import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import AdminLayout from '../../components/AdminLayout';
import { apiFetch, getApiUrl } from '../../utils/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiFetch('/api/stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const renderSkeletonCards = () => (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="admin-stat-card">
          <div className="skeleton skeleton-img"></div>
          <div className="admin-stat-info" style={{ flex: 1 }}>
            <div className="skeleton skeleton-text short"></div>
            <div className="skeleton skeleton-text" style={{ height: '24px' }}></div>
          </div>
        </div>
      ))}
    </>
  );

  const renderSkeletonCharts = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
      {/* Skeleton Chart */}
      <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '20px' }}><div className="skeleton skeleton-text short" style={{ height: '20px' }}></div></h3>
        <div style={{ height: '250px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="skeleton" style={{ width: '200px', height: '200px', borderRadius: '50%' }}></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
          <div className="skeleton skeleton-text short" style={{ width: '60px' }}></div>
          <div className="skeleton skeleton-text short" style={{ width: '60px' }}></div>
        </div>
      </div>

      {/* Skeleton List */}
      <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '20px' }}><div className="skeleton skeleton-text short" style={{ height: '20px' }}></div></h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--border)', borderRadius: '16px' }}>
              <div className="skeleton skeleton-img" style={{ width: '48px', height: '48px', borderRadius: '10px' }}></div>
              <div style={{ flex: 1 }}>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text short"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout title="Dashboard">
      <div className="admin-stats">
        {loadingStats ? renderSkeletonCards() : stats ? (
          <>
            <div className="admin-stat-card">
              <div className="admin-stat-icon"><i className="fas fa-box"></i></div>
              <div className="admin-stat-info">
                <h4>Total Produk</h4>
                <strong>{stats.totalProduk}</strong>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-icon"><i className="fas fa-tags"></i></div>
              <div className="admin-stat-info">
                <h4>Total Kategori</h4>
                <strong>{stats.totalKategori}</strong>
              </div>
            </div>
            {stats.komposisiKategori && stats.komposisiKategori.slice(0, 2).map((kat, index) => (
              <div className="admin-stat-card" key={index}>
                <div className="admin-stat-icon"><i className="fas fa-star"></i></div>
                <div className="admin-stat-info">
                  <h4>Produk {kat.name}</h4>
                  <strong>{kat.value}</strong>
                </div>
              </div>
            ))}
            <div className="admin-stat-card">
              <div className="admin-stat-icon"><i className="fas fa-minus-circle"></i></div>
              <div className="admin-stat-info">
                <h4>Produk Non Aktif</h4>
                <strong>{stats.arsipCount}</strong>
              </div>
            </div>
          </>
        ) : (
          <div style={{ color: 'var(--text-muted)' }}>Gagal memuat statistik.</div>
        )}
      </div>

      {loadingStats ? renderSkeletonCharts() : stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {/* Chart Section */}
          <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '20px' }}><i className="fas fa-chart-pie" style={{ color: 'var(--primary)', marginRight: '8px' }}></i> Komposisi Produk</h3>
            <div style={{ height: '250px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.komposisiKategori || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(stats.komposisiKategori || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#0F5132', '#D4AF37', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 6]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px', flexWrap: 'wrap' }}>
              {(stats.komposisiKategori || []).map((kat, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: ['#0F5132', '#D4AF37', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 6] }}></div> {kat.name}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Products List */}
          <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}><i className="fas fa-clock" style={{ color: 'var(--primary)', marginRight: '8px' }}></i> Produk Terbaru</h3>
              <Link to="/admin/produk" style={{ fontSize: '13px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Lihat Semua <i className="fas fa-arrow-right" style={{ fontSize: '10px' }}></i></Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.produkTerbaru && stats.produkTerbaru.length > 0 ? (
                stats.produkTerbaru.map((p) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--border)', borderRadius: '16px', transition: 'all 0.3s ease' }}>
                    {p.gambar ? (
                      <img src={getApiUrl(p.gambar)} alt={p.nama} style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }} loading="lazy" />
                    ) : (
                      <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}><i className="fas fa-box"></i></div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{p.nama}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{p.kategori} &bull; Rp {Number(p.harga || 0).toLocaleString('id-ID')}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '14px' }}>Belum ada produk.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Dashboard;
