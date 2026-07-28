<!DOCTYPE html>
<html>
<head>
    <title>Pesan Baru dari {{ $nama }}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #0f5132; margin-top: 0;">Pesan Baru dari Kontak Website</h2>
        <p>Anda menerima pesan baru melalui formulir kontak di website Koperasi UTM.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; width: 100px;"><strong>Nama:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{{ $nama }}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{{ $email }}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Subjek:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{{ $subjek }}</td>
            </tr>
        </table>

        <div style="margin-top: 20px;">
            <strong>Pesan:</strong>
            <p style="background: #f9f9f9; padding: 15px; border-radius: 4px; white-space: pre-wrap;">{{ $pesan }}</p>
        </div>

        <hr style="border: 0; border-top: 1px solid #ddd; margin: 30px 0 20px;">
        <p style="font-size: 12px; color: #777;">Email ini dikirim secara otomatis dari formulir kontak website Koperasi UTM.</p>
    </div>
</body>
</html>
