<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pengurus;

class PengurusTableSeeder extends Seeder
{
    public function run()
    {
        Pengurus::truncate();

        // Level 1 — Ketua Koperasi
        Pengurus::create([
            'nama' => 'FAIDAL, S.E., M.M.',
            'jabatan' => 'KETUA KOPERASI',
            'foto' => 'img/pengurus/FAIDAL.jpeg',
            'level' => 1,
            'urutan' => 0,
        ]);

        // Level 2 — Pengawas & BPH
        Pengurus::create([
            'nama' => 'R. SRI KENTJANAWATI',
            'jabatan' => 'PENGAWAS',
            'foto' => 'img/pengurus/R SRI KENTJANAWATI.jpeg',
            'level' => 2,
            'urutan' => 0,
        ]);

        Pengurus::create([
            'nama' => 'R. AYU FAUZIYAH F.',
            'jabatan' => 'SEKRETARIS',
            'foto' => 'img/pengurus/R AYU FAUZIYAH FIERDAUS.jpeg',
            'level' => 2,
            'urutan' => 1,
        ]);

        Pengurus::create([
            'nama' => 'TRIMULYANI BUDIAINGSIH',
            'jabatan' => 'BENDAHARA',
            'foto' => 'img/pengurus/TRIMULYANI BUDIANINGSIH.jpeg',
            'level' => 2,
            'urutan' => 2,
        ]);

        // Level 3 — Divisi
        Pengurus::create([
            'nama' => 'ABD. HALIM',
            'jabatan' => 'DIVISI USAHA',
            'foto' => 'img/pengurus/ABD HALIM.jpeg',
            'level' => 3,
            'urutan' => 0,
        ]);

        Pengurus::create([
            'nama' => 'ANISAH',
            'jabatan' => 'DIVISI USAHA',
            'foto' => 'img/pengurus/ANISAH.jpeg',
            'level' => 3,
            'urutan' => 1,
        ]);

        Pengurus::create([
            'nama' => 'MOH. AJIB',
            'jabatan' => 'DIVISI PERLENGKAPAN',
            'foto' => 'img/pengurus/MOH AJIB.jpeg',
            'level' => 3,
            'urutan' => 2,
        ]);

        // Level 4 — Manajer Operasional
        Pengurus::create([
            'nama' => 'FEBRI ANGGA SAPUTRA',
            'jabatan' => 'MANAJER SIMPAN PINJAM DAN JASA',
            'foto' => 'img/pengurus/FEBRI ANGGA SAPUTRA.jpeg',
            'level' => 4,
            'urutan' => 0,
        ]);

        Pengurus::create([
            'nama' => 'APRILIA CHAIRANI SAPUTRI',
            'jabatan' => 'MANAJER PERTOKOAN',
            'foto' => null,
            'level' => 4,
            'urutan' => 1,
        ]);
    }
}
