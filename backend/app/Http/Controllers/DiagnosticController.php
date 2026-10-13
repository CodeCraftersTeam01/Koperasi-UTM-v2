<?php

namespace App\Http\Controllers;

use App\Helpers\PathHelper;

class DiagnosticController extends Controller
{
    public function index()
    {
        $uploadDir = PathHelper::uploadDir();
        $galleryDir = PathHelper::uploadDir('gallery');

        $testFile = $uploadDir . DIRECTORY_SEPARATOR . '.diagnostic_test';
        $canWrite = false;
        $writeError = null;

        if (is_dir($uploadDir) && is_writable($uploadDir)) {
            try {
                $canWrite = @file_put_contents($testFile, 'ok') !== false;
                if ($canWrite && file_exists($testFile)) {
                    @unlink($testFile);
                }
            } catch (\Exception $e) {
                $writeError = $e->getMessage();
            }
        }

        return response()->json([
            'php_version' => PHP_VERSION,
            'base_path' => base_path(),
            'detected_public_path' => PathHelper::publicPath(),
            'is_hosting_mode' => file_exists(dirname(base_path()) . DIRECTORY_SEPARATOR . 'index.php') || is_dir(dirname(base_path()) . DIRECTORY_SEPARATOR . 'upload'),
            'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? null,
            'app_env' => env('APP_ENV'),
            'app_debug' => env('APP_DEBUG'),
            'request_host' => request()->getHost(),
            'request_base_url' => request()->getSchemeAndHttpHost(),
            'upload_dir' => $uploadDir,
            'upload_dir_exists' => is_dir($uploadDir),
            'upload_dir_writable' => is_dir($uploadDir) ? is_writable($uploadDir) : null,
            'gallery_dir' => $galleryDir,
            'gallery_dir_exists' => is_dir($galleryDir),
            'gallery_dir_writable' => is_dir($galleryDir) ? is_writable($galleryDir) : null,
            'upload_write_test' => $canWrite,
            'upload_write_error' => $writeError,
            'php_upload_max_filesize' => ini_get('upload_max_filesize'),
            'php_post_max_size' => ini_get('post_max_size'),
            'php_max_file_uploads' => ini_get('max_file_uploads'),
            'php_file_uploads_enabled' => (bool) ini_get('file_uploads'),
            'php_temp_dir' => sys_get_temp_dir(),
            'php_temp_dir_writable' => is_writable(sys_get_temp_dir()),
            'extensions' => [
                'fileinfo' => extension_loaded('fileinfo'),
                'gd' => extension_loaded('gd'),
                'openssl' => extension_loaded('openssl'),
            ],
        ]);
    }
}
