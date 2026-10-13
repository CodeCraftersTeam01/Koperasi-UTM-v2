<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Helpers\PathHelper;

class UploadController extends Controller
{
    public function uploadImage(Request $request)
    {
        $this->validate($request, [
            'file' => 'required|file|mimes:jpeg,png,jpg,gif,svg,webp,bmp,avif|max:10240',
        ]);

        if (!$request->hasFile('file') || !$request->file('file')->isValid()) {
            return response()->json(['message' => 'File tidak valid atau gagal diunggah ke server.'], 400);
        }

        try {
            $relativePath = PathHelper::saveUpload($request->file('file'), 'gallery');
            return response()->json([
                'url' => $relativePath,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menyimpan file: ' . $e->getMessage(),
            ], 500);
        }
    }
}
