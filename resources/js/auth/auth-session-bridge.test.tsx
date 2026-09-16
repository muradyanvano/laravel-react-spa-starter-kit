import { AuthSessionBridge } from '@/auth/auth-session-bridge';
import { AuthProvider, useAuth } from '@/auth/auth-provider';
import { http } from '@/lib/http';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import {
    AxiosError,
    type AxiosAdapter,
    type AxiosResponse,
    type InternalAxiosRequestConfig,
} from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router';

vi.mock('@/lib/auth-api', () => ({
    fetchCurrentUser: vi.fn(),
    logout: vi.fn(),
}));

import { fetchCurrentUser } from '@/lib/auth-api';

const mockedFetchCurrentUser = vi.mocked(fetchCurrentUser);

function LocationProbe() {
    const location = useLocation();
    const { status, user } = useAuth();

    return (
        <div>
            <span data-testid="path">{location.pathname}</span>
            <span data-testid="from">
                {(location.state as { from?: string } | null)?.from ?? 'none'}
            </span>
            <span data-testid="status">{status}</span>
            <span data-testid="email">{user?.email ?? 'none'}</span>
        </div>
    );
}

function AuthenticatedProbe() {
    return (
        <div>
            <LocationProbe />
            <button
                type="button"
                onClick={() => {
                    void http
                        .get('/api/v1/protected-probe')
                        .catch(() => undefined);
                }}
            >
                Trigger 401
            </button>
            <button
                type="button"
                onClick={() => {
                    void http
                        .post('/user/two-factor-authentication')
                        .catch(() => undefined);
                }}
            >
                Trigger 423
            </button>
        </div>
    );
}

function rejectWithStatus(status: number): AxiosAdapter {
    return async (config: InternalAxiosRequestConfig) => {
        const response = {
            status,
            data: { message: 'error' },
            statusText: 'Error',
            headers: {},
            config,
        } as AxiosResponse;

        throw new AxiosError(
            'Request failed',
            AxiosError.ERR_BAD_REQUEST,
            config,
            undefined,
            response,
        );
    };
}

describe('auth session HTTP handling', () => {
    const originalAdapter = http.defaults.adapter;

    beforeEach(() => {
        mockedFetchCurrentUser.mockReset();
        mockedFetchCurrentUser.mockResolvedValue({
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            email_verified_at: '2026-01-01T00:00:00+00:00',
        });
    });

    afterEach(() => {
        cleanup();
        http.defaults.adapter = originalAdapter;
        vi.restoreAllMocks();
    });

    it('clears stale auth and navigates to login on session 401', async () => {
        http.defaults.adapter = rejectWithStatus(401);

        const router = createMemoryRouter(
            [
                {
                    path: '/',
                    element: (
                        <>
                            <AuthSessionBridge />
                            <AuthenticatedProbe />
                        </>
                    ),
                },
                {
                    path: '/login',
                    element: <LocationProbe />,
                },
            ],
            { initialEntries: ['/'] },
        );

        render(
            <AuthProvider>
                <RouterProvider router={router} />
            </AuthProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId('status')).toHaveTextContent(
                'authenticated',
            );
        });

        screen.getByRole('button', { name: 'Trigger 401' }).click();

        await waitFor(() => {
            expect(screen.getByTestId('path')).toHaveTextContent('/login');
        });

        expect(screen.getByTestId('status')).toHaveTextContent(
            'unauthenticated',
        );
        expect(screen.getByTestId('email')).toHaveTextContent('none');
        expect(screen.getByTestId('from')).toHaveTextContent('/');
    });

    it('does not globally navigate to confirm-password on 423', async () => {
        http.defaults.adapter = rejectWithStatus(423);

        const router = createMemoryRouter(
            [
                {
                    path: '/settings/security',
                    element: (
                        <>
                            <AuthSessionBridge />
                            <AuthenticatedProbe />
                        </>
                    ),
                },
                {
                    path: '/confirm-password',
                    element: <LocationProbe />,
                },
            ],
            { initialEntries: ['/settings/security'] },
        );

        render(
            <AuthProvider>
                <RouterProvider router={router} />
            </AuthProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId('status')).toHaveTextContent(
                'authenticated',
            );
        });

        screen.getByRole('button', { name: 'Trigger 423' }).click();

        await waitFor(() => {
            expect(screen.getByTestId('path')).toHaveTextContent(
                '/settings/security',
            );
        });

        expect(screen.getByTestId('status')).toHaveTextContent('authenticated');
        expect(screen.queryByTestId('path')?.textContent).not.toBe(
            '/confirm-password',
        );
    });

    it('does not redirect guest credential 401 responses to login loops', async () => {
        mockedFetchCurrentUser.mockResolvedValue(null);
        http.defaults.adapter = rejectWithStatus(401);

        const router = createMemoryRouter(
            [
                {
                    path: '/login',
                    element: (
                        <>
                            <AuthSessionBridge />
                            <LocationProbe />
                            <button
                                type="button"
                                onClick={() => {
                                    void http
                                        .get('/api/v1/user')
                                        .catch(() => undefined);
                                }}
                            >
                                Guest 401
                            </button>
                        </>
                    ),
                },
            ],
            { initialEntries: ['/login'] },
        );

        render(
            <AuthProvider>
                <RouterProvider router={router} />
            </AuthProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId('status')).toHaveTextContent(
                'unauthenticated',
            );
        });

        screen.getByRole('button', { name: 'Guest 401' }).click();

        await waitFor(() => {
            expect(screen.getByTestId('path')).toHaveTextContent('/login');
        });

        expect(screen.getByTestId('status')).toHaveTextContent(
            'unauthenticated',
        );
    });
});
