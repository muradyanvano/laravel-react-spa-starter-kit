import { isNormalizedApiError, normalizeApiError } from '@/lib/http';
import { getSafeInternalPath } from '@/lib/navigation';
import type { NavigateFunction } from 'react-router';

/**
 * If the error is HTTP 423, navigate to password confirmation and return true.
 * Callers must not automatically replay the failed mutation.
 */
export function navigateToConfirmPasswordIfRequired(
    error: unknown,
    navigate: NavigateFunction,
    from: string,
): boolean {
    const normalized = isNormalizedApiError(error)
        ? error
        : normalizeApiError(error);

    if (normalized.kind !== 'password_confirmation') {
        return false;
    }

    const intended = getSafeInternalPath(from, '/settings/security');

    void navigate('/confirm-password', {
        replace: true,
        state: { from: intended },
    });

    return true;
}
