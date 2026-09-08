<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Cache;

class ThrottleLogin
{
    protected function getLockDuration($totalAttempts)
    {
        if ($totalAttempts >= 15) {
            return 60 * 60;       // 1 jam
        } elseif ($totalAttempts >= 10) {
            return 15 * 60;       // 15 menit
        } elseif ($totalAttempts >= 5) {
            return 1 * 60;        // 1 menit
        }
        return 0;
    }

    protected function getLockMessage($totalAttempts, $seconds)
    {
        $menit = ceil($seconds / 60);
        if ($seconds >= 3600) {
            $jam = floor($seconds / 3600);
            $sisa = ceil(($seconds % 3600) / 60);
            return "Terlalu banyak percobaan login ({$totalAttempts}x). Akun diblokir {$jam} jam {$sisa} menit. Hubungi admin untuk reset.";
        }
        return "Terlalu banyak percobaan login ({$totalAttempts}x). Coba lagi dalam {$menit} menit.";
    }

    public function handle($request, Closure $next)
    {
        $key = $this->resolveRequestKey($request);
        $attemptKey = 'login_attempts:' . $key;
        $lockKey = 'login_lock:' . $key;

        $totalAttempts = Cache::get($attemptKey, 0);

        // Cek apakah sedang dalam masa blokir
        if (Cache::has($lockKey)) {
            $lockedUntil = Cache::get($lockKey);
            if (time() < $lockedUntil) {
                $seconds = $lockedUntil - time();
                return response()->json([
                    'status' => 'error',
                    'message' => $this->getLockMessage($totalAttempts, $seconds),
                ], 429);
            }
            // Lock expired — jangan reset attempts (biar level lock naik)
            Cache::forget($lockKey);
        }

        $response = $next($request);

        if ($response->getStatusCode() === 401) {
            $totalAttempts++;
            $lockDuration = $this->getLockDuration($totalAttempts);

            Cache::put($attemptKey, $totalAttempts, 7200); // simpan 2 jam

            if ($lockDuration > 0) {
                Cache::put($lockKey, time() + $lockDuration, $lockDuration);
                $seconds = $lockDuration;
                return response()->json([
                    'status' => 'error',
                    'message' => $this->getLockMessage($totalAttempts, $seconds),
                ], 429);
            }
        } else {
            // Login berhasil — reset semua
            Cache::forget($attemptKey);
            Cache::forget($lockKey);
        }

        return $response;
    }

    protected function resolveRequestKey($request)
    {
        return $request->ip();
    }
}
