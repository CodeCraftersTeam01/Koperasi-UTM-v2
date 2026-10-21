<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Cache;
use App\Models\Produk;
use App\Models\Kategori;

class StatsController extends Controller
{
    public function index()
    {
        $cacheHit = Cache::has('api_dashboard_stats');
        $stats = Cache::remember('api_dashboard_stats', 300, function () {
            $totalProduk = Produk::count();
            $totalKategori = Kategori::count();
            $arsipCount = Produk::where('arsip', true)->count();
            
            $semuaKategori = Kategori::where('tipe', 'utama')->pluck('nama');
            $komposisiKategori = [];
            foreach ($semuaKategori as $katName) {
                $komposisiKategori[] = [
                    'name' => $katName,
                    'value' => Produk::where('kategori', $katName)->count()
                ];
            }
            
            $produkTerbaru = Produk::orderBy('id', 'desc')->limit(5)->get();

            return [
                'totalProduk' => $totalProduk,
                'totalKategori' => $totalKategori,
                'arsipCount' => $arsipCount,
                'komposisiKategori' => $komposisiKategori,
                'produkTerbaru' => $produkTerbaru
            ];
        });

        return response()->json($stats)
            ->header('X-Cache', $cacheHit ? 'HIT' : 'MISS');
    }
}
