<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContactMail extends Mailable
{
    use Queueable, SerializesModels;

    public $nama;
    public $emailPengirim;
    public $subjek;
    public $pesan;

    public function __construct($nama, $emailPengirim, $subjek, $pesan)
    {
        $this->nama = $nama;
        $this->emailPengirim = $emailPengirim;
        $this->subjek = $subjek;
        $this->pesan = $pesan;
    }

    public function build()
    {
        $fromAddress = env('MAIL_FROM_ADDRESS', 'codingsolver0@gmail.com');
        $fromName = env('MAIL_FROM_NAME', 'Koperasi UTM');

        return $this
            ->from($fromAddress, $fromName)
            ->replyTo($this->emailPengirim, $this->nama)
            ->subject('Pesan dari Kontak Website: ' . $this->subjek)
            ->view('emails.contact')
            ->with([
                'nama' => $this->nama,
                'email' => $this->emailPengirim,
                'subjek' => $this->subjek,
                'pesan' => $this->pesan,
            ]);
    }
}
