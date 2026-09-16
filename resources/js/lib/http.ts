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

export function normalizeApiError(error: unknown): NormalizedApiError {
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
            message: 'Unauthenticated.',
            errors: {},
        };
    }

    if (status === 403) {
        return {
            kind: 'forbidden',
            status,
            message: 'This action is unauthorized.',
            errors: {},
        };
    }

    if (status === 419) {
        return {
            kind: 'csrf',
            status,
            message: 'Your session has expired. Please refresh and try again.',
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

    const message =
        typeof data === 'object' &&
        data !== null &&
        'message' in data &&
        typeof data.message === 'string'
            ? data.message
            : (axiosError.message ?? 'Request failed');

    return {
        kind: 'unknown',
        status,
        message,
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
