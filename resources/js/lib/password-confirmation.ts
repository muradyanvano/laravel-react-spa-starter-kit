import { isNormalizedApiError, normalizeApiError } from '@/lib/http';
import { getSafeInternalPath } from '@/lib/navigation';
import {
    isPasskeyPasswordConfirmationError,
    PASSKEY_PASSWORD_CONFIRMATION_MESSAGE,
} from '@/lib/passkeys';
import { PasskeyError } from '@laravel/passkeys';
import type { NavigateFunction } from 'react-router';

function isPasswordConfirmationRequired(error: unknown): boolean {
    if (
        error instanceof PasskeyError &&
        isPasskeyPasswordConfirmationError(error)
    ) {
        return true;
    }

    if (
        error instanceof Error &&
        error.message === PASSKEY_PASSWORD_CONFIRMATION_MESSAGE
    ) {
        return true;
    }

    const normalized = isNormalizedApiError(error)
        ? error
        : normalizeApiError(error);

    return normalized.kind === 'password_confirmation';
}

/**
 * If the error is HTTP 423, navigate to password confirmation and return true.
 * Callers must not automatically replay the failed mutation.
 */
export function navigateToConfirmPasswordIfRequired(
    error: unknown,
    navigate: NavigateFunction,
    from: string,
): boolean {
    if (!isPasswordConfirmationRequired(error)) {
        return false;
    }

    const intended = getSafeInternalPath(from, '/settings/security');

    void navigate('/confirm-password', {
        replace: true,
        state: { from: intended },
    });

    return true;
}
