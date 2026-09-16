# SPA architecture (no Inertia)

- This application is a traditional first-party React SPA. Do not introduce Inertia packages, middleware, `Inertia::render()`, or Inertia React APIs.
- React Router owns browser routing under `resources/js/router`. Laravel serves `resources/views/app.blade.php` via `SpaController` for frontend refreshes.
- Keep `/api/*`, `/sanctum/*`, `/up`, and Fortify endpoints outside the SPA catch-all.
- Use Sanctum cookie/session SPA authentication with Axios (`resources/js/lib/http.ts`). Never store auth tokens in browser storage.
- Use Fortify for authentication capabilities. App-owned JSON APIs belong under `/api/v1/...`.
- Keep UI aligned with Laravel's official React starter kit; architecture differs, visual UX should not.
