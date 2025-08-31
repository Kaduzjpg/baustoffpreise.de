<?php
namespace App\Controllers;

use App\Support\Response;

final class DealerController
{
    public function near(): void
    {
        $plz = $_GET['postalCode'] ?? '';
        $radius = (int)($_GET['radius'] ?? 50);
        // TODO: Lookup postal_codes → lat/lng, dann Haversine über dealers
        Response::json(['data' => [
            ['id' => 1, 'name' => 'Händler Nord', 'plz' => $plz, 'distance_km' => 5],
            ['id' => 2, 'name' => 'Händler Süd', 'plz' => $plz, 'distance_km' => 18],
        ], 'radiusKm' => $radius]);
    }
}
