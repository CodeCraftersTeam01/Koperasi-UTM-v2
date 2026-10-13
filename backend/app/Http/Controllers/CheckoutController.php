<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

use App\Models\Setting;

class CheckoutController extends Controller
{
    public function process(Request $request)
    {
        $this->validate($request, [
            'nama' => 'required|string|max:100',
            'whatsapp' => 'required|string|max:20',
            'email' => 'nullable|email|max:100',
            'items' => 'required|array|min:1',
            'items.*.nama' => 'required|string',
            'items.*.harga' => 'required|integer',
            'items.*.qty' => 'required|integer|min:1',
        ]);

        $nama = $request->input('nama');
        $whatsapp = $request->input('whatsapp');
        $email = $request->input('email');
        $items = $request->input('items');

        // Fetch settings from database (dynamic admin toggle & target number)
        $settings = Setting::all()->pluck('value', 'key')->toArray();
        $checkoutMethod = isset($settings['checkout_method']) ? $settings['checkout_method'] : 'direct';
        $adminWa = isset($settings['admin_whatsapp']) ? $settings['admin_whatsapp'] : '6285727877235';
        $adminEmail = isset($settings['admin_email']) ? $settings['admin_email'] : '';

        // Fetch sensitive tokens from .env (secured on backend server)
        $fonnteToken = env('FONNTE_TOKEN');

        // 1. Calculate Total and Format Order List
        $total = 0;
        $orderListText = "";
        $orderListHtml = "";
        foreach ($items as $index => $item) {
            $subtotal = $item['harga'] * $item['qty'];
            $total += $subtotal;
            
            $num = $index + 1;
            $orderListText .= "{$num}. {$item['nama']} x{$item['qty']} - Rp " . number_format($subtotal, 0, ',', '.') . "\n";
            $orderListHtml .= "<tr>
                <td style='padding: 10px; border-bottom: 1px solid #eee;'>{$item['nama']}</td>
                <td style='padding: 10px; border-bottom: 1px solid #eee; text-align: center;'>{$item['qty']}</td>
                <td style='padding: 10px; border-bottom: 1px solid #eee; text-align: right;'>Rp " . number_format($item['harga'], 0, ',', '.') . "</td>
                <td style='padding: 10px; border-bottom: 1px solid #eee; text-align: right;'>Rp " . number_format($subtotal, 0, ',', '.') . "</td>
            </tr>";
        }

        // 2. Save Order to Database
        $order = \App\Models\Order::create([
            'nomor_nota' => $request->input('nomor_nota'),
            'nama' => $nama,
            'whatsapp' => $whatsapp,
            'email' => $email,
            'items' => $items,
            'total_harga' => $total,
            'checkout_method' => $checkoutMethod,
            'status' => 'pending'
        ]);

        // 3. Return Success
        return response()->json([
            'success' => true,
            'checkout_method' => 'dashboard',
            'order_id' => $order->id,
            'message' => 'Pesanan berhasil dibuat.'
        ]);
    }
}
