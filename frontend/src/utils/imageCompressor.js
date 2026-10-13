/**
 * Utility untuk kompresi dan optimasi gambar di sisi client sebelum diupload ke server.
 * Memastikan:
 * 1. Gambar dari kamera HP (iPhone/Android) yang berukuran 3MB - 15MB otomatis dikecilkan ke ~150KB - 350KB.
 * 2. Tidak melebihi batas upload_max_filesize PHP / web server (2MB / 5MB).
 * 3. Format distandarisasi ke JPEG/WebP yang didukung secara universal oleh PHP dan browser.
 * 4. Resolusi tetap tajam (maksimal 1600x1600px).
 */
export async function compressImage(file, {
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.82,
} = {}) {
  if (!file) return file;

  // Lewati file SVG dan GIF (agar animasi tetap berfungsi)
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  // Jika file sudah kecil (< 300KB) dan format standard, tidak perlu kompresi ulang
  if (file.size < 300 * 1024 && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp')) {
    return file;
  }

  return new Promise((resolve) => {
    // Timeout fallback 4 detik jika canvas gagal memproses
    const timeout = setTimeout(() => {
      resolve(file);
    }, 4000);

    const reader = new FileReader();
    reader.onerror = () => {
      clearTimeout(timeout);
      resolve(file);
    };

    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => {
        clearTimeout(timeout);
        resolve(file);
      };

      img.onload = () => {
        clearTimeout(timeout);
        try {
          let { width, height } = img;

          // Hitung proporsi resize
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }

          // Background putih untuk gambar transparan saat dikonversi ke JPEG
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Konversi ke JPEG
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }
              const originalName = file.name || 'image.jpg';
              const baseName = originalName.replace(/\.[^/.]+$/, '');
              const compressedFile = new File([blob], `${baseName}.jpg`, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            quality
          );
        } catch (err) {
          console.warn('Compress image fallback to original:', err);
          resolve(file);
        }
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}
