## IONOS Deploy Now – Setup

Erzeuge zwei Projekte und verbinde das GitHub-Repo.

Frontend (Next.js SSG):
- Build Command: `npm ci && npm run export`
- Output Directory: `apps/frontend/out`
- ENV: Werte aus `.deploy-now/frontend/.env.template` übernehmen

API-PHP:
- Runtime: PHP 8.2
- Public Directory: `apps/api-php/public`
- .htaccess aktiv
- ENV: Werte aus `.deploy-now/api-php/.env.template.php` übernehmen → Datei im Projekt als `apps/api-php/.env.php` hinterlegen

Branch-Previews aktivieren und Domains zuweisen (www → Frontend, api → API).
