<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Setting;
use Mailtrap\Helper\ResponseHelper;
use Mailtrap\MailtrapClient;
use Mailtrap\Mime\MailtrapEmail;
use Symfony\Component\Mime\Address;

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

        $apiKey = env('MAILTRAP_API_KEY');
        if (!$apiKey) {
            return response()->json(['success' => false, 'message' => 'Mailtrap API key belum dikonfigurasi.'], 500);
        }

        $subjek = $request->subjek ?: 'Tidak ada subjek';

        $email = (new MailtrapEmail())
            ->from(new Address('hello@demomailtrap.co', 'Koperasi UTM'))
            ->to(new Address($targetEmail))
            ->subject('Pesan dari Kontak Website: ' . $subjek)
            ->text(
                "Nama: {$request->nama}\n" .
                "Email: {$request->email}\n" .
                "Subjek: {$subjek}\n\n" .
                "{$request->pesan}"
            )
            ->html(
                view('emails.contact', [
                    'nama' => $request->nama,
                    'email' => $request->email,
                    'subjek' => $subjek,
                    'pesan' => $request->pesan,
                ])->render()
            )
            ->category('Contact Form')
            ->replyTo($request->email, $request->nama);

        try {
            $mailtrap = MailtrapClient::initSendingEmails(apiKey: $apiKey);
            $response = $mailtrap->send($email);

            return response()->json(['success' => true, 'message' => 'Pesan berhasil dikirim.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Gagal mengirim pesan: ' . $e->getMessage()], 500);
        }
    }
}
