# Contributing

Thanks for your interest in improving this community Laravel React SPA starter kit.

## Ways to contribute

- Bug fixes
- Documentation improvements
- Accessibility improvements
- Tests
- Carefully scoped features

## Before opening an issue

- Search existing issues for duplicates
- Reproduce against the latest relevant code (`develop` or the latest stable release, as appropriate)
- Include environment details (OS, PHP, Node, package version or commit)

## Branch strategy

| Branch    | Role                               |
| --------- | ---------------------------------- |
| `main`    | Release-ready / stable line        |
| `develop` | Active integration and development |

- Feature and fix work should normally target **`develop`**
- Releases are merged/promoted to **`main`**
- Do not push directly to `main`

Pull requests should normally target **`develop`**.

## Development setup

```bash
git clone https://github.com/muradyanvano/laravel-react-spa-starter-kit.git
cd laravel-react-spa-starter-kit
composer setup
```

Then for day-to-day development:

```bash
composer dev
```

Or run `php artisan serve` and `npm run dev` in separate terminals.

## Quality gates

Before opening a pull request, run:

```bash
composer ci:check
```

That runs frontend format/lint, TypeScript, Vitest, and the backend suite (Pint, PHPStan, Pest).

Useful individual commands:

```bash
composer test
npm run test
npm run check
npm run types:check
npm run build
```

## Coding expectations

- Follow existing Laravel and React / TypeScript conventions in the repository
- Preserve the React Router SPA architecture; do **not** introduce Inertia.js
- Preserve Fortify / Sanctum cookie-session authentication unless an approved architectural change requires otherwise
- Add or update tests for behavior changes
- Keep TypeScript and static analysis healthy
- Prefer focused PRs; avoid unrelated refactors

## Generated Wayfinder files

These directories are generated and gitignored:

- `resources/js/actions`
- `resources/js/routes`
- `resources/js/wayfinder`

Do not edit or commit them. They are produced by `@laravel/vite-plugin-wayfinder` during `npm run build` / `npm run dev`, or explicitly via:

```bash
npm run wayfinder:generate
```

## Pull requests

Include:

- A clear summary
- Motivation / context
- Testing performed (`composer ci:check` or the relevant subset)
- Screenshots for meaningful UI changes
- Breaking-change notes when applicable

Prefer focused PRs.

## License

By contributing, you agree that your contributions are licensed under the project’s MIT License. See [`LICENSE`](LICENSE) and [`NOTICE.md`](NOTICE.md).
