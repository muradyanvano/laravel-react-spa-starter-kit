# Security Policy

## Supported versions

| Version                                                                         | Supported                         |
| ------------------------------------------------------------------------------- | --------------------------------- |
| Latest stable release (currently `v1.0.0`)                                      | Yes                               |
| Older stable releases                                                           | No guarantee of security fixes    |
| Development branches (`main` before a release cut, `develop`, feature branches) | Not treated as supported releases |

Support focuses on the latest stable release. No end-of-life dates are promised beyond that policy.

## Reporting a vulnerability

Do **not** report security vulnerabilities through public GitHub issues.

If private vulnerability reporting is enabled for this repository, use GitHub’s **Report a vulnerability** option:

Repository → **Security** → **Report a vulnerability**

Direct link (when enabled):
https://github.com/muradyanvano/laravel-react-spa-starter-kit/security/advisories/new

If that option is unavailable, open a private security advisory request through the repository Security tab, or contact the maintainers through a non-public channel they publish for security reports.

## What to include

Please include:

- Affected version (for example `v1.0.0`) or commit SHA
- Clear description of the vulnerability
- Steps to reproduce
- Expected vs actual behavior
- Security impact
- Minimal proof of concept when appropriate
- Suggested remediation if known

Do **not** include real credentials, secrets, private user data, or destructive payloads.

## Response process

Reports are reviewed for impact and reproducibility. When a fix is warranted, maintainers prepare a patch and may use coordinated disclosure. A release and/or advisory may be published when appropriate.

Timelines depend on severity and complexity. No fixed response SLA is promised.

## Scope

Generally in scope:

- Starter-kit application code in this repository
- Authentication and session integration as shipped here
- Authorization and security-sensitive defaults introduced by this kit
- Laravel / React integration choices made in this repository

Generally out of scope as sole upstream defects:

- Laravel, Fortify, Sanctum, React, React Router, Vite, and other dependencies

Report those to the relevant upstream project. If this starter kit configures or uses an upstream dependency insecurely, that **is** relevant here.

## Guidance for generated applications

Applications created from this starter kit become independent applications. Operators are responsible for:

- Keeping Composer and npm dependencies updated
- Protecting `.env` and other secrets
- Using HTTPS and secure cookie settings in deployment
- Configuring CORS / Sanctum correctly for split-origin setups
- Configuring mail and infrastructure securely
- Reviewing application-specific authorization
- Running security and audit tooling as appropriate for their environment
