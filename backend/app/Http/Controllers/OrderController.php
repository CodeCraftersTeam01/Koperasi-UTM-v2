<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;

class OrderController extends Controller
{
    public function track(Request $request)
    {
        $idsStr = $request->query('ids', '');
        if (empty($idsStr)) {
            return response()->json([
                'success' => true,
                'data' => []
            ]);
        }

        $ids = explode(',', $idsStr);
        $orders = Order::whereIn('id', $ids)->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    public function index()
    {
        // Retrieve orders ordered by latest first
        $orders = Order::orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    public function update(Request $request, $id)
    {
        $this->validate($request, [
            'status' => 'required|in:pending,proses,selesai,batal'
        ]);

        $order = Order::find($id);

        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Pesanan tidak ditemukan'], 404);
        }

        $order->status = $request->input('status');
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Status pesanan berhasil diperbarui',
            'data' => $order
        ]);
    }

    public function destroy($id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Pesanan tidak ditemukan'], 404);
        }

        $order->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil dihapus'
        ]);
    }
}
