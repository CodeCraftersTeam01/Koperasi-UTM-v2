<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserController extends Controller
{
    public function index()
    {
        $users = User::all();
        return response()->json($users);
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'username' => 'required|string|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,petugas'
        ]);

        $user = User::create([
            'username' => $request->input('username'),
            'password' => Hash::make($request->input('password')),
            'role' => $request->input('role')
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Admin berhasil ditambahkan',
            'data' => $user
        ], 201);
    }

    public function update(Request $request, int $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'User tidak ditemukan'], 404);
        }

        $this->validate($request, [
            'username' => 'required|string|unique:users,username,' . $id,
            'password' => 'nullable|string|min:6',
            'role' => 'nullable|in:admin,petugas'
        ]);

        $data = ['username' => $request->input('username')];
        
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->input('password'));
        }
        if ($request->filled('role') && $user->role !== 'super_admin') {
            $data['role'] = $request->input('role');
        }

        $user->update($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Admin berhasil diupdate',
            'data' => $user
        ]);
    }

    public function destroy(int $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'User tidak ditemukan'], 404);
        }

        // Prevent deleting the super_admin
        if ($user->role === 'super_admin') {
            return response()->json(['error' => 'Tidak dapat menghapus super admin'], 400);
        }

        // Prevent deleting the last admin
        if (User::count() <= 1) {
            return response()->json(['error' => 'Tidak dapat menghapus admin terakhir'], 400);
        }

        $user->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Admin berhasil dihapus'
        ]);
    }

    public function bulkDestroy(Request $request)
    {
        $this->validate($request, [
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:users,id',
        ]);

        $ids = $request->input('ids');
        
        // Prevent deleting all users (always keep at least 1 admin)
        $totalUsers = User::count();
        if ($totalUsers - count($ids) <= 0) {
            return response()->json([
                'error' => 'Tidak dapat menghapus semua admin. Harus ada minimal 1 admin.'
            ], 400);
        }

        $usersToDelete = User::whereIn('id', $ids)->get();
        foreach ($usersToDelete as $u) {
            if ($u->role === 'super_admin') {
                return response()->json([
                    'error' => 'Gagal: Salah satu user yang dipilih adalah super admin.'
                ], 400);
            }
        }

        User::whereIn('id', $ids)->delete();

        return response()->json([
            'message' => 'Admin terpilih berhasil dihapus',
        ]);
    }
}
