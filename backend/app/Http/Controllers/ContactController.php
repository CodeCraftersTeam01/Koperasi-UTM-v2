<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Models\Setting;

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

        $data = [
            'nama' => $request->nama,
            'email' => $request->email,
            'subjek' => $request->subjek ?: 'Tidak ada subjek',
            'pesan' => $request->pesan
        ];

        try {
            Mail::send('emails.contact', $data, function ($message) use ($targetEmail, $data) {
                $message->to($targetEmail)
                        ->subject('Pesan dari Kontak Website Koperasi UTM: ' . $data['subjek'])
                        ->replyTo($data['email'], $data['nama']);
            });

            return response()->json(['success' => true, 'message' => 'Pesan berhasil dikirim.']);
        } catch (\Exception $e) {
            // Log::error('Failed to send contact email: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Gagal mengirim pesan, silakan coba lagi nanti.'], 500);
        }
    }
}
