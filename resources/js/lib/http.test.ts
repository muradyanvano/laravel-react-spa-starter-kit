import { normalizeApiError } from '@/lib/http';
import axios, { AxiosError, type AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';

function axiosErrorFrom(status: number, data: unknown): AxiosError {
    const response = {
        status,
        data,
        statusText: 'Error',
        headers: {},
        config: { headers: new axios.AxiosHeaders() },
    } as AxiosResponse;

    return new AxiosError(
        'Request failed',
        AxiosError.ERR_BAD_REQUEST,
        undefined,
        undefined,
        response,
    );
}

describe('normalizeApiError', () => {
    it('passes through already-normalized API errors', () => {
        const normalized = {
            kind: 'validation' as const,
            status: 422,
            message: 'The given data was invalid.',
            errors: {
                email: ['These credentials do not match our records.'],
            },
        };

        expect(normalizeApiError(normalized)).toEqual(normalized);
    });

    it('normalizes Laravel validation errors', () => {
        const error = axiosErrorFrom(422, {
            message: 'The email field is required.',
            errors: {
                email: ['The email field is required.'],
            },
        });

        expect(normalizeApiError(error)).toEqual({
            kind: 'validation',
            status: 422,
            message: 'The email field is required.',
            errors: {
                email: ['The email field is required.'],
            },
        });
    });

    it('normalizes unauthenticated responses', () => {
        expect(normalizeApiError(axiosErrorFrom(401, {})).kind).toBe(
            'unauthenticated',
        );
    });

    it('normalizes forbidden responses', () => {
        expect(normalizeApiError(axiosErrorFrom(403, {})).kind).toBe(
            'forbidden',
        );
    });

    it('normalizes CSRF / session expiration responses', () => {
        expect(normalizeApiError(axiosErrorFrom(419, {})).kind).toBe('csrf');
    });

    it('normalizes throttled responses', () => {
        expect(normalizeApiError(axiosErrorFrom(429, {})).kind).toBe(
            'throttled',
        );
    });

    it('normalizes network failures', () => {
        const error = new AxiosError('Network Error');
        error.code = AxiosError.ERR_NETWORK;

        expect(normalizeApiError(error).kind).toBe('network');
    });
});
