<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Models\Setting;
use App\Mail\ContactMail;

class ContactController extends Controller
{
    public function send(Request $request)
    {
        $this->validate($request, [
            'nama' => 'required|string|max:100',
            'email' => 'required|email|max:100',
            'subjek' => 'nullable|string|max:200',
            'pesan' => 'required|string'
        ]);

        $setting = Setting::where('key', 'kontak_email')->first();
        $targetEmail = $setting ? $setting->value : null;

        if (!$targetEmail) {
            return response()->json(['success' => false, 'message' => 'Alamat email tujuan belum diatur di sistem.'], 400);
        }

        $host = env('MAIL_HOST');
        $username = env('MAIL_USERNAME');
        $password = env('MAIL_PASSWORD');

        if (!$host || !$username || !$password) {
            return response()->json(['success' => false, 'message' => 'Konfigurasi SMTP belum lengkap.'], 500);
        }

        $subjek = $request->subjek ?: 'Tidak ada subjek';

        try {
            Mail::to($targetEmail)->send(
                new ContactMail($request->nama, $request->email, $subjek, $request->pesan)
            );

            return response()->json(['success' => true, 'message' => 'Pesan berhasil dikirim.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Gagal mengirim pesan: ' . $e->getMessage()], 500);
        }
    }
}
