import { adminPath, isAdminPath } from '../config/admin';

const LOCAL_HOSTS = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]|::1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|.*\.test)$/i;

const isUrlLocal = (urlStr) => {
  try {
    const u = new URL(urlStr);
    return LOCAL_HOSTS.test(u.hostname) || u.hostname.endsWith('.test');
  } catch {
    return false;
  }
};

const getBaseUrl = () => {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();

  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    const isViteDev = window.location.port === '5173';

    // 1. Jika berjalan pada Vite dev server (port 5173), gunakan proxy Vite:
    if (isViteDev) {
      if (envUrl && !isUrlLocal(envUrl)) {
        return envUrl.replace(/\/+$/, '');
      }
      return '';
    }

    // 2. Jika disajikan pada domain publik / hosting (bukan localhost):
    // Jangan pernah gunakan URL lokal (.test/localhost) yang mungkin tersisa dari build
    if (!LOCAL_HOSTS.test(hostname)) {
      if (envUrl && !isUrlLocal(envUrl)) {
        return envUrl.replace(/\/+$/, '');
      }
      // Same origin (relative path)
      return '';
    }

    // 3. Jika disajikan pada web server lokal (Laravel Herd *.test atau localhost):
    if (isUrlLocal(envUrl) && !envUrl.includes(hostname)) {
      return window.location.origin;
    }

    if (envUrl) {
      return envUrl.replace(/\/+$/, '');
    }

    return '';
  }

  return envUrl || '';
};

const BASE_URL = getBaseUrl();

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

  const encodePath = (p) => {
    try {
      const [pathPart, queryPart] = p.split('?');
      const encoded = pathPart
        .split('/')
        .map(segment => encodeURIComponent(decodeURIComponent(segment)))
        .join('/');
      return queryPart ? `${encoded}?${queryPart}` : encoded;
    } catch {
      return p;
    }
  };

  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      if (LOCAL_HOSTS.test(url.hostname)) {
        const fullPath = `${url.pathname}${url.search}`;
        const encodedPath = encodePath(fullPath);
        return BASE_URL ? `${BASE_URL}${encodedPath}` : encodedPath;
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

  const encodedClean = encodePath(clean);
  return BASE_URL ? `${BASE_URL}/${encodedClean}` : `/${encodedClean}`;
};

// Client-side in-memory cache store
const clientApiCache = new Map();

/**
 * Invalidate client cache berdasarkan pattern URL atau kosongkan seluruhnya
 */
export const clearApiCache = (pattern = null) => {
  if (!pattern) {
    clientApiCache.clear();
    return;
  }
  for (const key of clientApiCache.keys()) {
    if (key.includes(pattern)) {
      clientApiCache.delete(key);
    }
  }
};

const invalidateRelevantCache = (endpoint) => {
  const ep = endpoint.toLowerCase();
  if (ep.includes('/settings')) {
    clearApiCache('/settings');
  } else if (ep.includes('/pengurus')) {
    clearApiCache('/pengurus');
  } else if (ep.includes('/kategori')) {
    clearApiCache('/kategori');
    clearApiCache('/stats');
    clearApiCache('/produk');
  } else if (ep.includes('/produk')) {
    clearApiCache('/produk');
    clearApiCache('/stats');
  } else if (ep.includes('/users')) {
    clearApiCache('/users');
  } else if (ep.includes('/orders') || ep.includes('/checkout')) {
    clearApiCache('/orders');
    clearApiCache('/pesanan');
    clearApiCache('/stats');
  }
};

