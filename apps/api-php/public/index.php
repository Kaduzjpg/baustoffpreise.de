<?php
declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use App\Support\Env;
use App\Support\Response;
use App\Routes\Router;

// Load env
Env::load(__DIR__ . '/../.env.php');

// CORS (restrict via env)
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$corsAllow = Env::get('CORS_ALLOW_ORIGIN', '');
if ($corsAllow && $origin && str_contains($corsAllow, $origin)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    $router = new Router();
    $router->dispatch($_SERVER['REQUEST_METHOD'] ?? 'GET', $_SERVER['REQUEST_URI'] ?? '/');
} catch (Throwable $e) {
    Response::json(['error' => 'Server error'], 500);
}
