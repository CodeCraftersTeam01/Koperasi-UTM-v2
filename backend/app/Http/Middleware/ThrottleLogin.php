<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Cache;

class ThrottleLogin
{
    protected function getLockDuration($totalAttempts)
    {
        if ($totalAttempts >= 15) {
            return 3600;     // 1 jam
        } elseif ($totalAttempts >= 10) {
            return 900;      // 15 menit
        } elseif ($totalAttempts >= 5) {
            return 60;       // 1 menit
        }
        return 0;
    }

    protected function getLockMessage($totalAttempts, $seconds)
    {
        if ($seconds >= 3600) {
            $jam = floor($seconds / 3600);
            $sisa = ceil(($seconds % 3600) / 60);
            return "Terlalu banyak percobaan login ({$totalAttempts}x). Akun diblokir {$jam} jam {$sisa} menit.";
        }
        $menit = ceil($seconds / 60);
        return "Terlalu banyak percobaan login ({$totalAttempts}x). Coba lagi dalam {$menit} menit.";
    }

    public function handle($request, Closure $next)
    {
        $key = $this->resolveRequestKey($request);
        $attemptKey = 'login_attempts:' . $key;
        $lockKey = 'login_lock:' . $key;

        try {
            $totalAttempts = (int) Cache::get($attemptKey, 0);

            if (Cache::has($lockKey)) {
                $lockedUntil = (int) Cache::get($lockKey);
                if (time() < $lockedUntil) {
                    $seconds = $lockedUntil - time();
                    return response()->json([
                        'status' => 'error',
                        'message' => $this->getLockMessage($totalAttempts, $seconds),
                    ], 429);
                }
                Cache::forget($lockKey);
            }
        } catch (\Exception $e) {
            $totalAttempts = 0;
        }

        $response = $next($request);

        if ($response->getStatusCode() === 401) {
            $totalAttempts++;
            $lockDuration = $this->getLockDuration($totalAttempts);

            try {
                Cache::put($attemptKey, $totalAttempts, 120);

                if ($lockDuration > 0) {
                    Cache::put($lockKey, time() + $lockDuration, ceil($lockDuration / 60));
                    return response()->json([
                        'status' => 'error',
                        'message' => $this->getLockMessage($totalAttempts, $lockDuration),
                    ], 429);
                }
            } catch (\Exception $e) {
                // Cache tidak tersedia, lewati throttle
            }
        } else {
            try {
                Cache::forget($attemptKey);
                Cache::forget($lockKey);
            } catch (\Exception $e) {}
        }

        return $response;
    }

    protected function resolveRequestKey($request)
    {
        return $request->ip();
    }
}
