<?php

/** @var \Laravel\Lumen\Routing\Router $router */

$router->get('/', function () use ($router) {
    $candidates = [
        \App\Helpers\PathHelper::publicPath('index.html'),
        dirname(\App\Helpers\PathHelper::publicPath()) . DIRECTORY_SEPARATOR . 'index.html',
        base_path('public' . DIRECTORY_SEPARATOR . 'index.html'),
    ];

    foreach (array_unique($candidates) as $path) {
        if (file_exists($path) && is_file($path)) {
            return response()->file($path);
        }
    }

    return $router->app->version();
});

// Public API routes
$router->get('/api/kategori', 'KategoriController@index');
$router->get('/api/produk', 'ProdukController@index');
$router->post('/api/login', ['middleware' => 'throttle.login', 'uses' => 'AuthController@login']);
$router->get('/api/pengurus', 'PengurusController@index');
$router->get('/api/settings', 'SettingController@index');
$router->post('/api/checkout', 'CheckoutController@process');
$router->get('/api/orders/track', 'OrderController@track');
$router->post('/api/contact', 'ContactController@send');

// SEMENTARA: diagnostik upload untuk debugging hosting. Hapus setelah selesai.
$router->get('/api/diagnostic', 'DiagnosticController@index');

// Admin protected API routes
$router->group(['middleware' => 'auth'], function () use ($router) {
    // Auth
    $router->post('/api/logout', 'AuthController@logout');

    // Kategori CRUD
    $router->post('/api/kategori', 'KategoriController@store');
    $router->put('/api/kategori/{id}', 'KategoriController@update');
    $router->delete('/api/kategori/{id}', 'KategoriController@destroy');
    $router->post('/api/kategori/bulk-delete', 'KategoriController@bulkDestroy');

    // Bulk Produk Actions
    $router->post('/api/produk/bulk-delete', 'ProdukController@bulkDestroy');
    $router->post('/api/produk/bulk-archive', 'ProdukController@bulkArchive');

    // Produk CRUD
    $router->post('/api/produk', 'ProdukController@store');
    $router->post('/api/produk/{id}', 'ProdukController@update'); // POST to support multipart/form-data upload easily
    $router->put('/api/produk/{id}', 'ProdukController@update');
    $router->delete('/api/produk/{id}', 'ProdukController@destroy');
    $router->post('/api/produk/{id}/archive', 'ProdukController@archive');
    $router->put('/api/produk/{id}/archive', 'ProdukController@archive');
    $router->patch('/api/produk/{id}/archive', 'ProdukController@archive');

    // Dashboard Stats
    $router->get('/api/stats', 'StatsController@index');
    
    // User Management
    $router->get('/api/users', 'UserController@index');
    $router->post('/api/users', 'UserController@store');
    $router->put('/api/users/{id}', 'UserController@update');
    $router->delete('/api/users/{id}', 'UserController@destroy');
    $router->post('/api/users/bulk-delete', 'UserController@bulkDestroy');

    // Pengurus Management
    $router->post('/api/pengurus/bulk-delete', 'PengurusController@bulkDestroy');
    $router->post('/api/pengurus/reorder', 'PengurusController@reorder');
    $router->post('/api/pengurus', 'PengurusController@store');
    $router->post('/api/pengurus/{id}', 'PengurusController@update');
    $router->put('/api/pengurus/{id}', 'PengurusController@update');
    $router->delete('/api/pengurus/{id}', 'PengurusController@destroy');

    // Settings Management
    $router->post('/api/settings', 'SettingController@updateBatch');

    // File Upload
    $router->post('/api/upload', 'UploadController@uploadImage');

    // Orders Management
    $router->get('/api/orders', 'OrderController@index');
    $router->put('/api/orders/{id}', 'OrderController@update');
    $router->delete('/api/orders/{id}', 'OrderController@destroy');
});

// SPA Fallback: serve index.html for all client-side routes (e.g. /katalog, /profil, /panel-utm-4dmn)
$router->get('/{any:.*}', function ($any = null) use ($router) {
    $anyStr = (string) $any;
    if (str_starts_with($anyStr, 'api/') || str_contains($anyStr, 'api/')) {
        return response()->json(['error' => 'API endpoint not found'], 404);
    }

    $candidates = [
        \App\Helpers\PathHelper::publicPath('index.html'),
        dirname(\App\Helpers\PathHelper::publicPath()) . DIRECTORY_SEPARATOR . 'index.html',
        base_path('public' . DIRECTORY_SEPARATOR . 'index.html'),
    ];

    foreach (array_unique($candidates) as $path) {
        if (file_exists($path) && is_file($path)) {
            return response()->file($path);
        }
    }

    return $router->app->version();
});
