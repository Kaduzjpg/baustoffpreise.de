<?php
namespace App\Controllers;

use App\Support\Response;
use App\Support\Env;
use PHPMailer\PHPMailer\PHPMailer;

final class QuoteController
{
    public function submit(): void
    {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        if ($this->rateLimited($ip)) {
            Response::json(['error' => 'Too many requests'], 429);
        }

        $payload = json_decode(file_get_contents('php://input') ?: 'null', true);
        if (!is_array($payload)) {
            Response::json(['error' => 'Invalid JSON'], 400);
        }

        // rudimentäre Validierung
        $customer = $payload['customer'] ?? null;
        $items = $payload['items'] ?? [];
        if (!$customer || !isset($customer['email']) || !filter_var($customer['email'], FILTER_VALIDATE_EMAIL) || empty($items)) {
            Response::json(['error' => 'Invalid payload'], 422);
        }

        $requestId = random_int(100000, 999999);
        $dealers = [1,2]; // TODO: Geomatching & DB insert

        $this->sendMail((string)$customer['email'], (string)($customer['name'] ?? '')); // fire-and-forget

        Response::json(['requestId' => $requestId, 'dealersMatched' => count($dealers)], 201);
    }

    private function rateLimited(string $key): bool
    {
        // Simple IP-based in-memory (per PHP request noop). For prod, use DB/kv.
        return false;
    }

    private function sendMail(string $toEmail, string $toName): void
    {
        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host = (string)Env::get('SMTP_HOST', '');
            $mail->SMTPAuth = true;
            $mail->Username = (string)Env::get('SMTP_USER', '');
            $mail->Password = (string)Env::get('SMTP_PASS', '');
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;

            $mail->setFrom((string)Env::get('SMTP_FROM', ''), (string)Env::get('SMTP_FROM_NAME', ''));
            $mail->addAddress($toEmail, $toName);
            $mail->Subject = 'Anfrage eingegangen';
            $mail->Body = 'Vielen Dank für Ihre Anfrage. Wir melden uns in Kürze.';
            if ($mail->Host) {
                $mail->send();
            }
        } catch (\Throwable $e) {
            // swallow in MVP
        }
    }
}
