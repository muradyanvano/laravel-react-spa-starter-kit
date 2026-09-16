import { ensureCsrfCookie, http, normalizeApiError } from '@/lib/http';
import type { User } from '@/types/auth';
import type { NormalizedApiError } from '@/types/http';
import axios from 'axios';

type UserResponse = {
    data: User;
};

export async function fetchCurrentUser(): Promise<User | null> {
    try {
        const response = await http.get<UserResponse>('/api/v1/user');

        return response.data.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            return null;
        }

        throw normalizeApiError(error);
    }
}

export async function logout(): Promise<void> {
    await ensureCsrfCookie();
    await http.post('/logout');
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
