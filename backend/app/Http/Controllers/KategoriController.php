<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Kategori;

class KategoriController extends Controller
{
    public function index()
    {
        $kategori = Kategori::with('parent')->orderBy('id', 'asc')->get();
        return response()->json($kategori);
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

        return response()->json(['message' => 'Kategori berhasil diperbarui']);
    }

    public function destroy(int $id)
    {
        $kategori = Kategori::find($id);

        if (!$kategori) {
            return response()->json(['error' => 'Kategori tidak ditemukan'], 404);
        }

        $kategori->delete();

        return response()->json(['message' => 'Kategori berhasil dihapus']);
    }

    public function bulkDestroy(Request $request)
    {
        $this->validate($request, [
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:kategori,id',
        ]);

        Kategori::whereIn('id', $request->input('ids'))->delete();

        return response()->json([
            'message' => 'Kategori terpilih berhasil dihapus',
        ]);
    }
}
