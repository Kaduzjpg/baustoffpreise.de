## Baustoffpreise vergleichen – Monorepo

Monorepo mit zwei Projekten für IONOS Deploy Now:
- apps/frontend – Next.js (App Router) als SSG/Static Export
- apps/api-php – PHP 8.2 API (PDO + PHPMailer)

Varianten:
- Monorepo (dieses Repo, npm workspaces)
- Alternative: Zwei Repositories (siehe Abschnitt "Zwei Repos").

### Struktur

/apps
  /frontend        # Next.js 14/15 – SSG, export nach out/
  /api-php         # PHP 8.2 API – public/ mit .htaccess
.github/workflows  # (optional) Beispiel-Workflows
package.json       # Workspaces Root
README.md

### Frontend
- Next.js (App Router), TypeScript, Tailwind, shadcn/ui-Stil
- SSG only: keine Next-SSR/APIs; Daten via PHP-API unter `/api/*`
- Build/Export: `next build && next export` → `apps/frontend/out`
- Lokaler Start: `serve out`
- SEO: `<head>`, OpenGraph, hreflang de, strukturierte Daten (Product, BreadcrumbList)

.env (nicht committen):
NEXT_PUBLIC_API_BASE=/api
NEXT_PUBLIC_ASSET_BASE=/

### Backend (PHP API)
Endpoints:
- POST `/api/quote/submit`
- GET `/api/catalog/categories`
- GET `/api/catalog/products`
- GET `/api/catalog/products/:id`
- GET `/api/dealers/near?postalCode=xxxxx&radius=50`

.env.php (nicht committen): DB_*, SMTP_*, CORS_ALLOW_ORIGIN, CSRF_SECRET.

`public/.htaccess`: Rewrite `/api/*` → `index.php`. CORS nur eigene Domain.

### IONOS Deploy Now
Zwei Projekte:
- Frontend: Framework Next.js, Build `npm ci && npm run export`, Output `apps/frontend/out`
- API-PHP: Public `apps/api-php/public`, .htaccess aktiv

Deploy Now erstellt GitHub Actions automatisch. Beispiel-YAMLs liegen unter `.github/workflows`.

### Zwei Repos (Alternative)
- Repo 1: frontend-only, Root ist Next.js-App
- Repo 2: api-php-only, Root ist PHP-App (public/)

### Entwicklung
- `npm install` (Root)
- `npm run export`

Weitere Details in den Verzeichnissen `apps/frontend` und `apps/api-php`.