export const apiFetch = async (endpoint, options = {}) => {
  const method = (options.method || 'GET').toUpperCase();
  const isGet = method === 'GET';
  const token = typeof window !== 'undefined' ? localStorage.getItem('kopma_admin_token') : null;
  const isAdmin = typeof window !== 'undefined' && (isAdminPath(window.location.pathname) || !!token);
  const shouldSkipCache = options.skipCache === true || options.cache === 'no-store' || !isGet || isAdmin;

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const requestUrl = BASE_URL ? `${BASE_URL}${cleanEndpoint}` : cleanEndpoint;
  const cacheKey = `${method}:${requestUrl}`;

  // 1. Cek Client Cache jika request bertipe GET (hanya untuk pengunjung publik)
  if (!shouldSkipCache) {
    const cached = clientApiCache.get(cacheKey);
    const now = Date.now();
    if (cached && now - cached.timestamp < cached.ttl) {
      // Return simulasi Response standar Fetch dari cache payload (0ms latency, zero API hit)
      return new Response(cached.body, {
        status: cached.status,
        statusText: cached.statusText,
        headers: {
          ...cached.headers,
          'X-Client-Cache': 'HIT',
          'Content-Type': 'application/json',
        },
      });
    }
  }

  const headers = {
    'Accept': 'application/json',
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (isAdmin) {
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    headers['Pragma'] = 'no-cache';
  }

  let response;
  try {
    response = await fetch(requestUrl, {
      ...options,
      cache: isAdmin ? 'no-cache' : (options.cache || 'default'),
      headers,
    });
  } catch (netErr) {
    // Jika fetch gagal dan di hosting (endpoint relatif), coba fallback ke /system/api
    if (!BASE_URL && cleanEndpoint.startsWith('/api/')) {
      try {
        response = await fetch(`/system${cleanEndpoint}`, {
          ...options,
          headers,
        });
      } catch {
        throw netErr;
      }
    } else {
      throw netErr;
    }
  }

  // Fallback transparan jika Apache hosting belum me-rewrite /api ke /system/index.php
  if (response && response.status === 404 && !BASE_URL && cleanEndpoint.startsWith('/api/')) {
    try {
      const fallbackResponse = await fetch(`/system${cleanEndpoint}`, {
        ...options,
        headers,
      });
      if (fallbackResponse.status !== 404) {
        response = fallbackResponse;
      }
    } catch {}
  }

  if (response && response.status === 401) {
    localStorage.removeItem('kopma_admin_token');
    localStorage.removeItem('kopma_admin_user');
    localStorage.removeItem('kopma_admin_role');
    localStorage.removeItem('kopma_admin_login_time');
    if (isAdminPath(window.location.pathname) && window.location.pathname !== adminPath('login')) {
      window.location.href = adminPath('login');
    }
  }

  // 2. Simpan response GET ke Client Cache
  if (!shouldSkipCache && response && response.ok) {
    try {
      const cloned = response.clone();
      const text = await cloned.text();
      
      const getTtl = (ep) => {
        if (options.ttl) return options.ttl;
        if (ep.includes('/settings') || ep.includes('/pengurus') || ep.includes('/kategori')) {
          return 5 * 60 * 1000; // 5 menit
        }
        if (ep.includes('/produk')) {
          return 2 * 60 * 1000; // 2 menit
        }
        return 60 * 1000; // 1 menit default
      };

      clientApiCache.set(cacheKey, {
        body: text,
        timestamp: Date.now(),
        ttl: getTtl(cleanEndpoint),
        status: response.status,
        statusText: response.statusText,
        headers: {
          'X-Client-Cache': 'MISS',
        },
      });
    } catch {}
  } else if (!isGet && response && response.ok) {
    // 3. Mutasi berhasil (POST, PUT, DELETE, PATCH) -> otomatis bersihkan cache client
    invalidateRelevantCache(cleanEndpoint);
    clearApiCache();
  }

  return response;
};

/**
 * Ekstrak pesan error yang user-friendly dari response API Laravel/Lumen
 */
export const extractApiErrorMessage = async (response, defaultMsg = 'Terjadi kesalahan') => {
  try {
    const contentType = response.headers?.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (data) {
        if (data.errors && typeof data.errors === 'object') {
          const firstKey = Object.keys(data.errors)[0];
          const val = data.errors[firstKey];
          return Array.isArray(val) ? val[0] : String(val);
        }
        if (data.error) return data.error;
        if (data.message && data.message !== 'The given data was invalid.') return data.message;
        // Format { gambar: ["The gambar failed to upload."] } langsung tanpa key errors
        for (const val of Object.values(data)) {
          if (Array.isArray(val) && val.length > 0) {
            return `${val[0]}`;
          }
        }
      }
    }
    if (response.status === 413) return 'Ukuran file gambar terlalu besar. Silakan gunakan gambar dengan ukuran lebih kecil.';
    if (response.status === 422) return 'Format gambar atau data tidak valid. Pastikan file berupa JPG, PNG, atau WEBP.';
    if (response.status === 500) return 'Terjadi kesalahan pada server saat memproses gambar.';
  } catch {}
  return defaultMsg;
};
