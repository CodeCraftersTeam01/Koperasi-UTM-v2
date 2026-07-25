<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddParentIdToKategoriTable extends Migration
{
    public function up()
    {
        Schema::table('kategori', function (Blueprint $table) {
            $table->unsignedBigInteger('parent_id')->nullable()->after('tipe');
            $table->foreign('parent_id')->references('id')->on('kategori')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('kategori', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropColumn('parent_id');
        });
    }
}
