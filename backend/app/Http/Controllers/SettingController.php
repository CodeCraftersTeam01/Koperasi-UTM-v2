<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\Setting;
use App\Helpers\PathHelper;

class SettingController extends Controller
{
    private $defaults = [];

    public function __construct()
    {
        $this->defaults = [
            'hero_title_accent' => 'Koperasi',
            'hero_title_sub' => 'Universitas Trunojoyo Madura',
            'hero_tagline' => 'Dari Anggota, Oleh Anggota, Untuk Anggota',
            'hero_desc' => 'Menyediakan berbagai kebutuhan mahasiswa dengan pelayanan yang mudah, cepat, dan terpercaya.',
            'about_tag' => 'Tentang Koperasi UTM',
            'about_title' => 'Koperasi Universitas Trunojoyo Madura',
            'about_desc' => 'Koperasi UTM adalah koperasi yang berorientasi pada pelayanan mahasiswa, mendukung ekonomi kreatif mahasiswa, dan menyediakan berbagai kebutuhan sehari-hari di lingkungan kampus. Sebagai wadah pengembangan ekonomi mahasiswa, Koperasi UTM berkomitmen untuk memberikan pelayanan terbaik dengan harga yang terjangkau dan produk yang berkualitas.',
            'about_year' => '1997',
            'about_badge_text' => 'Melayani Mahasiswa',
            'visi' => 'Koperasi UTM menjadi Koperasi Nasional.',
            'misi' => "Memberi Layanan, Menyediakan Produk, Jasa serta Kebutuhan Anggota.\nMembantu Menciptakan Peluang Usaha Bagi Anggota.\nMenjadi Organisasi yang Transparan dengan Good Corporate Governance.",
            'checkout_method' => 'direct',
            'checkout_system' => 'current',
            'admin_whatsapp' => '6285727877235',
            'admin_email' => 'admin@koperasiutm.com',
            'kategori_tampil' => json_encode([
                ['id' => 1, 'nama' => 'Retail', 'icon' => 'fa-shopping-bag', 'deskripsi' => 'Kebutuhan pokok dan perlengkapan perkuliahan sehari-hari.'],
                ['id' => 2, 'nama' => 'Konsinyasi', 'icon' => 'fa-handshake', 'deskripsi' => 'Produk titipan hasil kreasi mahasiswa dan UMKM mitra.'],
                ['id' => 3, 'nama' => 'Lainnya', 'icon' => 'fa-box', 'deskripsi' => 'Aneka ragam produk dan perlengkapan pendukung lainnya.']
            ]),
            'galeri_judul' => 'Galeri Kegiatan',
            'galeri_deskripsi' => 'Dokumentasi berbagai kegiatan dan acara Koperasi UTM.',
            'galeri_items' => json_encode($this->defaultGaleriItems()),
            'layanan_judul' => 'Layanan Koperasi UTM',
            'layanan_deskripsi' => 'Berbagai layanan yang tersedia untuk memenuhi kebutuhan seluruh civitas akademika Universitas Trunojoyo Madura.',
            'layanan_items' => json_encode([
                ['gambar' => 'img/layanan/minimarket.jpeg', 'ikon' => '', 'judul' => 'Mini Market', 'deskripsi' => 'Kebutuhan pokok dan perlengkapan sehari-hari dengan harga terjangkau.'],
                ['gambar' => 'img/layanan/koperasi.jpeg', 'ikon' => '', 'judul' => 'Cafe Time Secret Space', 'deskripsi' => 'Tempat nongkrong santai dengan berbagai menu kopi dan minuman kekinian, serta spot aesthetic untuk foto dan bersantai.'],
                ['gambar' => '', 'ikon' => 'fa-coins', 'judul' => 'Simpan Pinjam', 'deskripsi' => 'Layanan simpan pinjam untuk memenuhi kebutuhan keuangan seluruh civitas akademika Universitas Trunojoyo Madura.'],
                ['gambar' => '', 'ikon' => 'fa-file-invoice', 'judul' => 'Samsat Kampus', 'deskripsi' => 'Layanan pembayaran pajak kendaraan bermotor (Samsat) dengan proses cepat dan mudah di lingkungan kampus.'],
                ['gambar' => '', 'ikon' => 'fa-truck', 'judul' => 'Agen JNT', 'deskripsi' => 'Layanan pengiriman paket dan dokumen melalui agen JNT dengan tarif terjangkau.'],
                ['gambar' => '', 'ikon' => 'fa-bus', 'judul' => 'Ventour Travel', 'deskripsi' => 'Layanan pemesanan tiket travel dan perjalanan untuk kebutuhan liburan dan perjalanan dinas.'],
                ['gambar' => '', 'ikon' => 'fa-mobile-alt', 'judul' => 'Depo Isi Ulang Air', 'deskripsi' => 'Layanan isi ulang air minum yang bersih, higienis, dan terjangkau untuk kebutuhan sehari-hari.'],
            ]),
            'kontak_alamat' => "Sekretariat Koperasi UTM\nGedung Cakra, Kampus Universitas Trunojoyo Madura\nJl. Raya Telang PO BOX 2 Kamal, Bangkalan 69162",
            'kontak_whatsapp' => '+62 811-3300-676',
            'kontak_email' => 'koperasitrunojoyo@gmail.com',
            'kontak_instagram' => '@koperasiutm',
            'kontak_maps_embed' => 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.615379733752!2d112.7271187!3d-7.1172706!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd803dd04854303%3A0xa436f3258944c98f!2sGedung%20Cakra%20-%20UTM!5e0!3m2!1sid!2sid!4v1710000000000',
        ];
    }

