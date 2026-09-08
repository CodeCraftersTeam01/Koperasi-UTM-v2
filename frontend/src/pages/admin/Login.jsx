import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../../utils/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('kopma_admin_token');
    if (token) {
      const loginTime = localStorage.getItem('kopma_admin_login_time');
      if (loginTime) {
        const hoursSinceLogin = (Date.now() - parseInt(loginTime)) / (1000 * 60 * 60);
        if (hoursSinceLogin >= 12) {
          localStorage.removeItem('kopma_admin_token');
          localStorage.removeItem('kopma_admin_user');
          localStorage.removeItem('kopma_admin_role');
          localStorage.removeItem('kopma_admin_login_time');
          return;
        }
      }
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiFetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.status === 200) {
        localStorage.setItem('kopma_admin_token', data.api_token);
        localStorage.setItem('kopma_admin_user', data.username);
        if (data.role) localStorage.setItem('kopma_admin_role', data.role);
        localStorage.setItem('kopma_admin_login_time', Date.now().toString());
        navigate('/admin');
      } else {
        setError(data.message || 'Username atau password salah');
      }
    } catch (err) {
      setError('Koneksi ke backend gagal.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo-box">
              <img src="/img/logo-koperasi.png" alt="Koperasi UTM" />
            </div>
            <h2>Selamat Datang</h2>
            <p>Silakan masuk ke panel administrasi</p>
          </div>
          
          {error && (
            <div className="login-error-msg">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <div className="login-form-group">
              <label htmlFor="username">Username</label>
              <div className="login-input-wrapper">
                <i className="fas fa-user"></i>
                <input 
                  type="text" 
                  id="username" 
                  placeholder="Masukkan username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required 
                />
              </div>
            </div>
            
            <div className="login-form-group">
              <label htmlFor="password">Password</label>
              <div className="login-input-wrapper">
                <i className="fas fa-lock"></i>
                <input 
                  type="password" 
                  id="password" 
                  placeholder="Masukkan password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button type="submit" className="login-btn-submit" disabled={loading}>
              {loading ? (
                <><span className="spinner"></span> Memproses...</>
              ) : (
                <>Masuk <i className="fas fa-arrow-right"></i></>
              )}
            </button>
          </form>

          <div className="login-footer">
            <Link to="/"><i className="fas fa-arrow-left"></i> Kembali ke Beranda</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
