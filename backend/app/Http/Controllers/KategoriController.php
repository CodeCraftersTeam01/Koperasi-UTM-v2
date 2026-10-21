<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\Kategori;

class KategoriController extends Controller
{
    public function index()
    {
        $cacheHit = Cache::has('api_kategori');
        $kategori = Cache::remember('api_kategori', 86400, function () {
            return Kategori::with('parent')->orderBy('id', 'asc')->get();
        });

        return response()->json($kategori)
            ->header('X-Cache', $cacheHit ? 'HIT' : 'MISS')
            ->header('Cache-Control', 'no-cache, private');
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'nama' => 'required|string|max:100',
            'tipe' => 'required|in:utama,sub',
            'parent_id' => 'nullable|integer|exists:kategori,id',
        ]);

        $data = [
            'nama' => $request->input('nama'),
            'tipe' => $request->input('tipe'),
        ];

        if ($request->has('parent_id')) {
            $data['parent_id'] = $request->input('parent_id');
        }

        $kategori = Kategori::create($data);

        Cache::forget('api_kategori');
        Cache::forget('api_dashboard_stats');

        return response()->json([
            'id' => $kategori->id,
            'message' => 'Kategori berhasil ditambahkan',
        ], 201);
    }

    public function update(Request $request, int $id)
    {
        $kategori = Kategori::find($id);

        if (!$kategori) {
            return response()->json(['error' => 'Kategori tidak ditemukan'], 404);
        }

        $this->validate($request, [
            'nama' => 'required|string|max:100',
            'tipe' => 'required|in:utama,sub',
            'parent_id' => 'nullable|integer|exists:kategori,id',
        ]);

        $data = [
            'nama' => $request->input('nama'),
            'tipe' => $request->input('tipe'),
        ];

        if ($request->has('parent_id')) {
            $data['parent_id'] = $request->input('parent_id');
        } else {
            $data['parent_id'] = null;
        }

        $kategori->update($data);

        Cache::forget('api_kategori');
        Cache::forget('api_dashboard_stats');

        return response()->json(['message' => 'Kategori berhasil diperbarui']);
    }

    public function destroy(int $id)
    {
        $kategori = Kategori::find($id);

        if (!$kategori) {
            return response()->json(['error' => 'Kategori tidak ditemukan'], 404);
        }

        $kategori->delete();

        Cache::forget('api_kategori');
        Cache::forget('api_dashboard_stats');

        return response()->json(['message' => 'Kategori berhasil dihapus']);
    }

    public function bulkDestroy(Request $request)
    {
        $this->validate($request, [
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:kategori,id',
        ]);

        Kategori::whereIn('id', $request->input('ids'))->delete();

        Cache::forget('api_kategori');
        Cache::forget('api_dashboard_stats');

        return response()->json([
            'message' => 'Kategori terpilih berhasil dihapus',
        ]);
    }
}
