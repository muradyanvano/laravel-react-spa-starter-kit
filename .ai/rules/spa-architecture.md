# SPA architecture (no Inertia)

- This application is a traditional first-party React SPA. Do not introduce Inertia packages, middleware, `Inertia::render()`, or Inertia React APIs.
- React Router owns browser routing under `resources/js/router`. Laravel serves `resources/views/app.blade.php` via `SpaController` for frontend refreshes.
- Keep `/api/*`, `/sanctum/*`, `/up`, `/email/*`, `/storage/*`, and Fortify endpoints outside the SPA catch-all.
- Use Sanctum cookie/session SPA authentication with Axios (`resources/js/lib/http.ts`). Never store auth tokens in browser storage.
- Use Fortify for authentication capabilities (login, register, password reset, email verification, 2FA, password confirmation, profile/password updates). App-owned JSON APIs belong under `/api/v1/...` (for example security settings status). Destructive account deletion uses the web `DELETE /settings/profile` route so the session can be invalidated.
- Authenticated UI uses the official-kit-style sidebar shell (`layouts/app-layout.tsx`) and settings layout with Profile / Security / Appearance.
- Appearance is client-driven (`hooks/use-appearance.tsx`) via `localStorage` + `appearance` cookie; do not invent a second theme system. Persist `sidebar_state` as an unencrypted cookie.
- Two-factor secrets, QR payloads, and recovery codes are Fortify-owned and must never be logged, stored in browser storage, or included on the current-user endpoint.
- Passkeys are a Fortify transitive dependency (`laravel/passkeys`). They are not part of this kit's default UI; leave them disabled/deferred unless explicitly requested.
- Keep UI aligned with Laravel's official React starter kit; architecture differs, visual UX should not.
