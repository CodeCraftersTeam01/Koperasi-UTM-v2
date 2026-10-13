<?php

namespace App\Helpers;

class PathHelper
{
    /**
     * Dapatkan direktori web public yang sesungguhnya.
     * 
     * 1. Mode Hosting (cPanel/File Manager):
     *    index.php berada di /htdocs/system/index.php dan Lumen ada di /htdocs/system/backend.
     *    Folder upload berada di /htdocs/system/upload (sejajar dengan folder backend).
     *    Oleh karena itu, dirname(base_path()) adalah /htdocs/system yang merupakan public root.
     * 
     * 2. Mode Standar / Local Dev (Herd / artisan serve):
     *    index.php berada di backend/public/index.php.
     *    Folder upload berada di backend/public/upload.
     *    Oleh karena itu, base_path('public') adalah public root.
     */
    public static function publicPath(string $subpath = ''): string
    {
        $parent = dirname(base_path());

        // Cek apakah struktur hosting (ada index.php atau folder upload di parent direktori backend)
        if (file_exists($parent . DIRECTORY_SEPARATOR . 'index.php') || is_dir($parent . DIRECTORY_SEPARATOR . 'upload')) {
            $base = $parent;
        } else {
            $base = base_path('public');
        }

        $sub = ltrim($subpath, '/\\');
        return $sub !== '' ? $base . DIRECTORY_SEPARATOR . $sub : $base;
    }

    /**
     * Dapatkan direktori folder upload dan pastikan sudah terbuat dengan izin tulis.
     */
    public static function uploadDir(string $subfolder = ''): string
    {
        $relPath = 'upload' . ($subfolder ? DIRECTORY_SEPARATOR . trim($subfolder, '/\\') : '');
        $dir = self::publicPath($relPath);

        if (!is_dir($dir)) {
            @mkdir($dir, 0777, true);
            @chmod($dir, 0777);
        }

        return $dir;
    }

    /**
     * Pindahkan file yang diunggah ke folder upload yang tepat,
     * serta sinkronkan ke local fallback jika ada.
     *
     * @param \Illuminate\Http\UploadedFile $file
     * @param string $subfolder
     * @return string Path relatif untuk database (contoh: "upload/660a...jpg" atau "upload/gallery/660a...jpg")
     * @throws \Exception
     */
    public static function saveUpload($file, string $subfolder = ''): string
    {
        $targetDir = self::uploadDir($subfolder);
        $ext = strtolower($file->getClientOriginalExtension() ?: $file->guessExtension() ?: 'jpg');
        $filename = uniqid() . '.' . $ext;

        $file->move($targetDir, $filename);

        $savedPath = $targetDir . DIRECTORY_SEPARATOR . $filename;
        if (!file_exists($savedPath)) {
            throw new \Exception('Gambar tidak berhasil tersimpan di server. Periksa izin direktori upload.');
        }

        @chmod($savedPath, 0666);

        // Mirror / sinkronisasi ke base_path('public/upload/...') jika folder tersebut ada dan berbeda dari targetDir
        $relSub = $subfolder ? trim($subfolder, '/\\') . DIRECTORY_SEPARATOR : '';
        $localFallbackDir = base_path('public' . DIRECTORY_SEPARATOR . 'upload' . ($subfolder ? DIRECTORY_SEPARATOR . trim($subfolder, '/\\') : ''));
        if (realpath($localFallbackDir) !== realpath($targetDir) && is_dir(dirname($localFallbackDir))) {
            if (!is_dir($localFallbackDir)) {
                @mkdir($localFallbackDir, 0777, true);
            }
            @copy($savedPath, $localFallbackDir . DIRECTORY_SEPARATOR . $filename);
        }

        $relativeDbPath = 'upload/' . ($subfolder ? trim($subfolder, '/') . '/' : '') . $filename;
        return str_replace('\\', '/', $relativeDbPath);
    }

    /**
     * Hapus file gambar dari semua kemungkinan direktori public.
     */
    public static function deleteFile(?string $relativePath): void
    {
        if (!$relativePath) {
            return;
        }

        $rel = ltrim($relativePath, '/\\');

        $candidates = [
            self::publicPath($rel),
            base_path('public' . DIRECTORY_SEPARATOR . $rel),
            dirname(base_path()) . DIRECTORY_SEPARATOR . $rel,
        ];

        foreach (array_unique($candidates) as $path) {
            if (file_exists($path) && is_file($path)) {
                @unlink($path);
            }
        }
    }
}
