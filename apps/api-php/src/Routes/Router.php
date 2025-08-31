<?php
namespace App\Routes;

use App\Support\Response;
use App\Controllers\CatalogController;
use App\Controllers\DealerController;
use App\Controllers\QuoteController;
use App\Controllers\SecurityController;

final class Router
{
    public function dispatch(string $method, string $uri): void
    {
        $path = parse_url($uri, PHP_URL_PATH) ?: '/';

        if ($method === 'GET' && $path === '/api/quote/csrf') {
            (new SecurityController())->csrf();
            return;
        }
        if ($method === 'GET' && $path === '/api/catalog/categories') {
            (new CatalogController())->categories();
            return;
        }
        if ($method === 'GET' && $path === '/api/catalog/products') {
            (new CatalogController())->products();
            return;
        }
        if ($method === 'GET' && preg_match('#^/api/catalog/products/(\d+)$#', $path, $m)) {
            (new CatalogController())->productDetail((int)$m[1]);
            return;
        }
        if ($method === 'GET' && $path === '/api/dealers/near') {
            (new DealerController())->near();
            return;
        }
        if ($method === 'POST' && $path === '/api/quote/submit') {
            (new QuoteController())->submit();
            return;
        }

        Response::json(['error' => 'Not found'], 404);
    }
}
