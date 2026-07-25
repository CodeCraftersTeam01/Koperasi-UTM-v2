<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Produk;

class ProdukController extends Controller
{
    public function index(Request $request)
    {
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
            return response()->json([
                'data' => $data,
                'total' => $total
            ]);
        } elseif ($page !== null) {
            $offset = ($page - 1) * $perPage;
            $data = $query->orderBy('id', 'desc')->offset($offset)->limit($perPage)->get();
            return response()->json([
                'data' => $data,
                'total' => $total,
                'page' => $page,
                'per_page' => $perPage,
                'total_pages' => max(1, ceil($total / $perPage))
            ]);
        } else {
            $data = $query->orderBy('id', 'desc')->get();
            return response()->json($data);
        }
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
            'gambar' => 'nullable|image|max:5120', // Max 5MB
        ]);

        $gambarPath = '';
        if ($request->hasFile('gambar') && $request->file('gambar')->isValid()) {
            $file = $request->file('gambar');
            $filename = uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move(base_path('public/upload'), $filename);
            $gambarPath = 'upload/' . $filename;
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
            'gambar' => 'nullable|image|max:5120',
        ]);

        $gambarPath = $produk->gambar;
        if ($request->hasFile('gambar') && $request->file('gambar')->isValid()) {
            $file = $request->file('gambar');
            $filename = uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move(base_path('public/upload'), $filename);
            $gambarPath = 'upload/' . $filename;
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

        $produk->delete();

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
            'arsip' => 'required|boolean',
        ]);

        $arsip = $request->input('arsip');
        $produk->update(['arsip' => $arsip]);

        $label = $arsip ? 'dinonaktifkan' : 'diaktifkan';

        return response()->json([
            'message' => "Produk berhasil $label",
        ]);
    }

    public function bulkDestroy(Request $request)
    {
        $this->validate($request, [
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:produks,id',
        ]);

        Produk::whereIn('id', $request->input('ids'))->delete();

        return response()->json([
            'message' => 'Produk terpilih berhasil dihapus',
        ]);
    }

}
