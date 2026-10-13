<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

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

        $file = $request->file('file');
        $ext = strtolower($file->getClientOriginalExtension() ?: $file->guessExtension() ?: 'jpg');
        $filename = uniqid() . '.' . $ext;

        $uploadDir = base_path('public/upload/gallery');
        if (!is_dir($uploadDir)) {
            if (!@mkdir($uploadDir, 0755, true) && !is_dir($uploadDir)) {
                return response()->json([
                    'message' => 'Folder upload tidak dapat dibuat.',
                    'path' => $uploadDir,
                ], 500);
            }
        }

        try {
            $file->move($uploadDir, $filename);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menyimpan file: ' . $e->getMessage(),
                'path' => $uploadDir,
                'writable' => is_writable($uploadDir),
            ], 500);
        }

        $savedPath = $uploadDir . DIRECTORY_SEPARATOR . $filename;

        if (!file_exists($savedPath)) {
            return response()->json([
                'message' => 'File dilaporkan berhasil tetapi tidak ditemukan di server.',
                'path' => $uploadDir,
                'writable' => is_writable($uploadDir),
            ], 500);
        }

        return response()->json([
            'url' => 'upload/gallery/' . $filename,
        ]);
    }
}
