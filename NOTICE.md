# Third-party notices

This project adapts MIT-licensed UI components, layouts, and patterns from:

- Laravel React Starter Kit
  https://github.com/laravel/react-starter-kit
  Commit reference used for authentication, app shell, settings, and passkey UI phases:
  `0c94c26ff7711255e7a92996eedf97689240e51c`

Passkey UI and flows (login verification, registration, management) follow patterns from
the official React starter kit. The runtime architecture differs: this kit uses a
React Router SPA with Axios and Sanctum session auth instead of Inertia.js.

Laravel and the official starter kits are copyright their respective owners
and licensed under the MIT license.

WebAuthn passkey ceremonies are provided by [`laravel/passkeys`](https://github.com/laravel/passkeys)
(PHP) and [`@laravel/passkeys`](https://www.npmjs.com/package/@laravel/passkeys) (JavaScript).
