<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pengurus;

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
            'foto' => 'nullable|image|max:5120', // max 5MB
        ]);

        $fotoPath = null;
        if ($request->hasFile('foto') && $request->file('foto')->isValid()) {
            $file = $request->file('foto');
            $filename = 'pengurus_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move(base_path('public/upload'), $filename);
            $fotoPath = 'upload/' . $filename;
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
            'foto' => 'nullable|image|max:5120',
        ]);

        $fotoPath = $pengurus->foto;
        if ($request->hasFile('foto') && $request->file('foto')->isValid()) {
            // Delete old file if exists
            if ($fotoPath && file_exists(base_path('public/' . $fotoPath))) {
                @unlink(base_path('public/' . $fotoPath));
            }
            $file = $request->file('foto');
            $filename = 'pengurus_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move(base_path('public/upload'), $filename);
            $fotoPath = 'upload/' . $filename;
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
        if ($pengurus->foto && file_exists(base_path('public/' . $pengurus->foto))) {
            @unlink(base_path('public/' . $pengurus->foto));
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
            if ($p->foto && file_exists(base_path('public/' . $p->foto))) {
                @unlink(base_path('public/' . $p->foto));
            }
            $p->delete();
        }

        return response()->json([
            'message' => 'Pengurus terpilih berhasil dihapus',
        ]);
    }
}