    private function defaultGaleriItems()
    {
        $dir = PathHelper::publicPath('upload/gallery');
        if (!is_dir($dir)) {
            $dir = base_path('public/upload/gallery');
        }
        if (!is_dir($dir)) {
            return [];
        }

        $files = glob($dir . '/*.{jpg,jpeg,png,webp,gif}', GLOB_BRACE);
        if (!$files) {
            return [];
        }

        sort($files);

        $defaultTitles = [
            '6a64c517ec8aa' => 'Launching Unit Usaha Koperasi UTM',
            '6a64c5448e1f3' => 'Peringatan Hari Koperasi & Tasyakuran',
            '6a64c5661b697' => 'Stand Promosi Produk Koperasi UTM',
            '6a64c5709b81e' => 'Rapat Anggota Tahunan Koperasi UTM',
            '6a64c58988fb7' => 'Sosialisasi Kewirausahaan Mahasiswa',
            '6a64c5a03c936' => 'Kunjungan Kerja & Bazar Mahasiswa',
            '6a64c5b30ef94' => 'Pelayanan Gerai Kebutuhan Mahasiswa',
            '6a64c5c7701d6' => 'Workshop Pengembangan Usaha Kampus',
            '6a64c5e4de77a' => 'Pertemuan Rutin & Rapat Kerja',
            '6a64c62908a63' => 'Diskusi Evaluasi Program Koperasi',
            '6a64c67764192' => 'Pelayanan Toko & Perlengkapan Kuliah',
            '6a64c69c80463' => 'Operasional Toko Koperasi UTM',
            '6a945be0d08ad' => 'Pembinaan Perkoperasian Mahasiswa',
        ];

        $items = [];
        $index = 0;
        foreach ($files as $file) {
            $index++;
            $baseName = pathinfo($file, PATHINFO_FILENAME);
            $name = $defaultTitles[$baseName] ?? 'Dokumentasi Kegiatan Koperasi';
            $items[] = [
                'gambar' => 'upload/gallery/' . basename($file),
                'judul' => $name,
            ];
        }

        return $items;
    }

    public function index()
    {
        $cacheHit = Cache::has('api_settings');
        $merged = Cache::remember('api_settings', 86400, function () {
            $settings = Setting::all()->pluck('value', 'key')->toArray();
            return array_merge($this->defaults, $settings);
        });
        
        return response()->json($merged)
            ->header('X-Cache', $cacheHit ? 'HIT' : 'MISS')
            ->header('Cache-Control', 'no-cache, private');
    }

    public function updateBatch(Request $request)
    {
        $this->validate($request, [
            'settings' => 'required|array',
        ]);

        $settings = $request->input('settings');
        
        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        // Invalidate backend cache
        Cache::forget('api_settings');

        return response()->json([
            'message' => 'Setelan berhasil diperbarui',
        ]);
    }
}
