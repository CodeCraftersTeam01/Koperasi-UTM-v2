import { adminPath, isAdminPath } from '../config/admin';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const LOCAL_HOSTS = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]|::1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)$/i;

const svgDataUri = (svg) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}`;

export const PLACEHOLDER_IMG = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#f2f0eb"/>
  <g fill="none" stroke="#c9c5bb" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="112" y="128" width="176" height="144" rx="14"/>
    <path d="M112 232l44-44 34 34 40-40 58 58"/>
  </g>
  <circle cx="168" cy="176" r="16" fill="#c9c5bb"/>
  <text x="200" y="316" text-anchor="middle" font-family="Inter,Segoe UI,sans-serif"
        font-size="22" fill="#9a968c">Gambar belum tersedia</text>
</svg>`);

export const AVATAR_IMG = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#f2f0eb"/>
  <circle cx="100" cy="78" r="34" fill="#c9c5bb"/>
  <path d="M100 124c-38 0-68 24-68 54v22h136v-22c0-30-30-54-68-54z" fill="#c9c5bb"/>
</svg>`);

export const getApiUrl = (path) => {
  if (!path) return '';

  const raw = String(path).trim();
  if (!raw) return '';

  if (raw.startsWith('data:')) return raw;

  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      if (LOCAL_HOSTS.test(url.hostname)) {
        return `${BASE_URL}${url.pathname}${url.search}`;
      }
      return raw;
    } catch {
      return raw;
    }
  }

  if (raw.startsWith('//')) {
    return `${window.location.protocol}${raw}`;
  }

  const clean = raw.replace(/^\/+/, '');
  if (!clean) return '';

  return `${BASE_URL}/${clean}`;
};

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('kopma_admin_token');
  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('kopma_admin_token');
    localStorage.removeItem('kopma_admin_user');
    localStorage.removeItem('kopma_admin_role');
    localStorage.removeItem('kopma_admin_login_time');
    if (isAdminPath(window.location.pathname) && window.location.pathname !== adminPath('login')) {
      window.location.href = adminPath('login');
    }
  }

  return response;
};
