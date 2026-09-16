/**
 * Return a safe same-origin SPA path for post-login redirects.
 * Rejects protocol-relative, absolute, and malformed destinations.
 */
export function getSafeInternalPath(
    candidate: unknown,
    fallback = '/dashboard',
): string {
    if (typeof candidate !== 'string' || candidate.length === 0) {
        return fallback;
    }

    if (
        !candidate.startsWith('/') ||
        candidate.startsWith('//') ||
        candidate.includes('://') ||
        candidate.includes('\\')
    ) {
        return fallback;
    }

    return candidate;
}

/**
 * Post-auth destination after login / 2FA.
 * Never resume password-confirmation itself as the intended page.
 */
export function getPostAuthPath(
    candidate: unknown,
    fallback = '/dashboard',
): string {
    const path = getSafeInternalPath(candidate, fallback);
    const pathname = path.split('?')[0] ?? path;

    if (pathname === '/confirm-password') {
        return fallback;
    }

    return path;
}

export function locationToPath(location: {
    pathname: string;
    search: string;
}): string {
    return `${location.pathname}${location.search}`;
}
