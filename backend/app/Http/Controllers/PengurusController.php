<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pengurus;
use App\Helpers\PathHelper;

class PengurusController extends Controller
{
    public function index()
    {
        $pengurus = Pengurus::orderBy('level', 'asc')
                            ->orderBy('urutan', 'asc')
                            ->get();
        return response()->json($pengurus);
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'nama' => 'required|string|max:100',
            'jabatan' => 'required|string|max:100',
            'level' => 'required|integer|in:1,2,3',
            'urutan' => 'required|integer',
            'foto' => 'nullable|file|mimes:jpeg,png,jpg,gif,svg,webp,bmp,avif|max:10240', // max 10MB
        ]);

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
            'urutan' => intval($request->input('urutan')),
            'foto' => $fotoPath,
        ]);

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

        $this->validate($request, [
            'nama' => 'required|string|max:100',
            'jabatan' => 'required|string|max:100',
            'level' => 'required|integer|in:1,2,3',
            'urutan' => 'required|integer',
            'foto' => 'nullable|file|mimes:jpeg,png,jpg,gif,svg,webp,bmp,avif|max:10240',
        ]);

        $fotoPath = $pengurus->foto;
        if ($request->hasFile('foto') && $request->file('foto')->isValid()) {
            try {
                $newFoto = PathHelper::saveUpload($request->file('foto'));
                if ($fotoPath) {
                    PathHelper::deleteFile($fotoPath);
                }
                $fotoPath = $newFoto;
            } catch (\Exception $e) {
                return response()->json(['error' => 'Gagal menyimpan foto: ' . $e->getMessage()], 500);
            }
        }

        $pengurus->update([
            'nama' => $request->input('nama'),
            'jabatan' => $request->input('jabatan'),
            'level' => intval($request->input('level')),
            'urutan' => intval($request->input('urutan')),
            'foto' => $fotoPath,
        ]);

        return response()->json(['message' => 'Pengurus berhasil diperbarui']);
    }

    public function destroy(int $id)
    {
        $pengurus = Pengurus::find($id);

        if (!$pengurus) {
            return response()->json(['error' => 'Pengurus tidak ditemukan'], 404);
        }

        // Delete photo file
        if ($pengurus->foto) {
            PathHelper::deleteFile($pengurus->foto);
        }

        $pengurus->delete();

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

        return response()->json([
            'message' => 'Pengurus terpilih berhasil dihapus',
        ]);
    }
}
