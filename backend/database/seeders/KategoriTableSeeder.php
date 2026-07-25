<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Kategori;

class KategoriTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Main categories
        $retail = Kategori::updateOrCreate(
            ['nama' => 'Retail'],
            ['tipe' => 'utama', 'parent_id' => null]
        );
        $konsinyasi = Kategori::updateOrCreate(
            ['nama' => 'Konsinyasi'],
            ['tipe' => 'utama', 'parent_id' => null]
        );
        $lainnya = Kategori::updateOrCreate(
            ['nama' => 'Lainnya'],
            ['tipe' => 'utama', 'parent_id' => null]
        );

        // Subcategories linked to parent
        Kategori::updateOrCreate(
            ['nama' => 'Makanan'],
            ['tipe' => 'sub', 'parent_id' => $retail->id]
        );
        Kategori::updateOrCreate(
            ['nama' => 'Minuman'],
            ['tipe' => 'sub', 'parent_id' => $retail->id]
        );
    }
}
