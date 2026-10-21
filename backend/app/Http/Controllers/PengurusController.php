<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\Pengurus;
use App\Helpers\PathHelper;

class PengurusController extends Controller
{
    public function index()
    {
        $cacheHit = Cache::has('api_pengurus');
        $pengurus = Cache::remember('api_pengurus', 86400, function () {
            return Pengurus::orderBy('level', 'asc')
                            ->orderBy('urutan', 'asc')
                            ->get();
        });

        return response()->json($pengurus)
            ->header('X-Cache', $cacheHit ? 'HIT' : 'MISS')
            ->header('Cache-Control', 'no-cache, private');
    }

    public function store(Request $request)
    {
        $rules = [
            'nama' => 'required|string|max:100',
            'jabatan' => 'required|string|max:100',
            'level' => 'required|integer|in:1,2,3,4',
            'urutan' => 'nullable|integer',
        ];
        if ($request->hasFile('foto')) {
            $rules['foto'] = 'file|mimes:jpeg,png,jpg,gif,svg,webp,bmp,avif|max:10240';
        }
        $this->validate($request, $rules);

        $fotoPath = null;
        if ($request->hasFile('foto') && $request->file('foto')->isValid()) {
            try {
                $fotoPath = PathHelper::saveUpload($request->file('foto'));
            } catch (\Exception $e) {
                return response()->json(['error' => 'Gagal menyimpan foto: ' . $e->getMessage()], 500);
            }
        }

        $pengurus = Pengurus::create([
            'nama' => $request->input('nama'),
            'jabatan' => $request->input('jabatan'),
            'level' => intval($request->input('level')),
            'urutan' => intval($request->input('urutan', 0)),
            'foto' => $fotoPath,
        ]);

        Cache::forget('api_pengurus');

        return response()->json([
            'id' => $pengurus->id,
            'message' => 'Pengurus berhasil ditambahkan',
        ], 201);
    }

    public function update(Request $request, int $id)
    {
        $pengurus = Pengurus::find($id);

        if (!$pengurus) {
            return response()->json(['error' => 'Pengurus tidak ditemukan'], 404);
        }

        $rules = [
            'nama' => 'required|string|max:100',
            'jabatan' => 'required|string|max:100',
            'level' => 'required|integer|in:1,2,3,4',
            'urutan' => 'nullable|integer',
        ];
        if ($request->hasFile('foto')) {
            $rules['foto'] = 'file|mimes:jpeg,png,jpg,gif,svg,webp,bmp,avif|max:10240';
        }
        $this->validate($request, $rules);

        $fotoPath = $pengurus->foto;
        if ($request->hasFile('foto') && $request->file('foto')->isValid()) {
            try {
                $newFoto = PathHelper::saveUpload($request->file('foto'));
                if ($fotoPath && !str_starts_with($fotoPath, 'img/')) {
                    PathHelper::deleteFile($fotoPath);
                }
                $fotoPath = $newFoto;
            } catch (\Exception $e) {
                return response()->json(['error' => 'Gagal menyimpan foto: ' . $e->getMessage()], 500);
            }
        }

        $urutanVal = $request->filled('urutan') ? intval($request->input('urutan')) : ($pengurus->urutan ?? 0);

        $pengurus->update([
            'nama' => $request->input('nama'),
            'jabatan' => $request->input('jabatan'),
            'level' => intval($request->input('level')),
            'urutan' => $urutanVal,
            'foto' => $fotoPath,
        ]);

        Cache::forget('api_pengurus');

        return response()->json(['message' => 'Pengurus berhasil diperbarui']);
    }

    public function destroy(int $id)
    {
        $pengurus = Pengurus::find($id);

        if (!$pengurus) {
            return response()->json(['error' => 'Pengurus tidak ditemukan'], 404);
        }

        // Delete photo file if uploaded (do not delete built-in img/)
        if ($pengurus->foto && !str_starts_with($pengurus->foto, 'img/')) {
            PathHelper::deleteFile($pengurus->foto);
        }

        $pengurus->delete();

        Cache::forget('api_pengurus');

        return response()->json(['message' => 'Pengurus berhasil dihapus']);
    }

    public function reorder(Request $request)
    {
        $this->validate($request, [
            'items' => 'required|array',
            'items.*.id' => 'required|integer|exists:pengurus,id',
            'items.*.urutan' => 'required|integer',
        ]);

        foreach ($request->input('items') as $item) {
            Pengurus::where('id', $item['id'])->update(['urutan' => $item['urutan']]);
        }

        Cache::forget('api_pengurus');

        return response()->json(['message' => 'Urutan berhasil diperbarui']);
    }

    public function bulkDestroy(Request $request)
    {
        $this->validate($request, [
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:pengurus,id',
        ]);

        $ids = $request->input('ids');
        $pengurusList = Pengurus::whereIn('id', $ids)->get();

        foreach ($pengurusList as $p) {
            if ($p->foto) {
                PathHelper::deleteFile($p->foto);
            }
            $p->delete();
        }

        Cache::forget('api_pengurus');

        return response()->json([
            'message' => 'Pengurus terpilih berhasil dihapus',
        ]);
    }
}
