<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        if (User::count() === 0) {
            User::create([
                'email' => 'admin@koperasiutm.com',
                'username' => 'superadmin',
                'password' => Hash::make('superadmin123'),
                'role' => 'super_admin'
            ]);
        }
    }
}
