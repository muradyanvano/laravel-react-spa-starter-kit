import { AuthProvider } from '@/auth/auth-provider';
import { AppLoader } from '@/components/app-loader';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router';
import { useAuth } from '@/auth/auth-provider';

vi.mock('@/lib/auth-api', () => ({
    fetchCurrentUser: vi.fn(),
    logout: vi.fn(),
}));

import { fetchCurrentUser } from '@/lib/auth-api';

const mockedFetchCurrentUser = vi.mocked(fetchCurrentUser);

function RootLayout() {
    const { isLoading } = useAuth();

    if (isLoading) {
        return <AppLoader />;
    }

    return <Outlet />;
}

describe('auth bootstrap loader', () => {
    beforeEach(() => {
        mockedFetchCurrentUser.mockReset();
    });

    afterEach(() => {
        cleanup();
    });

    it('shows the centered app loader until auth resolves', async () => {
        let resolveUser: (value: null) => void = () => undefined;
        mockedFetchCurrentUser.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveUser = resolve;
                }),
        );

        const router = createMemoryRouter(
            [
                {
                    element: <RootLayout />,
                    children: [
                        {
                            path: '/',
                            element: <div>Home ready</div>,
                        },
                    ],
                },
            ],
            { initialEntries: ['/'] },
        );

        render(
            <AuthProvider>
                <RouterProvider router={router} />
            </AuthProvider>,
        );

        expect(screen.getByTestId('app-loader')).toBeInTheDocument();
        expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
        expect(screen.queryByText('Home ready')).not.toBeInTheDocument();

        resolveUser(null);

        await waitFor(() => {
            expect(screen.getByText('Home ready')).toBeInTheDocument();
        });

        expect(screen.queryByTestId('app-loader')).not.toBeInTheDocument();
    });
});
