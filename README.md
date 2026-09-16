# Laravel React SPA Starter Kit

Community-maintained starter kit that targets the same UI/UX quality as Laravel's official [React starter kit](https://github.com/laravel/react-starter-kit), with one fundamental difference:

**This project does not use Inertia.**

It is a traditional first-party React SPA backed by Laravel:

- Laravel exposes JSON / session authentication behavior
- React owns client-side routing and page rendering
- Everything lives in a single Laravel repository

## Create a new application

With the [Laravel installer](https://laravel.com/docs/installation#installing-php):

```bash
laravel new my-app --using=muradyanvano1995/laravel-react-spa-starter-kit
```

The generated project is a normal Laravel application. Customize routes, models, pages, and configuration freely — the starter kit is a starting point, not a locked framework.

## Relationship to Laravel's official React starter kit

|                           | Official kit               | This kit                         |
| ------------------------- | -------------------------- | -------------------------------- |
| Frontend                  | React + Inertia            | React + React Router             |
| Backend routing for pages | Laravel + Inertia          | Laravel SPA shell + React Router |
| Auth                      | Fortify                    | Fortify                          |
| SPA session auth          | Shared Inertia session     | Sanctum cookie/session SPA auth  |
| UI goal                   | Official React starter kit | Same visual/UX target            |

UI feature parity with the official kit is intentional and ongoing. Authentication and the authenticated app shell / settings experience (profile, security/password/2FA, appearance) are implemented. Passkeys UI remains deferred.

## Stack

- Laravel 13
- Laravel Fortify
- Laravel Sanctum (cookie/session SPA authentication — not JWT)
- React 19
- TypeScript
- React Router
- Vite (+ Vite+)
- Tailwind CSS 4
- shadcn/ui (auth components adapted from the official kit)
- Pest (backend tests)
- Vitest + Testing Library (frontend tests)

## Requirements

- PHP 8.3+
- Composer
- Node.js 22+ (recommended)
- SQLite (default) or another supported database

## Installation (from a clone)

```bash
composer setup
```

Or manually:

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
npm install
npm run build
```

`npm run build` and `npm run dev` run Laravel Wayfinder via `@laravel/vite-plugin-wayfinder` (`php artisan wayfinder:generate --with-form`). That regenerates gitignored TypeScript helpers under `resources/js/actions`, `resources/js/routes`, and `resources/js/wayfinder`. Fresh clones do not need those directories committed; generation happens automatically on Vite build/dev start. You can also run `php artisan wayfinder:generate --with-form` manually.

## Development

```bash
composer run dev
# or
php artisan serve
npm run dev
```

## Testing

```bash
# Backend (Pint + PHPStan + Pest via composer test)
composer test

# Frontend unit/component tests
npm run test

# Full CI-style checks
composer ci:check
```

## Build

```bash
npm run build
```

## Architecture overview

```
Browser ──► Laravel (web) ──► Blade SPA shell (resources/views/app.blade.php)
                │
                └──► React app (resources/js)
                        ├── React Router (pages, layouts, guards)
                        ├── AuthProvider (bootstrap /api/v1/user)
                        └── Axios HTTP layer (cookies + CSRF)

Auth mutations ──► Fortify endpoints (/login, /register, /logout, …)
API reads/writes ──► /api/v1/... (Sanctum stateful session)
CSRF bootstrap ──► GET /sanctum/csrf-cookie
```

### Same-origin deployment (default)

This starter kit is optimized for a **same-origin** deployment where Laravel and the React SPA share one host:

```text
https://example.com
```

Sanctum stateful cookie authentication, CSRF (`XSRF-TOKEN`), and session cookies work out of the box in that layout.

Serving the SPA from a separate frontend origin (for example `https://app.example.com` calling `https://api.example.com`) requires additional Sanctum stateful domains, session cookie domain/SameSite, CORS, and `SANCTUM_STATEFUL_DOMAINS` / `SESSION_DOMAIN` configuration. That split-origin setup is intentionally out of scope for the default kit.

Relevant environment variables:

| Variable                   | Role                                                                  |
| -------------------------- | --------------------------------------------------------------------- |
| `APP_URL`                  | Application origin (used for URLs, signed links, and local disk URLs) |
| `SESSION_DOMAIN`           | Cookie domain (leave empty for same-origin defaults)                  |
| `SESSION_SECURE_COOKIE`    | Prefer `true` behind HTTPS in production                              |
| `SANCTUM_STATEFUL_DOMAINS` | Hosts allowed for stateful SPA cookies (defaults cover local hosts)   |
| `MAIL_*`                   | Required for real password-reset and email-verification delivery      |

### Mail configuration

Password reset and email verification notifications are sent through Laravel's mailer. Configure `MAIL_*` (or a local driver such as Mailpit / log) before relying on those flows outside of tests. In local development, the default `.env.example` mail settings are suitable for catching mail with a local catcher; production needs a real SMTP or API mailer.

### SPA fallback routing

Laravel serves the SPA shell for frontend browser routes such as `/dashboard`, `/login`, and `/settings/profile`.

The catch-all **does not** swallow:

- `/api/*`
- `/sanctum/*`
- `/up`
- `/email/*` (Fortify signed verification)
- `/storage/*` (Laravel local disk serving)
- Fortify POST endpoints
- Existing public assets

### Authentication architecture

- First-party SPA on the same Laravel origin
- Cookie + session authentication via Sanctum `statefulApi()`
- CSRF via `/sanctum/csrf-cookie` and `X-XSRF-TOKEN`
- No auth tokens in `localStorage` / `sessionStorage` / IndexedDB
- Fortify owns authentication capabilities (login, register, password reset, email verification, 2FA)
- Frontend `AuthProvider` loads `/api/v1/user` on boot and drives protected/guest route guards
- Centralized Axios handling clears SPA auth state on session-expiration `401` and routes password-confirmation `423` to `/confirm-password` (without replaying the original mutation)

### Account deletion

Authenticated users can delete their own account with current-password confirmation, including when email is still unverified. (The official Inertia kit also requires `verified` for destroy; this kit intentionally allows unverified owners to remove their account.)

### Current API endpoints

| Method | Path                        | Purpose                                             |
| ------ | --------------------------- | --------------------------------------------------- |
| GET    | `/api/v1/user`              | Authenticated current user (SPA bootstrap)          |
| GET    | `/api/v1/settings/security` | Security settings flags (2FA state, password rules) |
| DELETE | `/settings/profile`         | Delete account (password required; session cleared) |
| GET    | `/sanctum/csrf-cookie`      | CSRF cookie initialization                          |
| *      | Fortify routes              | Login, logout, profile, password, 2FA, confirm, …   |

## Directory structure (frontend)

```
resources/js/
  app.tsx                 # React root
  auth/                   # Auth provider + tests
  components/             # Shared UI helpers
  layouts/                # App / guest / settings shells
  lib/                    # HTTP client, auth API helpers
  pages/                  # Route pages
  router/                 # React Router + guards
  types/                  # Domain / API types
  testing/                # Test setup
```

## What exists now

- Zero Inertia runtime/application dependency
- React Router frontend architecture
- Laravel SPA shell + safe fallback routing
- Sanctum cookie/session SPA wiring
- Fortify authentication (`views` disabled for SPA)
- Login, registration, logout, forgot/reset password, email verification UI
- Two-factor challenge + password confirmation pages
- Official-style authenticated app shell (sidebar, breadcrumbs, user menu)
- Settings: Profile, Security (password + 2FA + recovery codes), Appearance
- Account deletion with password confirmation
- Light / dark / system appearance with persistence and flash prevention
- Intended-route redirects and verified-email gating
- Official-kit-aligned layouts + shadcn/ui components
- Centralized Axios HTTP layer with Laravel error normalization
- Auth bootstrap + protected/guest/verified route infrastructure
- Current-user JSON API with safe resource serialization
- Backend and frontend authentication/settings tests
- Updated AI agent guidance for non-Inertia SPA work

## Planned next

- Passkeys UI (optional; Fortify dependency present, feature not enabled in default UI)
- Broader end-to-end browser coverage
- Additional starter polish as the official kit evolves

## Contribution / development expectations

- Do **not** introduce Inertia
- Prefer Fortify + Sanctum over custom auth protocols
- Keep UI aligned with Laravel's official React starter kit
- Add/adjust tests with architecture or behavior changes
- Run quality gates (`composer test`, `npm run check`, `npm run test`, `npm run build`) before merging
- Never log or persist 2FA secrets, QR payloads, or recovery codes in browser storage

## License

MIT — see the root [`LICENSE`](LICENSE) file. Portions of UI/structure are adapted from Laravel's MIT-licensed React starter kit; see [`NOTICE.md`](NOTICE.md) for attribution.
