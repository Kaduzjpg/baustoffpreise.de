<?php
namespace App\Support;

final class Env
{
    public static function load(string $path): void
    {
        if (!is_file($path)) {
            return;
        }
        $vars = include $path;
        if (is_array($vars)) {
            foreach ($vars as $k => $v) {
                $_ENV[$k] = (string) $v;
            }
        }
    }

    public static function get(string $key, ?string $default = null): ?string
    {
        return $_ENV[$key] ?? $default;
    }
}
