# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Setup
```bash
composer run setup
```
Runs: `composer install` → `.env` generation → key generation → migrations → `npm install` → build.

### Development
```bash
composer run dev
```
Starts concurrently: Laravel server (port 8000), queue listener, Pail log viewer, and Vite dev server (port 5173).

### Build
```bash
npm run build
```

### Testing
```bash
composer run test
```
Clears config cache, then runs PHPUnit. Tests use SQLite in-memory.

### Single test
```bash
php artisan test --filter TestName
```

### Linting
```bash
./vendor/bin/pint
```

## Architecture

This is a Laravel 12 + React 19 application for managing Costa Rican electronic invoices (Facturación Electrónica). The backend integrates with the `mythicbyte/mythicbyte-facturacion-electronica` package (loaded from a custom VCS repository), which exposes the API routes under `/api/v1/mythicbyte/e-invoicing/`.

### Key routes
- `GET /` → `welcome` view
- `GET /facturacion` → `facturacion` view (main invoicing UI)
- `/api/v1/mythicbyte/e-invoicing/documents` — paginated document list (provided by the MythicByte package, not in `routes/web.php`)

### Frontend
React components are bundled by Vite and mounted in Blade views. The main component is `resources/js/components/ReceiptsTable.jsx`, which fetches paginated documents from the MythicByte API and renders them with status badges, currency formatting (CRC / `es-CR` locale), and dark-mode support via Tailwind CSS 4.

### Docker
`compose.yaml` defines a Laravel Sail PHP 8.5 service and a MySQL 8.4 service. The local `.env` targets MySQL; `.env.example` defaults to SQLite.
