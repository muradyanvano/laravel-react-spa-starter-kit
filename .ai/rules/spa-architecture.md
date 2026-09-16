# SPA architecture (no Inertia)

- This application is a traditional first-party React SPA. Do not introduce Inertia packages, middleware, `Inertia::render()`, or Inertia React APIs.
- React Router owns browser routing under `resources/js/router`. Laravel serves `resources/views/app.blade.php` via `SpaController` for frontend refreshes.
- Keep `/api/*`, `/sanctum/*`, `/up`, `/email/*`, `/storage/*`, and Fortify endpoints outside the SPA catch-all.
- Use Sanctum cookie/session SPA authentication with Axios (`resources/js/lib/http.ts`). Never store auth tokens in browser storage.
- Use Fortify for authentication capabilities (login, register, password reset, email verification, 2FA, password confirmation, profile/password updates). App-owned JSON APIs belong under `/api/v1/...` (for example security settings status). Destructive account deletion uses the web `DELETE /settings/profile` route so the session can be invalidated.
- Authenticated UI uses the official-kit-style sidebar shell (`layouts/app-layout.tsx`) and settings layout with Profile / Security / Appearance.
- Appearance is client-driven (`hooks/use-appearance.tsx`) via `localStorage` + `appearance` cookie; do not invent a second theme system. Persist `sidebar_state` as an unencrypted cookie.
- Auth bootstrap uses a single centered `AppLoader` in the router root. Do not reintroduce route-level `React.lazy`/`Suspense` loaders or plain “Loading…” placeholders for normal navigation. Page data uses contextual skeletons; mutations use local button spinners.
- AuthProvider owns `/api/v1/user` bootstrap and lives above route transitions. Pages consume `useAuth()`; call `refreshUser()` only after auth/profile mutations. Security owns its confirmation-status + settings initialization (once per visit). Do not add request-cache libraries or global URL deduplication maps.
- In development, React StrictMode intentionally remounts effects once. AbortController cleanup cancels the first in-flight bootstrap request; the remount’s request completes. That canceled→200 DevTools pair is expected in development only. Production mounts once. Do not disable StrictMode, add module-level init flags, artificial delays, or promise caches solely to hide this.
- Password confirmation (HTTP 423) is handled contextually by sensitive callers via `navigateToConfirmPasswordIfRequired`, not as a global Axios navigation side effect.
- Two-factor secrets, QR payloads, and recovery codes are Fortify-owned and must never be logged, stored in browser storage, or included on the current-user endpoint.
- Passkeys are a Fortify transitive dependency (`laravel/passkeys`). They are not part of this kit's default UI; leave them disabled/deferred unless explicitly requested.
- Keep UI aligned with Laravel's official React starter kit; architecture differs, visual UX should not.
