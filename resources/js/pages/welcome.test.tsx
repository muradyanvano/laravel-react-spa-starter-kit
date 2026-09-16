import { AuthProvider } from '@/auth/auth-provider';
import Welcome from '@/pages/welcome';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';

vi.mock('@/lib/auth-api', () => ({
    fetchCurrentUser: vi.fn(),
    logout: vi.fn(),
}));

import { fetchCurrentUser } from '@/lib/auth-api';

const mockedFetchCurrentUser = vi.mocked(fetchCurrentUser);

function renderWelcome() {
    return render(
        <AuthProvider>
            <MemoryRouter>
                <Welcome />
            </MemoryRouter>
        </AuthProvider>,
    );
}

describe('Welcome page navigation', () => {
    beforeEach(() => {
        mockedFetchCurrentUser.mockReset();
    });

    afterEach(() => {
        cleanup();
    });

    it('shows Log in and Register for guests', async () => {
        mockedFetchCurrentUser.mockResolvedValue(null);

        renderWelcome();

        expect(
            await screen.findByRole('link', { name: 'Log in' }),
        ).toHaveAttribute('href', '/login');
        expect(screen.getByRole('link', { name: 'Register' })).toHaveAttribute(
            'href',
            '/register',
        );
        expect(
            screen.queryByRole('link', { name: 'Dashboard' }),
        ).not.toBeInTheDocument();
    });

    it('shows Dashboard for authenticated users', async () => {
        mockedFetchCurrentUser.mockResolvedValue({
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            email_verified_at: '2026-01-01T00:00:00+00:00',
        });

        renderWelcome();

        expect(
            await screen.findByRole('link', { name: 'Dashboard' }),
        ).toHaveAttribute('href', '/dashboard');
        expect(
            screen.queryByRole('link', { name: 'Log in' }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('link', { name: 'Register' }),
        ).not.toBeInTheDocument();
    });

    it('does not show a plain Loading text placeholder', async () => {
        mockedFetchCurrentUser.mockResolvedValue(null);

        renderWelcome();

        await waitFor(() => {
            expect(
                screen.getByRole('link', { name: 'Log in' }),
            ).toBeInTheDocument();
        });

        expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
});
