import { AuthProvider, useAuth } from '@/auth/auth-provider';
import { GuestRoute, ProtectedRoute } from '@/router/guards';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryRouter, Link, RouterProvider } from 'react-router';

vi.mock('@/lib/auth-api', () => ({
    fetchCurrentUser: vi.fn(),
    logout: vi.fn(),
}));

import { fetchCurrentUser } from '@/lib/auth-api';

const mockedFetchCurrentUser = vi.mocked(fetchCurrentUser);

function AuthProbe() {
    const { status, user } = useAuth();

    return (
        <div>
            <span data-testid="status">{status}</span>
            <span data-testid="email">{user?.email ?? 'none'}</span>
        </div>
    );
}

function renderWithAuth(
    initialEntries: string[],
    routes: Parameters<typeof createMemoryRouter>[0],
) {
    const router = createMemoryRouter(routes, { initialEntries });

    return render(
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>,
    );
}

describe('auth initialization and route guards', () => {
    beforeEach(() => {
        mockedFetchCurrentUser.mockReset();
    });

    afterEach(() => {
        cleanup();
    });

    it('shows a loading state while authentication initializes', async () => {
        let resolveUser: (value: null) => void = () => undefined;
        mockedFetchCurrentUser.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveUser = resolve;
                }),
        );

        render(
            <AuthProvider>
                <AuthProbe />
            </AuthProvider>,
        );

        expect(screen.getByTestId('status')).toHaveTextContent('loading');

        resolveUser(null);

        await waitFor(() => {
            expect(screen.getByTestId('status')).toHaveTextContent(
                'unauthenticated',
            );
        });
    });

    it('resolves authenticated state from the current user endpoint', async () => {
        mockedFetchCurrentUser.mockResolvedValue({
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            email_verified_at: null,
        });

        render(
            <AuthProvider>
                <AuthProbe />
            </AuthProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId('status')).toHaveTextContent(
                'authenticated',
            );
        });

        expect(screen.getByTestId('email')).toHaveTextContent(
            'test@example.com',
        );
    });

    it('redirects guests away from protected routes', async () => {
        mockedFetchCurrentUser.mockResolvedValue(null);

        renderWithAuth(
            ['/dashboard'],
            [
                {
                    path: '/login',
                    element: <div>Login page</div>,
                },
                {
                    element: <ProtectedRoute />,
                    children: [
                        {
                            path: '/dashboard',
                            element: <div>Dashboard page</div>,
                        },
                    ],
                },
            ],
        );

        await waitFor(() => {
            expect(screen.getByText('Login page')).toBeInTheDocument();
        });
    });

    it('allows authenticated users into protected routes', async () => {
        mockedFetchCurrentUser.mockResolvedValue({
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            email_verified_at: '2026-01-01T00:00:00+00:00',
        });

        renderWithAuth(
            ['/dashboard'],
            [
                {
                    element: <ProtectedRoute />,
                    children: [
                        {
                            path: '/dashboard',
                            element: <div>Dashboard page</div>,
                        },
                    ],
                },
            ],
        );

        await waitFor(() => {
            expect(screen.getByText('Dashboard page')).toBeInTheDocument();
        });
    });

    it('redirects authenticated users away from guest routes', async () => {
        mockedFetchCurrentUser.mockResolvedValue({
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            email_verified_at: '2026-01-01T00:00:00+00:00',
        });

        renderWithAuth(
            ['/login'],
            [
                {
                    path: '/dashboard',
                    element: <div>Dashboard page</div>,
                },
                {
                    path: '/verify-email',
                    element: <div>Verify email page</div>,
                },
                {
                    element: <GuestRoute />,
                    children: [
                        {
                            path: '/login',
                            element: (
                                <div>
                                    Login page
                                    <Link to="/dashboard">Go dashboard</Link>
                                </div>
                            ),
                        },
                    ],
                },
            ],
        );

        await waitFor(() => {
            expect(screen.getByText('Dashboard page')).toBeInTheDocument();
        });
    });
});
