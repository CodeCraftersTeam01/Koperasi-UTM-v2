<?php

namespace Tests;

class ExampleTest extends TestCase
{
    /**
     * Test basic endpoints return successful response.
     *
     * @return void
     */
    public function test_that_base_endpoint_returns_a_successful_response()
    {
        $this->get('/');
        $this->assertResponseOk();
    }

    public function test_public_api_endpoints_return_json()
    {
        $this->get('/api/produk');
        $this->assertResponseOk();

        $this->get('/api/kategori');
        $this->assertResponseOk();

        $this->get('/api/settings');
        $this->assertResponseOk();
    }

    public function test_path_helper_converts_uploaded_images_to_webp()
    {
        $fakeJpg = \Illuminate\Http\UploadedFile::fake()->image('test_product.jpg', 640, 480);
        $savedPath = \App\Helpers\PathHelper::saveUpload($fakeJpg, 'test_tmp');

        $this->assertStringEndsWith('.webp', $savedPath);
        $fullPath = \App\Helpers\PathHelper::publicPath($savedPath);
        $this->assertFileExists($fullPath);
        $this->assertEquals('image/webp', mime_content_type($fullPath));

        \App\Helpers\PathHelper::deleteFile($savedPath);
        $this->assertFileDoesNotExist($fullPath);

        $testDir = dirname($fullPath);
        if (is_dir($testDir)) {
            @rmdir($testDir);
        }
    }
}
