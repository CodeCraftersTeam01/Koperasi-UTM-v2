<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // Support email (primary) with fallback to username for backward compatibility
        if (!$request->has('email') && $request->has('username')) {
            $request->merge(['email' => $request->input('username')]);
        }

        $this->validate($request, [
            'email' => 'required|string',
            'password' => 'required|string',
        ]);

        $identifier = trim($request->input('email'));

        $user = User::where('email', $identifier)
            ->orWhere('username', $identifier)
            ->first();

        // Convenience check if admin email variant was entered
        if (!$user && in_array(strtolower($identifier), [
            'admin@koperasi-utm.com',
            'superadmin@koperasiutm.com',
            'superadmin@koperasi-utm.com',
            'admin@koperasiutm.com'
        ])) {
            $user = User::where('username', 'superadmin')->orWhere('role', 'super_admin')->first();
        }

        if ($user && Hash::check($request->input('password'), $user->password)) {
            $token = bin2hex(random_bytes(30));
            $user->update([
                'api_token' => $token,
                'token_created_at' => date('Y-m-d H:i:s'),
            ]);

            return response()->json([
                'status' => 'success',
                'email' => $user->email ?? $user->username,
                'username' => $user->username,
                'role' => $user->role,
                'api_token' => $token,
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Email atau password salah',
        ], 401);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $user->update(['api_token' => null, 'token_created_at' => null]);
        }
        return response()->json(['status' => 'success', 'message' => 'Logout berhasil']);
    }
}
