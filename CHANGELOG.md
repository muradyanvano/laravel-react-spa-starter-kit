# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-09-18

### Added

- Fortify passkey authentication (WebAuthn) via `laravel/passkeys` and `@laravel/passkeys`
- Passkey sign-in on the login page (`PasskeyVerify`)
- Passkey-based password confirmation on the confirm-password page
- Passkey management under **Settings → Security**:
    - list passkeys (safe metadata only)
    - register/add passkey
    - delete passkey with confirmation dialog
- `GET /api/v1/settings/passkeys` for safe passkey metadata (`PasskeyResource`)
- `canManagePasskeys` capability on `GET /api/v1/settings/security`
- Frontend passkey helpers (`preparePasskeyCeremony`, contextual 423 navigation)
- Pest and Vitest coverage for passkey login, confirmation, management, and request ownership

### Security

- Passkey registration and deletion require Fortify password confirmation when enabled (HTTP 423)
- Passkey metadata API exposes display fields only; credential material is never serialized
- Cross-user passkey deletion is denied
- Passkey login uses native Fortify authentication; password-login 2FA challenge does not apply to passkey login

### Changed

- Security settings page section order matches the official React starter kit: Password → Two-factor → Passkeys

## [1.0.0] - 2026-09-17

### Added

- Initial stable release of the Laravel React SPA starter kit (React Router SPA, no Inertia)
- Laravel Fortify authentication: registration, login, logout, password reset, email verification, password confirmation
- Two-factor authentication and recovery codes
- Profile settings (update profile, change password, delete account)
- Security and appearance settings
- Sanctum cookie/session SPA authentication with CSRF protection
- Laravel Wayfinder integration for typed routes and actions
- React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui
- Pest, Vitest, PHPStan, and Pint quality gates with CI coverage

[Unreleased]: https://github.com/muradyanvano/laravel-react-spa-starter-kit/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/muradyanvano/laravel-react-spa-starter-kit/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/muradyanvano/laravel-react-spa-starter-kit/releases/tag/v1.0.0
