import {
    ensureCsrfCookie,
    http,
    isRequestAborted,
    normalizeApiError,
} from '@/lib/http';
import { confirmation as confirmedPasswordStatus } from '@/routes/password';
import { store as confirmPasswordRoute } from '@/routes/password/confirm';
import {
    confirm as confirmTwoFactorRoute,
    disable as disableTwoFactorRoute,
    enable as enableTwoFactorRoute,
    qrCode as twoFactorQrCodeRoute,
    recoveryCodes as twoFactorRecoveryCodesRoute,
    regenerateRecoveryCodes as regenerateRecoveryCodesRoute,
    secretKey as twoFactorSecretKeyRoute,
} from '@/routes/two-factor';
import { store as twoFactorChallengeRoute } from '@/routes/two-factor/login';
import { update as updatePasswordRoute } from '@/routes/user-password';
import { update as updateProfileRoute } from '@/routes/user-profile-information';
import type { Passkey } from '@/types/auth';

const PROFILE_DESTROY_URL = '/settings/profile';
const SECURITY_SETTINGS_URL = '/api/v1/settings/security';
const PASSKEYS_LIST_URL = '/api/v1/settings/passkeys';

export type SecuritySettings = {
    canManageTwoFactor: boolean;
    canManagePasskeys: boolean;
    twoFactorEnabled: boolean;
    requiresConfirmation: boolean;
    passwordRules: string;
};

export type TwoFactorQrCode = {
    svg: string;
    url: string;
};

export type PasswordConfirmationStatus = {
    confirmed: boolean;
};

type MaybeWrapped<T> = T | { data: T };

/** Laravel resources may wrap payloads in a `data` key; both shapes are accepted. */
function unwrap<T>(payload: MaybeWrapped<T>): T {
    if (
        typeof payload === 'object' &&
        payload !== null &&
        'data' in payload &&
        typeof (payload as { data: unknown }).data === 'object'
    ) {
        return (payload as { data: T }).data;
    }

    return payload as T;
}

export async function updateProfile(payload: {
    name: string;
    email: string;
}): Promise<void> {
    await ensureCsrfCookie();
    await http.put(updateProfileRoute.url(), payload);
}

export async function updatePassword(payload: {
    current_password: string;
    password: string;
    password_confirmation: string;
}): Promise<void> {
    await ensureCsrfCookie();
    await http.put(updatePasswordRoute.url(), payload);
}

export async function deleteAccount(payload: {
    password: string;
}): Promise<void> {
    await ensureCsrfCookie();
    await http.delete(PROFILE_DESTROY_URL, { data: payload });
}

export async function fetchSecuritySettings(options?: {
    signal?: AbortSignal;
}): Promise<SecuritySettings> {
    try {
        const response = await http.get<MaybeWrapped<SecuritySettings>>(
            SECURITY_SETTINGS_URL,
            { signal: options?.signal },
        );

        return unwrap(response.data);
    } catch (error) {
        if (isRequestAborted(error)) {
            throw error;
        }

        throw normalizeApiError(error);
    }
}

export async function enableTwoFactor(): Promise<void> {
    await ensureCsrfCookie();
    await http.post(enableTwoFactorRoute.url());
}

export async function confirmTwoFactor(payload: {
    code: string;
}): Promise<void> {
    await ensureCsrfCookie();
    await http.post(confirmTwoFactorRoute.url(), payload);
}

export async function disableTwoFactor(): Promise<void> {
    await ensureCsrfCookie();
    await http.delete(disableTwoFactorRoute.url());
}

export async function fetchTwoFactorQrCode(): Promise<TwoFactorQrCode> {
    try {
        const response = await http.get<TwoFactorQrCode>(
            twoFactorQrCodeRoute.url(),
        );

        return response.data;
    } catch (error) {
        throw normalizeApiError(error);
    }
}

export async function fetchTwoFactorSecretKey(): Promise<{
    secretKey: string;
}> {
    try {
        const response = await http.get<{ secretKey: string }>(
            twoFactorSecretKeyRoute.url(),
        );

        return response.data;
    } catch (error) {
        throw normalizeApiError(error);
    }
}

export async function fetchRecoveryCodes(): Promise<string[]> {
    try {
        const response = await http.get<string[]>(
            twoFactorRecoveryCodesRoute.url(),
        );

        return response.data;
    } catch (error) {
        throw normalizeApiError(error);
    }
}

export async function regenerateRecoveryCodes(): Promise<void> {
    await ensureCsrfCookie();
    await http.post(regenerateRecoveryCodesRoute.url());
}

export async function confirmPassword(payload: {
    password: string;
}): Promise<void> {
    await ensureCsrfCookie();
    await http.post(confirmPasswordRoute.url(), payload);
}

export async function fetchPasswordConfirmationStatus(options?: {
    signal?: AbortSignal;
}): Promise<PasswordConfirmationStatus> {
    try {
        const response = await http.get<PasswordConfirmationStatus>(
            confirmedPasswordStatus.url(),
            { signal: options?.signal },
        );

        return { confirmed: response.data.confirmed === true };
    } catch (error) {
        if (isRequestAborted(error)) {
            throw error;
        }

        throw normalizeApiError(error);
    }
}

export async function submitTwoFactorChallenge(payload: {
    code?: string;
    recovery_code?: string;
}): Promise<void> {
    await ensureCsrfCookie();
    await http.post(twoFactorChallengeRoute.url(), payload);
}

export async function fetchPasskeys(options?: {
    signal?: AbortSignal;
}): Promise<Passkey[]> {
    try {
        const response = await http.get<MaybeWrapped<Passkey[]>>(
            PASSKEYS_LIST_URL,
            { signal: options?.signal },
        );

        return unwrap(response.data);
    } catch (error) {
        if (isRequestAborted(error)) {
            throw error;
        }

        throw normalizeApiError(error);
    }
}

export async function deletePasskey(id: number): Promise<void> {
    try {
        await ensureCsrfCookie();
        await http.delete(`/user/passkeys/${id}`);
    } catch (error) {
        throw normalizeApiError(error);
    }
}
