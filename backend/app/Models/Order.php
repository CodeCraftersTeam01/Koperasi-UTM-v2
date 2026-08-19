<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $table = 'orders';
    protected $fillable = ['nomor_nota', 'nama', 'whatsapp', 'email', 'items', 'total_harga', 'checkout_method', 'status'];
    protected $casts = [
        'items' => 'array',
    ];
}
