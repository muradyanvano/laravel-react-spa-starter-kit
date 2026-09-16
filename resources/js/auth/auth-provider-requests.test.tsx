import { AuthProvider, useAuth } from '@/auth/auth-provider';
import { VerifiedRoute } from '@/router/guards';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryRouter, Link, RouterProvider } from 'react-router';

vi.mock('@/lib/auth-api', () => ({
    fetchCurrentUser: vi.fn(),
    logout: vi.fn(),
}));

import { fetchCurrentUser } from '@/lib/auth-api';

const mockedFetchCurrentUser = vi.mocked(fetchCurrentUser);

function AuthProbe() {
    const { status, user, refreshUser } = useAuth();

    return (
        <div>
            <span data-testid="status">{status}</span>
            <span data-testid="email">{user?.email ?? 'none'}</span>
            <button
                type="button"
                onClick={() => {
                    void refreshUser();
                }}
            >
                Refresh
            </button>
        </div>
    );
}

describe('AuthProvider request ownership', () => {
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
    });

    it('bootstraps the current-user endpoint once per provider mount', async () => {
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

        expect(mockedFetchCurrentUser).toHaveBeenCalledTimes(1);
    });

    it('does not refetch current user when navigating between routes', async () => {
        const user = userEvent.setup();
        const router = createMemoryRouter(
            [
                {
                    element: <VerifiedRoute />,
                    children: [
                        {
                            path: '/dashboard',
                            element: (
                                <div>
                                    Dashboard page
                                    <Link to="/settings/profile">Profile</Link>
                                </div>
                            ),
                        },
                        {
                            path: '/settings/profile',
                            element: (
                                <div>
                                    Profile page
                                    <Link to="/dashboard">Dashboard</Link>
                                </div>
                            ),
                        },
                    ],
                },
                {
                    path: '/login',
                    element: <div>Login page</div>,
                },
            ],
            { initialEntries: ['/dashboard'] },
        );

        render(
            <AuthProvider>
                <RouterProvider router={router} />
            </AuthProvider>,
        );

        expect(await screen.findByText('Dashboard page')).toBeInTheDocument();
        expect(mockedFetchCurrentUser).toHaveBeenCalledTimes(1);

        await user.click(screen.getByRole('link', { name: 'Profile' }));
        expect(await screen.findByText('Profile page')).toBeInTheDocument();
        expect(mockedFetchCurrentUser).toHaveBeenCalledTimes(1);

        await user.click(screen.getByRole('link', { name: 'Dashboard' }));
        expect(await screen.findByText('Dashboard page')).toBeInTheDocument();
        expect(mockedFetchCurrentUser).toHaveBeenCalledTimes(1);
    });

    it('allows an explicit refreshUser revalidation', async () => {
        const user = userEvent.setup();

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

        expect(mockedFetchCurrentUser).toHaveBeenCalledTimes(1);

        await user.click(screen.getByRole('button', { name: 'Refresh' }));

        await waitFor(() => {
            expect(mockedFetchCurrentUser).toHaveBeenCalledTimes(2);
        });
    });

    it('still resolves auth once under React StrictMode remounts', async () => {
        render(
            <StrictMode>
                <AuthProvider>
                    <AuthProbe />
                </AuthProvider>
            </StrictMode>,
        );

        await waitFor(() => {
            expect(screen.getByTestId('status')).toHaveTextContent(
                'authenticated',
            );
        });

        // StrictMode remounts effects in development; abort cancels the first.
        // At most two attempts, and auth state settles once.
        expect(mockedFetchCurrentUser.mock.calls.length).toBeGreaterThanOrEqual(
            1,
        );
        expect(mockedFetchCurrentUser.mock.calls.length).toBeLessThanOrEqual(2);
        expect(screen.getByTestId('email')).toHaveTextContent(
            'test@example.com',
        );
    });
});
