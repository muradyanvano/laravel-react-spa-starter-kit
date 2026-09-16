# Laravel React SPA Starter Kit

Community-maintained [Laravel](https://laravel.com) starter kit for building a first-party React SPA with official-style UI/UX — **without Inertia.js**.

This is not an official Laravel product and is not endorsed by Laravel.

## Stack

- Laravel 13 + PHP 8.3+
- React 19 + TypeScript
- React Router
- Laravel Fortify
- Laravel Sanctum (cookie / session SPA auth — not JWT)
- Tailwind CSS 4 + shadcn/ui
- Laravel Wayfinder
- Vite

## Architecture

| Concern                | This kit                        |
| ---------------------- | ------------------------------- |
| Browser routing        | React Router                    |
| Auth capabilities      | Laravel Fortify                 |
| SPA session auth       | Sanctum stateful cookies + CSRF |
| HTTP client            | Axios                           |
| Typed routes / actions | Laravel Wayfinder               |
| Page shell             | Blade SPA shell + React         |
| Inertia                | **Not used**                    |

Official React starter-kit look and flows are the UX target; the runtime architecture is a traditional same-origin SPA.

## Features

- Registration, login, logout
- Forgot / reset password
- Email verification
- Password confirmation
- Profile settings
- Password change
- Account deletion
- Two-factor authentication + recovery codes
- Light / dark / system appearance

Passkey UI is not included in this release (Fortify’s passkeys package may still install schema; the feature is intentionally deferred).

## Create a new application (after Packagist release)

Intended consumer command once this kit is published on Packagist:

```bash
laravel new my-app --using=muradyanvano1995/laravel-react-spa-starter-kit
```

That Packagist install path is the release goal. Until publication completes, use the development/source path below.

The generated project is a normal Laravel application you own and can customize freely.

## Requirements

- PHP 8.3+
- Composer
- Node.js 22+ (recommended)
- SQLite (default) or another supported database

## Setup (clone or generated app)

Primary path (cross-platform):

```bash
composer run setup
```

This installs PHP/JS dependencies, creates `.env` when missing, generates `APP_KEY`, runs migrations, and builds the frontend (including Wayfinder generation).

### Manual equivalent

1. `composer install`
2. Copy `.env.example` to `.env` (any OS file copy is fine)
3. `php artisan key:generate`
4. `php artisan migrate`
5. `npm install`
6. `npm run build`

## Wayfinder

These directories are **generated** and gitignored:

- `resources/js/actions`
- `resources/js/routes`
- `resources/js/wayfinder`

Do not edit or commit them. `npm run build` / `npm run dev` generate them via `@laravel/vite-plugin-wayfinder`. `npm run types:check` also ensures they exist before TypeScript runs.

On a completely fresh tree, run `composer run setup` (or at least `npm run build` / `npm run types:check`) before expecting TypeScript imports from `@/routes` to resolve.

## Development

```bash
composer run dev
```

Or run `php artisan serve` and `npm run dev` in separate terminals.

## Testing

```bash
composer test          # Pint + PHPStan + Pest
npm run test           # Vitest
composer ci:check      # Frontend gates + backend test suite
```

## Same-origin Sanctum auth

Default design: Laravel and the SPA share one origin (for example `https://example.com`). Session cookies, `/sanctum/csrf-cookie`, and `X-XSRF-TOKEN` work without storing auth tokens in browser storage.

Split-origin deployments need correct `SANCTUM_STATEFUL_DOMAINS`, session cookie domain/SameSite, CORS, and CSRF configuration. That layout is out of scope for the default kit.

Useful variables: `APP_URL`, `SESSION_DOMAIN`, `SESSION_SECURE_COOKIE`, `SANCTUM_STATEFUL_DOMAINS`, `MAIL_*`.

## Mail

Password reset and email verification use Laravel’s mailer. Configure `MAIL_*` (or a local driver such as log / Mailpit) before relying on those flows outside tests.

## SPA fallback routing

Laravel serves the Blade SPA shell for browser routes such as `/dashboard` and `/settings/profile`. The catch-all does **not** swallow `/api/*`, `/sanctum/*`, `/up`, `/email/*`, `/storage/*`, Fortify endpoints, or public assets.

## Source / development install

Working on this repository itself:

```bash
git clone https://github.com/muradyanvano1995/laravel-react-spa-starter-kit.git
cd laravel-react-spa-starter-kit
composer run setup
```

Laravel Boost is included as an optional dev dependency for AI-assisted coding. Generated Boost state (`boost.json`, agent guideline files) is gitignored and is **not** shipped to Packagist consumers. After creating an app, run `php artisan boost:install` locally if you want Boost guidelines/skills. The Laravel installer may also offer Boost during `laravel new`.

## License

MIT — see [`LICENSE`](LICENSE).

UI/structure portions are adapted from Laravel’s MIT-licensed [React starter kit](https://github.com/laravel/react-starter-kit); see [`NOTICE.md`](NOTICE.md).

This repository: `muradyanvano1995/laravel-react-spa-starter-kit`.  
Upstream reference: `laravel/react-starter-kit`.
