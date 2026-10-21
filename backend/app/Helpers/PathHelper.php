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
     * Cek apakah file yang diunggah merupakan gambar raster yang dapat dikonversi.
     *
     * @param \Illuminate\Http\UploadedFile $file
     * @return bool
     */
    public static function isImageFile($file): bool
    {
        $ext = strtolower($file->getClientOriginalExtension() ?: $file->guessExtension() ?: '');
        if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif'])) {
            return true;
        }

        $mime = $file->getClientMimeType() ?: '';
        return str_starts_with($mime, 'image/') && !in_array($ext, ['svg', 'ico']);
    }

    /**
     * Konversi file gambar ke format WebP terkompresi dengan ukuran optimal.
     *
     * @param string $sourcePath Path file sumber
     * @param string $targetFilePath Path tujuan penyimpanan file WebP
     * @param int $quality Kualitas kompresi (1-100)
     * @param int $maxDimension Maksimal lebar/tinggi gambar (resolusi web aman)
     * @return bool
     */
    protected static function convertImageToWebp(string $sourcePath, string $targetFilePath, int $quality = 82, int $maxDimension = 1920): bool
    {
        if (!function_exists('imagewebp')) {
            return false;
        }

        $info = @getimagesize($sourcePath);
        if (!$info) {
            return false;
        }

        $mime = $info['mime'] ?? '';
        $srcImage = null;

        switch ($mime) {
            case 'image/jpeg':
                $srcImage = @imagecreatefromjpeg($sourcePath);
                break;
            case 'image/png':
                $srcImage = @imagecreatefrompng($sourcePath);
                break;
            case 'image/webp':
                $srcImage = @imagecreatefromwebp($sourcePath);
                break;
            case 'image/gif':
                $srcImage = @imagecreatefromgif($sourcePath);
                break;
            case 'image/bmp':
            case 'image/x-ms-bmp':
                $srcImage = function_exists('imagecreatefrombmp') ? @imagecreatefrombmp($sourcePath) : null;
                break;
        }

        if (!$srcImage) {
            $raw = @file_get_contents($sourcePath);
            if ($raw) {
                $srcImage = @imagecreatefromstring($raw);
            }
        }

        if (!$srcImage) {
            return false;
        }

        // Auto-orient jika JPEG memiliki tag orientasi kamera EXIF
        if ($mime === 'image/jpeg' && function_exists('exif_read_data')) {
            try {
                $exif = @exif_read_data($sourcePath);
                if ($exif && !empty($exif['Orientation'])) {
                    switch ($exif['Orientation']) {
                        case 3:
                            $rotated = imagerotate($srcImage, 180, 0);
                            if ($rotated) {
                                imagedestroy($srcImage);
                                $srcImage = $rotated;
                            }
                            break;
                        case 6:
                            $rotated = imagerotate($srcImage, -90, 0);
                            if ($rotated) {
                                imagedestroy($srcImage);
                                $srcImage = $rotated;
                            }
                            break;
                        case 8:
                            $rotated = imagerotate($srcImage, 90, 0);
                            if ($rotated) {
                                imagedestroy($srcImage);
                                $srcImage = $rotated;
                            }
                            break;
                    }
                }
            } catch (\Throwable $e) {
                // Abaikan kesalahan pembacaan EXIF jika metadata korup
            }
        }

        $origWidth = imagesx($srcImage);
        $origHeight = imagesy($srcImage);

        if ($origWidth <= 0 || $origHeight <= 0) {
            imagedestroy($srcImage);
            return false;
        }

        // Hitung proporsi resize jika dimensi melebihi batas resolusi web
        $newWidth = $origWidth;
        $newHeight = $origHeight;

        if ($origWidth > $maxDimension || $origHeight > $maxDimension) {
            if ($origWidth >= $origHeight) {
                $newWidth = $maxDimension;
                $newHeight = (int) round(($origHeight / $origWidth) * $maxDimension);
            } else {
                $newHeight = $maxDimension;
                $newWidth = (int) round(($origWidth / $origHeight) * $maxDimension);
            }
        }

        $destImage = imagecreatetruecolor($newWidth, $newHeight);

        // Pertahankan transparansi kanal alpha untuk gambar transparan
        imagealphablending($destImage, false);
        imagesavealpha($destImage, true);
        $transparent = imagecolorallocatealpha($destImage, 0, 0, 0, 127);
        imagefilledrectangle($destImage, 0, 0, $newWidth, $newHeight, $transparent);

        imagecopyresampled(
            $destImage,
            $srcImage,
            0, 0, 0, 0,
            $newWidth, $newHeight,
            $origWidth, $origHeight
        );

        $saved = @imagewebp($destImage, $targetFilePath, $quality);

        imagedestroy($srcImage);
        imagedestroy($destImage);

        return $saved && file_exists($targetFilePath) && filesize($targetFilePath) > 0;
    }

    /**
     * Pindahkan file yang diunggah ke folder upload yang tepat,
     * otomatis mengonversi gambar ke format WebP ringan,
     * serta sinkronkan ke local fallback jika ada.
     *
     * @param \Illuminate\Http\UploadedFile $file
     * @param string $subfolder
     * @return string Path relatif untuk database (contoh: "upload/660a...webp" atau "upload/gallery/660a...webp")
     * @throws \Exception
     */
    public static function saveUpload($file, string $subfolder = ''): string
    {
        $targetDir = self::uploadDir($subfolder);
        $baseName = uniqid();
        $sourcePath = $file->getPathname();

        $converted = false;
        $filename = $baseName . '.webp';
        $savedPath = $targetDir . DIRECTORY_SEPARATOR . $filename;

        // Coba konversi otomatis ke format WebP
        if (self::isImageFile($file)) {
            $converted = self::convertImageToWebp($sourcePath, $savedPath, 82, 1920);
        }

        if (!$converted) {
            // Fallback jika bukan gambar atau jika konversi WebP tidak didukung
            $ext = strtolower($file->getClientOriginalExtension() ?: $file->guessExtension() ?: 'jpg');
            $filename = $baseName . '.' . $ext;
            $savedPath = $targetDir . DIRECTORY_SEPARATOR . $filename;
            $file->move($targetDir, $filename);
        }

        if (!file_exists($savedPath)) {
            throw new \Exception('Gambar tidak berhasil tersimpan di server. Periksa izin direktori upload.');
        }

        @chmod($savedPath, 0666);

        // Mirror / sinkronisasi ke direktori fallback agar file selalu dapat diakses dari URL web:
        // 1. Direktori htdocs/upload (jika struktur hosting cPanel/filemanager /htdocs/system)
        $parentRoot = dirname(self::publicPath());
        if (file_exists($parentRoot . DIRECTORY_SEPARATOR . 'index.html') || is_dir($parentRoot . DIRECTORY_SEPARATOR . 'assets')) {
            $htdocsUploadDir = $parentRoot . DIRECTORY_SEPARATOR . 'upload' . ($subfolder ? DIRECTORY_SEPARATOR . trim($subfolder, '/\\') : '');
            if (realpath($htdocsUploadDir) !== realpath($targetDir)) {
                if (!is_dir($htdocsUploadDir)) {
                    @mkdir($htdocsUploadDir, 0777, true);
                    @chmod($htdocsUploadDir, 0777);
                }
                @copy($savedPath, $htdocsUploadDir . DIRECTORY_SEPARATOR . $filename);
                @chmod($htdocsUploadDir . DIRECTORY_SEPARATOR . $filename, 0666);
            }
        }

        // 2. Direktori local fallback base_path('public/upload/...')
        $localFallbackDir = base_path('public' . DIRECTORY_SEPARATOR . 'upload' . ($subfolder ? DIRECTORY_SEPARATOR . trim($subfolder, '/\\') : ''));
        if (realpath($localFallbackDir) !== realpath($targetDir) && is_dir(dirname($localFallbackDir))) {
            if (!is_dir($localFallbackDir)) {
                @mkdir($localFallbackDir, 0777, true);
                @chmod($localFallbackDir, 0777);
            }
            @copy($savedPath, $localFallbackDir . DIRECTORY_SEPARATOR . $filename);
            @chmod($localFallbackDir . DIRECTORY_SEPARATOR . $filename, 0666);
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
            dirname(self::publicPath()) . DIRECTORY_SEPARATOR . $rel,
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
