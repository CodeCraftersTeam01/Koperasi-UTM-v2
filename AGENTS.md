# Koperasi UTM — Agent Guide

## Structure

```
backend/   Laravel Lumen 10.x (PHP 8.1+)
frontend/  React 19 + Vite 8 (plain JSX, no TypeScript)
```

## Dev commands

```bash
# Frontend (from frontend/)
npm run dev      # Vite dev server (port 5173 default)
npm run build    # Vite production build
npm run lint     # oxlint (NOT ESLint)

# Backend (from backend/)
php -S localhost:8000 -t public   # Lumen dev server
php vendor/bin/phpunit            # run all tests
php artisan migrate               # run DB migrations
```

## API conventions

- Frontend reads `VITE_API_URL` (default `http://localhost:8000`) from `frontend/.env`
- Auth token stored in `localStorage` as `kopma_admin_token`, sent as `Authorization: Bearer <token>`
- Also stores `kopma_admin_user` (username) and `kopma_admin_role` (`admin`|`petugas`) in localStorage
- On 401, frontend auto-clears localStorage and redirects to `/admin/login`
- `petugas` role: restricted from settings, pengurus, and users admin pages
- Lumen auth matches `api_token` column on `users` table
- `ProdukController@update` and `PengurusController@update` use **POST** for multipart/form-data uploads
- Uploaded files stored in `public/upload/` (gallery: `public/upload/gallery/`)
- Public routes: `GET /api/kategori`, `GET /api/produk`, `POST /api/login`, `GET /api/pengurus`, `GET /api/settings`, `POST /api/checkout`
- Admin routes (under `auth` middleware): CRUD for kategori, produk, users, pengurus, settings; bulk-delete/bulk-archive use POST
- CORS middleware is global, allows all origins

## Testing

- Backend only: PHPUnit with `vendor/bin/phpunit` from `backend/`
- Frontend: no test framework configured

## Notable quirks

- Lumen does not support all Artisan commands from full Laravel; use `php -S` for dev serving
- No Prettier/ESLint — oxlint is the only frontend linter
- No CI/CD, no pre-commit hooks, no type checking
- SweetAlert2 and AOS (Animate On Scroll) loaded via CDN in `frontend/index.html`
- Frontend uses `.jsx` extension throughout (no TypeScript)
- No React auth context; auth handled imperatively via localStorage reads in `AdminLayout.jsx`
- Cart persisted in `localStorage` as `kopma_cart` via `CartContext.jsx`
- Frontend API layer: `apiFetch` (native fetch wrapper, not Axios) in `src/utils/api.js`
- Backend requires env vars beyond defaults: `FONNTE_TOKEN`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`
