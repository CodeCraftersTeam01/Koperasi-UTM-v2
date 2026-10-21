<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasColumn('users', 'email')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('email', 100)->nullable()->unique()->after('id');
            });
        }

        // Set email default untuk user superadmin dan user yang ada
        DB::table('users')->where('username', 'superadmin')->whereNull('email')->update([
            'email' => 'admin@koperasiutm.com',
        ]);

        $users = DB::table('users')->whereNull('email')->get();
        foreach ($users as $user) {
            DB::table('users')->where('id', $user->id)->update([
                'email' => $user->username . '@koperasiutm.com',
            ]);
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        if (Schema::hasColumn('users', 'email')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('email');
            });
        }
    }
};
