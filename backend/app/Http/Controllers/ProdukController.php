<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\Produk;
use App\Helpers\PathHelper;

class ProdukController extends Controller
{
    private function invalidateCache()
    {
        Cache::increment('api_produk_version');
        Cache::forget('api_dashboard_stats');
    }

    public function index(Request $request)
    {
        $version = Cache::get('api_produk_version', 1);
        $cacheKey = 'api_produk_v' . $version . '_' . md5(json_encode($request->all()));
        $cacheHit = Cache::has($cacheKey);

        $result = Cache::remember($cacheKey, 3600, function () use ($request) {
            $search = trim($request->input('search', ''));
            $page = $request->has('page') ? max(1, intval($request->input('page'))) : null;
            $perPage = max(1, intval($request->input('per_page', 7)));

            $query = Produk::query();

            if ($request->has('arsip')) {
                $query->where('arsip', intval($request->input('arsip')));
            }

            if ($search !== '') {
                $query->where(function ($q) use ($search) {
                    $q->where('nama', 'LIKE', '%' . $search . '%')
                      ->orWhere('kategori', 'LIKE', '%' . $search . '%')
                      ->orWhere('deskripsi', 'LIKE', '%' . $search . '%')
                      ->orWhere('tag', 'LIKE', '%' . $search . '%');
                });
            }

            $total = $query->count();

            if ($search !== '') {
                // Native code did not limit when searching
                $data = $query->orderBy('id', 'desc')->get();
                return [
                    'data' => $data,
                    'total' => $total
                ];
            } elseif ($page !== null) {
                $offset = ($page - 1) * $perPage;
                $data = $query->orderBy('id', 'desc')->offset($offset)->limit($perPage)->get();
                return [
                    'data' => $data,
                    'total' => $total,
                    'page' => $page,
                    'per_page' => $perPage,
                    'total_pages' => max(1, ceil($total / $perPage))
                ];
            } else {
                return $query->orderBy('id', 'desc')->get();
            }
        });

        return response()->json($result)
            ->header('X-Cache', $cacheHit ? 'HIT' : 'MISS')
            ->header('Cache-Control', 'no-cache, private');
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'nama' => 'required|string|max:200',
            'harga' => 'required|integer|min:0',
            'tag' => 'nullable|string|max:50',
            'kategori' => 'required|string|max:100',
            'subkategori' => 'nullable|string|max:100',
            'deskripsi' => 'nullable|string',
            'gambar' => 'nullable|file|mimes:jpeg,png,jpg,gif,svg,webp,bmp,avif|max:10240', // Max 10MB
        ]);

        $gambarPath = '';
        if ($request->hasFile('gambar') && $request->file('gambar')->isValid()) {
            try {
                $gambarPath = PathHelper::saveUpload($request->file('gambar'));
            } catch (\Exception $e) {
                return response()->json(['error' => 'Gagal menyimpan gambar: ' . $e->getMessage()], 500);
            }
        }

        $produk = Produk::create([
            'nama' => $request->input('nama'),
            'harga' => $request->input('harga'),
            'tag' => $request->input('tag') ?? '',
            'kategori' => $request->input('kategori'),
            'subkategori' => $request->input('subkategori') ?? '',
            'gambar' => $gambarPath ?: null,
            'deskripsi' => $request->input('deskripsi') ?? '',
            'arsip' => false,
        ]);

        $this->invalidateCache();

        return response()->json([
            'id' => $produk->id,
            'message' => 'Produk berhasil ditambahkan',
        ], 201);
    }

    public function update(Request $request, int $id)
    {
        $produk = Produk::find($id);

        if (!$produk) {
            return response()->json(['error' => 'Produk tidak ditemukan'], 404);
        }

        $this->validate($request, [
            'nama' => 'required|string|max:200',
            'harga' => 'required|integer|min:0',
            'tag' => 'nullable|string|max:50',
            'kategori' => 'required|string|max:100',
            'subkategori' => 'nullable|string|max:100',
            'deskripsi' => 'nullable|string',
            'gambar' => 'nullable|file|mimes:jpeg,png,jpg,gif,svg,webp,bmp,avif|max:10240',
        ]);

        $gambarPath = $produk->gambar;
        if ($request->hasFile('gambar') && $request->file('gambar')->isValid()) {
            try {
                $newGambar = PathHelper::saveUpload($request->file('gambar'));
                if ($gambarPath) {
                    PathHelper::deleteFile($gambarPath);
                }
                $gambarPath = $newGambar;
            } catch (\Exception $e) {
                return response()->json(['error' => 'Gagal menyimpan gambar: ' . $e->getMessage()], 500);
            }
        }

        $produk->update([
            'nama' => $request->input('nama'),
            'harga' => $request->input('harga'),
            'tag' => $request->input('tag') ?? '',
            'kategori' => $request->input('kategori'),
            'subkategori' => $request->input('subkategori') ?? '',
            'gambar' => $gambarPath,
            'deskripsi' => $request->input('deskripsi') ?? '',
        ]);

        $this->invalidateCache();

        return response()->json([
            'message' => 'Produk berhasil diperbarui',
        ]);
    }

    public function destroy(int $id)
    {
        $produk = Produk::find($id);

        if (!$produk) {
            return response()->json(['error' => 'Produk tidak ditemukan'], 404);
        }

        if ($produk->gambar) {
            PathHelper::deleteFile($produk->gambar);
        }

        $produk->delete();

        $this->invalidateCache();

        return response()->json([
            'message' => 'Produk berhasil dihapus',
        ]);
    }

    public function archive(Request $request, int $id)
    {
        $produk = Produk::find($id);

        if (!$produk) {
            return response()->json(['error' => 'Produk tidak ditemukan'], 404);
        }

        $this->validate($request, [
            'arsip' => 'required',
        ]);

        $arsip = filter_var($request->input('arsip'), FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
        $produk->update(['arsip' => $arsip]);

        $this->invalidateCache();

        $label = $arsip ? 'dinonaktifkan' : 'diaktifkan';

        return response()->json([
            'message' => "Produk berhasil $label",
            'arsip' => $arsip,
        ]);
    }

    public function bulkDestroy(Request $request)
    {
        $this->validate($request, [
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:produk,id',
        ]);

        $produks = Produk::whereIn('id', $request->input('ids'))->get();
        foreach ($produks as $p) {
            if ($p->gambar) {
                PathHelper::deleteFile($p->gambar);
            }
            $p->delete();
        }

        $this->invalidateCache();

        return response()->json([
            'message' => 'Produk terpilih berhasil dihapus',
        ]);
    }

    public function bulkArchive(Request $request)
    {
        $this->validate($request, [
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:produk,id',
            'arsip' => 'required|boolean',
        ]);

        $arsip = (bool) $request->input('arsip');
        Produk::whereIn('id', $request->input('ids'))->update(['arsip' => $arsip]);

        $this->invalidateCache();

        $label = $arsip ? 'dinonaktifkan' : 'diaktifkan';

        return response()->json([
            'message' => "Produk terpilih berhasil $label",
        ]);
    }

}
