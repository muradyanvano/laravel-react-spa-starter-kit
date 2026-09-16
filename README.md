# Laravel React SPA Starter Kit

A community Laravel starter kit for a first-party React SPA using React Router instead of Inertia.js.

[![CI](https://img.shields.io/github/actions/workflow/status/muradyanvano1995/laravel-react-spa-starter-kit/tests.yml?branch=main&label=CI)](https://github.com/muradyanvano1995/laravel-react-spa-starter-kit/actions/workflows/tests.yml)
[![Packagist Version](https://img.shields.io/packagist/v/muradyanvano1995/laravel-react-spa-starter-kit)](https://packagist.org/packages/muradyanvano1995/laravel-react-spa-starter-kit)
[![Packagist Downloads](https://img.shields.io/packagist/dt/muradyanvano1995/laravel-react-spa-starter-kit)](https://packagist.org/packages/muradyanvano1995/laravel-react-spa-starter-kit)
[![PHP Version](https://img.shields.io/packagist/php-v/muradyanvano1995/laravel-react-spa-starter-kit)](https://packagist.org/packages/muradyanvano1995/laravel-react-spa-starter-kit)
[![Laravel](https://img.shields.io/badge/Laravel-13.x-FF2D20?logo=laravel&logoColor=white)](https://laravel.com)
[![License](https://img.shields.io/github/license/muradyanvano1995/laravel-react-spa-starter-kit)](LICENSE)

This is **not** an official Laravel starter kit and is not endorsed by Laravel.

## Why this starter kit

Stack: **Laravel**, **React**, **TypeScript**, **React Router**, **Fortify**, **Sanctum**, **Wayfinder**, and **Vite**.

Architecture choice: a traditional same-origin SPA instead of Inertia.js.

```text
Laravel (API / Fortify / Sanctum)
  → Blade SPA shell
  → React + React Router
  → Axios
```

UI and developer experience are inspired by Laravel’s official React starter kit; the runtime is a conventional SPA with browser-owned routing.

## Quick Start

### Laravel Installer

```bash
laravel new my-app --using=muradyanvano1995/laravel-react-spa-starter-kit
cd my-app
npm run dev
```

The Laravel Installer may currently resolve `dev-main` for community `--using` kits. Prefer the Composer command below when you need an immutable release.

### Version-pinned Composer install

```bash
composer create-project \
  muradyanvano1995/laravel-react-spa-starter-kit \
  my-app \
  v1.0.0

cd my-app
npm run dev
```

### Requirements

- PHP 8.3+
- Composer
- Node.js 22+ (recommended; CI also covers Node 25)
- SQLite (default) or another supported database

The generated project is a normal Laravel application you own and can customize freely.

## Features

### Authentication

- Login / registration / logout
- Password reset
- Email verification
- Password confirmation
- Two-factor authentication
- Recovery codes

### Application

- Responsive sidebar shell and mobile navigation
- Dashboard
- Profile settings (including password change and account deletion)
- Security settings
- Appearance settings (light / dark / system)

Passkey UI is not included in this release (Fortify’s passkeys package may still install schema; the feature is intentionally deferred).

### Developer experience

- TypeScript
- Laravel Wayfinder
- Axios
- Tailwind CSS + shadcn/ui
- Pest, Vitest, PHPStan, Pint
- Optional Laravel Boost support

## Architecture

| Concern                | This kit                        |
| ---------------------- | ------------------------------- |
| Browser routing        | React Router                    |
| Auth capabilities      | Laravel Fortify                 |
| SPA session auth       | Sanctum stateful cookies + CSRF |
| HTTP client            | Axios                           |
| Typed routes / actions | Laravel Wayfinder               |
| Page shell             | Blade SPA shell + React         |
| Inertia                | Not used                        |

**Laravel** owns the API/backend, Fortify endpoints, Sanctum session authentication, and the SPA shell/fallback.

**React** owns browser routing, layouts/pages, authentication state, and API interaction.

Laravel serves the Blade SPA shell for browser routes such as `/dashboard` and `/settings/profile`. The catch-all does **not** swallow `/api/*`, `/sanctum/*`, `/up`, `/email/*`, `/storage/*`, Fortify endpoints, or public assets.

## Authentication and security

Default design: Laravel and the SPA share one origin (for example `https://example.com`).

- Sanctum cookie / session authentication (not JWT)
- CSRF protection via `/sanctum/csrf-cookie` and `X-XSRF-TOKEN`
- No auth tokens stored in `localStorage`
- Session regeneration on authentication events
- Password confirmation for sensitive actions
- Email verification
- Two-factor authentication and recovery-code handling

Split-origin deployments need correct `SANCTUM_STATEFUL_DOMAINS`, session cookie domain/SameSite, CORS, and CSRF configuration. That layout is out of scope for the default kit.

Useful variables: `APP_URL`, `SESSION_DOMAIN`, `SESSION_SECURE_COOKIE`, `SANCTUM_STATEFUL_DOMAINS`, `MAIL_*`.

Password reset and email verification use Laravel’s mailer. Configure `MAIL_*` (or a local driver such as log / Mailpit) before relying on those flows outside tests.

## Appearance

Appearance is client-driven (light / dark / system) via `localStorage` and an `appearance` cookie, matching the official-kit style settings experience.

## Development

From a generated app or a clone of this repository:

```bash
composer setup      # install deps, .env, key, migrate, build
composer dev        # concurrent PHP + Vite + queue/logs helpers
composer test       # Pint + PHPStan + Pest
composer ci:check   # frontend gates + backend suite
```

Frontend:

```bash
npm run dev
npm run build
npm run test
npm run check
npm run types:check
```

Or run `php artisan serve` and `npm run dev` in separate terminals.

### Working on this repository

```bash
git clone https://github.com/muradyanvano1995/laravel-react-spa-starter-kit.git
cd laravel-react-spa-starter-kit
composer setup
```

## Testing and quality

CI runs on pushes and pull requests against `main`, including:

- Pest (PHP)
- Vitest (React)
- PHPStan
- TypeScript (`types:check`)
- ESLint / formatting (`check`)
- Laravel Pint
- Production build verification
- Fresh git-archive consumer install checks
- Node.js **22** and **25** matrix coverage

Exact test counts belong in release notes; they change over time.

## Wayfinder

These directories are **generated** and gitignored:

- `resources/js/actions`
- `resources/js/routes`
- `resources/js/wayfinder`

Do not edit or commit them. `npm run build` / `npm run dev` generate them via `@laravel/vite-plugin-wayfinder`. `npm run types:check` also ensures they exist before TypeScript runs.

On a completely fresh tree, run `composer setup` (or at least `npm run build` / `npm run types:check`) before expecting TypeScript imports from `@/routes` to resolve.

## Laravel Boost

[`laravel/boost`](https://github.com/laravel/boost) is an optional development dependency for AI-assisted coding.

Boost setup is **not** mandatory. After creating an app, install Boost guidelines/skills only if you want them:

```bash
php artisan boost:install
```

The Laravel installer may also offer Boost during `laravel new`. Generated Boost state (`boost.json`, agent guideline files such as `AGENTS.md`) is gitignored and is **not** shipped to Packagist consumers.

## Attribution

UI and developer experience inspired by Laravel’s official [React starter kit](https://github.com/laravel/react-starter-kit).

This community project is independent of Laravel and is **not** an official starter kit maintained by Laravel. See [`NOTICE.md`](NOTICE.md) for third-party notices.

## Links

- [GitHub repository](https://github.com/muradyanvano1995/laravel-react-spa-starter-kit)
- [Packagist package](https://packagist.org/packages/muradyanvano1995/laravel-react-spa-starter-kit)
- [Laravel documentation](https://laravel.com/docs)
- [React documentation](https://react.dev)
- [React Router documentation](https://reactrouter.com)

## License

MIT — see [`LICENSE`](LICENSE) and [`NOTICE.md`](NOTICE.md).
