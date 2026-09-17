import {
    Passkeys,
    UserCancelledError,
    type PasskeyError,
} from '@laravel/passkeys';
import { ensureCsrfCookie } from '@/lib/http';

let configured = false;

export type PasskeyCeremonyRoutes = {
    options: string;
    submit: string;
};

export const passkeyLoginRoutes: PasskeyCeremonyRoutes = {
    options: '/passkeys/login/options',
    submit: '/passkeys/login',
};

export const passkeyConfirmRoutes: PasskeyCeremonyRoutes = {
    options: '/passkeys/confirm/options',
    submit: '/passkeys/confirm',
};

export const passkeyRegisterRoutes: PasskeyCeremonyRoutes = {
    options: '/user/passkeys/options',
    submit: '/user/passkeys',
};

export const PASSKEY_PASSWORD_CONFIRMATION_MESSAGE =
    'Password confirmation required.';

export function isPasskeyPasswordConfirmationError(
    error: PasskeyError | null,
): boolean {
    return error?.message === PASSKEY_PASSWORD_CONFIRMATION_MESSAGE;
}

/**
 * Configure the passkeys client once for Sanctum same-origin session auth.
 */
export function configurePasskeysClient(): void {
    if (configured) {
        return;
    }

    Passkeys.configure({
        fetch: {
            credentials: 'include',
        },
    });

    configured = true;
}

/**
 * Ensure Sanctum CSRF state exists before a WebAuthn ceremony.
 */
export async function preparePasskeyCeremony(): Promise<void> {
    await ensureCsrfCookie();
}

export function isPasskeyUserCancellation(error: PasskeyError | null): boolean {
    return error instanceof UserCancelledError;
}

/**
 * Map passkey errors to safe user-facing messages. Cancellation is silent.
 */
export function mapPasskeyErrorMessage(
    error: PasskeyError | string | null,
): string | null {
    if (!error) {
        return null;
    }

    if (typeof error === 'string') {
        return error;
    }

    if (error instanceof UserCancelledError) {
        return null;
    }

    return error.message;
}
