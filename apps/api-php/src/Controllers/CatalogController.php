<?php
namespace App\Controllers;

use App\Support\Response;

final class CatalogController
{
    public function categories(): void
    {
        // TODO: aus DB mit Cache
        Response::json(['data' => [
            ['id' => 1, 'name' => 'Beton'],
            ['id' => 2, 'name' => 'Ziegel'],
            ['id' => 3, 'name' => 'Dämmung'],
        ]]);
    }

    public function products(): void
    {
        // TODO: Filter + Pagination, aus DB
        $items = [];
        for ($i = 1; $i <= 12; $i++) {
            $items[] = [
                'id' => $i,
                'title' => 'Produkt ' . $i,
                'sku' => 'SKU-00' . $i,
                'image_url' => '',
                'price_hint' => null,
            ];
        }
        Response::json(['data' => $items, 'page' => 1, 'pageSize' => 12, 'total' => 12]);
    }

    public function productDetail(int $id): void
    {
        // TODO: aus DB
        Response::json(['data' => [
            'id' => $id,
            'title' => 'Produkt ' . $id,
            'sku' => 'SKU-00' . $id,
            'attrs' => ['farbe' => 'grau'],
            'image_url' => '',
        ]]);
    }
}
