<?php
namespace App\Controllers;

use App\Support\Response;
use App\Support\Security;

final class SecurityController
{
    public function csrf(): void
    {
        $token = Security::generateCsrfToken();
        Response::json(['csrfToken' => $token]);
    }
}
