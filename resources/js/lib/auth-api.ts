import {
    ensureCsrfCookie,
    http,
    isNormalizedApiError,
    isRequestAborted,
    normalizeApiError,
} from '@/lib/http';
import type { User } from '@/types/auth';
import axios from 'axios';

export { isNormalizedApiError, isRequestAborted };

type UserResponse = {
    data: User;
};

type StatusResponse = {
    status?: string;
    message?: string;
};

/** Fortify answers with `{ two_factor: true }` when a challenge is required. */
export type LoginResult = {
    two_factor: boolean;
};

export async function fetchCurrentUser(options?: {
    signal?: AbortSignal;
}): Promise<User | null> {
    try {
        const response = await http.get<UserResponse>('/api/v1/user', {
            signal: options?.signal,
        });

        return response.data.data;
    } catch (error) {
        if (isRequestAborted(error)) {
            throw error;
        }

        if (axios.isAxiosError(error) && error.response?.status === 401) {
            return null;
        }

        throw normalizeApiError(error);
    }
}

export async function login(credentials: {
    email: string;
    password: string;
    remember: boolean;
}): Promise<LoginResult> {
    await ensureCsrfCookie();

    const response = await http.post<Partial<LoginResult>>('/login', {
        email: credentials.email,
        password: credentials.password,
        remember: credentials.remember,
    });

    return { two_factor: response.data?.two_factor === true };
}

export async function register(payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}): Promise<void> {
    await ensureCsrfCookie();
    await http.post('/register', payload);
}

export async function requestPasswordReset(email: string): Promise<string> {
    await ensureCsrfCookie();

    const response = await http.post<StatusResponse>('/forgot-password', {
        email,
    });

    return (
        response.data.status ??
        response.data.message ??
        'We have emailed your password reset link.'
    );
}

export async function resetPassword(payload: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
}): Promise<string> {
    await ensureCsrfCookie();

    const response = await http.post<StatusResponse>(
        '/reset-password',
        payload,
    );

    return (
        response.data.status ??
        response.data.message ??
        'Your password has been reset.'
    );
}

export async function resendVerificationEmail(): Promise<string> {
    await ensureCsrfCookie();

    const response = await http.post<StatusResponse>(
        '/email/verification-notification',
    );

    return (
        response.data.status ??
        response.data.message ??
        'verification-link-sent'
    );
}

export async function logout(): Promise<void> {
    await ensureCsrfCookie();
    await http.post('/logout');
}
