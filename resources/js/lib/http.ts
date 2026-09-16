import type {
    LaravelValidationErrorBody,
    LaravelValidationErrors,
    NormalizedApiError,
} from '@/types/http';
import axios, { type AxiosError, type AxiosInstance } from 'axios';

function isLaravelValidationBody(
    data: unknown,
): data is LaravelValidationErrorBody {
    if (typeof data !== 'object' || data === null) {
        return false;
    }

    const candidate = data as Partial<LaravelValidationErrorBody>;

    return (
        typeof candidate.message === 'string' &&
        typeof candidate.errors === 'object' &&
        candidate.errors !== null
    );
}

function messageFromBody(data: unknown, fallback: string): string {
    if (
        typeof data === 'object' &&
        data !== null &&
        'message' in data &&
        typeof data.message === 'string'
    ) {
        return data.message;
    }

    if (
        typeof data === 'object' &&
        data !== null &&
        'status' in data &&
        typeof data.status === 'string'
    ) {
        return data.status;
    }

    return fallback;
}

export function isNormalizedApiError(
    error: unknown,
): error is NormalizedApiError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'kind' in error &&
        'message' in error &&
        'errors' in error
    );
}

export function normalizeApiError(error: unknown): NormalizedApiError {
    if (isNormalizedApiError(error)) {
        return error;
    }

    if (!axios.isAxiosError(error)) {
        return {
            kind: 'unknown',
            status: null,
            message: error instanceof Error ? error.message : 'Unknown error',
            errors: {},
        };
    }

    const axiosError = error as AxiosError;
    const status = axiosError.response?.status ?? null;
    const data = axiosError.response?.data;

    if (axiosError.code === 'ERR_NETWORK' || !axiosError.response) {
        return {
            kind: 'network',
            status: null,
            message: 'Unable to reach the server. Please try again.',
            errors: {},
        };
    }

    if (status === 422 && isLaravelValidationBody(data)) {
        return {
            kind: 'validation',
            status,
            message: data.message,
            errors: data.errors,
        };
    }

    if (status === 401) {
        return {
            kind: 'unauthenticated',
            status,
            message: messageFromBody(
                data,
                'These credentials do not match our records.',
            ),
            errors: {},
        };
    }

    if (status === 403) {
        return {
            kind: 'forbidden',
            status,
            message: messageFromBody(data, 'This action is unauthorized.'),
            errors: {},
        };
    }

    if (status === 404) {
        return {
            kind: 'not_found',
            status,
            message: messageFromBody(
                data,
                'The requested resource was not found.',
            ),
            errors: {},
        };
    }

    if (status === 419) {
        return {
            kind: 'csrf',
            status,
            message: 'Your session has expired. Please try again.',
            errors: {},
        };
    }

    if (status === 429) {
        return {
            kind: 'throttled',
            status,
            message: messageFromBody(
                data,
                'Too many attempts. Please wait before trying again.',
            ),
            errors: {},
        };
    }

    if (status !== null && status >= 500) {
        return {
            kind: 'server',
            status,
            message: 'Something went wrong on the server.',
            errors: {},
        };
    }

    return {
        kind: 'unknown',
        status,
        message: messageFromBody(data, axiosError.message ?? 'Request failed'),
        errors: {} as LaravelValidationErrors,
    };
}

export const http: AxiosInstance = axios.create({
    baseURL: '/',
    headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
    withXSRFToken: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
});

/**
 * Initialize CSRF cookie protection before state-changing auth requests.
 *
 * @see https://laravel.com/docs/sanctum#csrf-protection
 */
export async function ensureCsrfCookie(): Promise<void> {
    await http.get('/sanctum/csrf-cookie');
}
