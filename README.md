# Koperasi Mahasiswa Universitas Trunojoyo Madura (Koperasi UTM)

Platform profil organisasi dan katalog digital interaktif untuk Koperasi Mahasiswa Universitas Trunojoyo Madura. Sistem ini menyediakan informasi profil kelembagaan, kepengurusan, layanan, serta katalog produk dengan alur pemesanan langsung terintegrasi ke WhatsApp dan panel manajemen konten terpusat.

---

## Daftar Isi
- [Ikhtisar Sistem](#ikhtisar-sistem)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Fitur Utama](#fitur-utama)
- [Struktur Direktori](#struktur-direktori)
- [Panduan Instalasi Lokal](#panduan-instalasi-lokal)
  - [Prasyarat](#prasyarat)
  - [Langkah Setup Backend](#langkah-setup-backend)
  - [Langkah Setup Frontend](#langkah-setup-frontend)
- [Struktur Deployment Hosting](#struktur-deployment-hosting)
- [Ringkasan Endpoint API](#ringkasan-endpoint-api)
- [Kontribusi](#kontribusi)
- [Lisensi](#lisensi)

---

## Ikhtisar Sistem

Koperasi UTM v2 dibangun menggunakan arsitektur decoupled (terpisah antara Single Page Application berbasis React dan REST API berbasis Lumen). Sistem dirancang ringan, responsif, dan mudah dipasang baik pada lingkungan pengembangan lokal maupun hosting bersama (*shared hosting/cPanel*).

---

## Teknologi yang Digunakan

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Animasi & Interaktivitas**: [Framer Motion](https://www.framer.com/motion/)
- **Visualisasi & Grafik**: [Recharts](https://recharts.org/)
- **Notifikasi**: [SweetAlert2](https://sweetalert2.github.io/)
- **Styling**: Vanilla CSS kustom dengan variabel desain terpadu

### Backend
- **Framework**: [Laravel Lumen 10](https://lumen.laravel.com/) (PHP >= 8.1)
- **Database**: MySQL / MariaDB via Eloquent ORM
- **Autentikasi**: Bearer Token Authentication
- **Media Engine**: Native PHP GD/Fileinfo + `PathHelper` universal storage handler

---

## Fitur Utama

### 1. Antarmuka Publik
- **Beranda & Profil**: Menampilkan visi, misi, sejarah, program kerja, dan statistik layanan koperasi.
- **Katalog Produk Interaktif**: Pencarian real-time, filter kategori, subkategori, penandaan status promo, best seller, serta label produk baru.
- **Detail Produk & Keranjang Belanja**: Manajemen kuantitas pesanan dengan kalkulasi otomatis.
- **Direct Checkout WhatsApp**: Pembuatan invoice otomatis dengan format pesan rapi yang langsung terhubung ke nomor admin koperasi.
- **Galeri Kegiatan & Layanan**: Dokumentasi program kerja dan daftar unit usaha koperasi.
- **Struktur Kepengurusan**: Daftar pengurus bertingkat berdasarkan divisi dan urutan jabatan.

### 2. Panel Administrasi
- **Dashboard Metrik**: Ringkasan jumlah produk aktif, kategori, pengurus, dan log transaksi.
- **Kelola Produk**: Tambah, edit, arsip (nonaktifkan), hapus, serta aksi massal (*bulk delete*).
- **Kelola Kategori & Subkategori**: Hierarki kategori yang fleksibel untuk pengelompokan produk.
- **Kelola Pengurus**: Manajemen data personalia dan pengurutan posisi kepengurusan.
- **Setelan Website**: Pengaturan konten profil, kontak resmi, alamat, tautan peta, dan media galeri.
- **Optimasi Media Cerdas**:
  - Kompresi gambar otomatis di sisi peramban (*client-side*) sebelum diunggah untuk menghemat bandwidth.
  - Penyesuaian path otomatis (*multi-environment storage*) yang kompatibel untuk localhost maupun cPanel.

---

## Struktur Direktori

```text
Koperasi-UTM-v2/
├── backend/                   # RESTful API (Laravel Lumen)
│   ├── app/
│   │   ├── Helpers/           # Utility (PathHelper, upload handler)
│   │   ├── Http/Controllers/  # Controller API
│   │   ├── Middleware/        # CORS & Autentikasi
│   │   └── Models/            # Eloquent Data Models
│   ├── bootstrap/             # Inisialisasi aplikasi Lumen
│   ├── database/              # Migrasi & seeder
│   ├── public/                # Public entry point lokal
│   │   └── upload/            # Folder berkas unggahan lokal
│   ├── routes/                # Definisi rute web.php
│   └── composer.json
│
├── frontend/                  # SPA (React + Vite)
│   ├── src/
│   │   ├── components/        # Komponen UI (Navbar, Footer, AdminLayout, dll.)
│   │   ├── pages/             # Halaman publik & panel admin
│   │   ├── utils/             # Helper API fetch & kompresor gambar
│   │   ├── config/            # Konfigurasi rute panel admin
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## Panduan Instalasi Lokal

### Prasyarat
- PHP >= 8.1 dengan ekstensi `pdo_mysql`, `fileinfo`, `gd`, `openssl`, `mbstring`
- Composer
- Node.js >= 18.x dan npm
- MySQL / MariaDB Server

---

### Langkah Setup Backend

1. Buka direktori backend:
   ```bash
   cd backend
   ```

2. Pasang dependensi PHP:
   ```bash
   composer install
   ```

3. Salin berkas lingkungan dan sesuaikan kredensial basis data:
   ```bash
   cp .env.example .env
   ```
   Atur koneksi MySQL di `.env`:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=koperasi_utm
   DB_USERNAME=root
   DB_PASSWORD=
   ```

4. Jalankan migrasi basis data (jika menggunakan migrasi):
   ```bash
   php artisan migrate --seed
   ```

5. Jalankan server backend lokal:
   ```bash
   php -S localhost:8000 -t public
   ```
   *(Atau gunakan Laravel Herd / Valet yang memetakan domain `.test`)*.

---

### Langkah Setup Frontend

1. Buka direktori frontend:
   ```bash
   cd frontend
   ```

2. Pasang paket npm:
   ```bash
   npm install
   ```

3. Konfigurasikan URL API backend pada `.env`:
   ```bash
   cp .env.example .env
   ```
   Isi dengan URL backend lokal Anda:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. Jalankan server pengembangan Vite:
   ```bash
   npm run dev
   ```
   Aplikasi publik dapat diakses melalui `http://localhost:5173`.

---

## Struktur Deployment Hosting

Aplikasi ini telah dioptimalkan untuk arsitektur hosting publik (misal: Apache / cPanel / DirectAdmin) dengan struktur pemisahan dokumen berikut:

```text
/public_html (atau htdocs)/
  ├── index.html               # File hasil build frontend (dist/index.html)
  ├── assets/                  # Bundle JS & CSS hasil build frontend
  ├── .htaccess                # Routing rewrite SPA React
  └── system/                  # Subdirektori endpoint backend API
      ├── index.php            # Entry point yang memanggil backend/bootstrap/app.php
      ├── upload/              # Folder penyimpanan berkas media publik (chmod 755/777)
      └── backend/             # Folder core Lumen (app, bootstrap, vendor, dll.)
```

Sistem backend dilengkapi kelas `PathHelper` yang secara dinamis mendeteksi keberadaan folder `upload` di level `/system/upload/` dan menyinkronkan media secara aman tanpa memerlukan konfigurasi manual tambahan.

---

## Ringkasan Endpoint API

| Method | Endpoint | Keterangan | Akses |
|---|---|---|---|
| `GET` | `/api/produk` | Daftar produk dengan paginasi & filter | Publik |
| `GET` | `/api/kategori` | Daftar seluruh kategori produk | Publik |
| `GET` | `/api/subkategori` | Daftar subkategori produk | Publik |
| `GET` | `/api/pengurus` | Data bagan pengurus koperasi | Publik |
| `GET` | `/api/setting` | Data konfigurasi profil & informasi web | Publik |
| `POST` | `/api/login` | Autentikasi pengurus/admin koperasi | Publik |
| `POST` | `/api/produk` | Tambah produk baru (beserta gambar) | Admin |
| `POST` | `/api/produk/{id}` | Perbarui data produk | Admin |
| `DELETE`| `/api/produk/{id}` | Hapus produk | Admin |
| `POST` | `/api/pengurus` | Tambah anggota pengurus baru | Admin |
| `POST` | `/api/upload` | Upload berkas media galeri kegiatan | Admin |
| `POST` | `/api/setting` | Perbarui informasi profil & kontak | Admin |

---

## Kontribusi

1. Fork repositori ini.
2. Buat branch fitur baru (`git checkout -b feature/fitur-baru`).
3. Lakukan commit perubahan dengan deskripsi yang jelas (`git commit -m "feat: tambahkan fitur baru"`).
4. Dorong ke branch remote (`git push origin feature/fitur-baru`).
5. Buat Pull Request untuk ditinjau oleh tim pengembang.

---

## Lisensi & Hak Cipta

Hak Cipta (c) 2026 **Koperasi Mahasiswa Universitas Trunojoyo Madura (Koperasi UTM)**. Seluruh hak cipta dilindungi undang-undang (*All Rights Reserved*).

Kode sumber dan aset perangkat lunak ini bersifat **Proprietary (Terbatas)**. Dilarang keras memperjualbelikan, menyalin, memodifikasi, atau mendistribusikan ulang kode sumber ini untuk kepentingan komersial maupun pihak ketiga tanpa izin tertulis resmi dari pemegang hak cipta. Lihat rincian ketentuan hukum pada berkas [LICENSE](LICENSE).
