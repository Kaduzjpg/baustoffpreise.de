<?php
namespace App\Support;

final class Security
{
    public static function generateCsrfToken(int $ttlSeconds = 7200): string
    {
        $ts = time();
        $nonce = bin2hex(random_bytes(8));
        $data = $ts . '.' . $nonce;
        $secret = Env::get('CSRF_SECRET', '');
        $sig = hash_hmac('sha256', $data, $secret);
        return $data . '.' . $sig;
    }

    public static function verifyCsrfToken(string $token, int $maxAgeSeconds = 7200): bool
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return false;
        [$ts, $nonce, $sig] = $parts;
        if (!ctype_digit($ts)) return false;
        if ((time() - (int)$ts) > $maxAgeSeconds) return false;
        $data = $ts . '.' . $nonce;
        $secret = Env::get('CSRF_SECRET', '');
        $calc = hash_hmac('sha256', $data, $secret);
        return hash_equals($calc, $sig);
    }

    public static function isRateLimited(string $key, int $limit, int $windowSeconds): bool
    {
        $dir = sys_get_temp_dir() . '/rate';
        if (!is_dir($dir)) @mkdir($dir, 0777, true);
        $file = $dir . '/' . sha1($key);
        $now = time();
        $data = ['window_start' => $now, 'count' => 0];
        if (is_file($file)) {
            $raw = file_get_contents($file);
            $parsed = $raw ? json_decode($raw, true) : null;
            if (is_array($parsed)) $data = $parsed;
        }
        if (($now - (int)$data['window_start']) >= $windowSeconds) {
            $data = ['window_start' => $now, 'count' => 0];
        }
        $data['count']++;
        file_put_contents($file, json_encode($data));
        return $data['count'] > $limit;
    }
}
