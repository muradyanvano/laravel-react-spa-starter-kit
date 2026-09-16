import { VerifiedRoute } from '@/router/guards';
import { TestProviders } from '@/testing/test-providers';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';
import Dashboard from '@/pages/dashboard';
import Profile from '@/pages/settings/profile';

vi.mock('@/lib/auth-api', () => ({
    fetchCurrentUser: vi.fn(),
    logout: vi.fn(),
}));

vi.mock('@/lib/settings-api', () => ({
    updateProfile: vi.fn(),
    deleteAccount: vi.fn(),
}));

import { fetchCurrentUser } from '@/lib/auth-api';

const mockedFetchCurrentUser = vi.mocked(fetchCurrentUser);

const verifiedUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    email_verified_at: '2026-01-01T00:00:00+00:00',
};

function renderDashboardRoutes(initialEntry = '/dashboard') {
    return render(
        <TestProviders>
            <MemoryRouter initialEntries={[initialEntry]}>
                <Routes>
                    <Route element={<VerifiedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/settings/profile" element={<Profile />} />
                    </Route>
                </Routes>
            </MemoryRouter>
        </TestProviders>,
    );
}

describe('Dashboard page', () => {
    beforeEach(() => {
        mockedFetchCurrentUser.mockReset();
        mockedFetchCurrentUser.mockResolvedValue(verifiedUser);
    });

    it('shows the dashboard layout for an authenticated verified user', async () => {
        renderDashboardRoutes();

        expect(
            await screen.findByRole('link', {
                name: 'Dashboard',
                current: 'page',
            }),
        ).toBeInTheDocument();
        expect(screen.getByText('Platform')).toBeInTheDocument();
    });

    it('can navigate to settings from the user menu', async () => {
        const user = userEvent.setup();

        renderDashboardRoutes();

        const userMenuButton = await screen.findByRole('button', {
            name: /Test User/i,
        });

        await user.click(userMenuButton);
        await user.click(
            await screen.findByRole('menuitem', { name: /Settings/i }),
        );

        await waitFor(() => {
            expect(
                screen.getByRole('heading', { name: 'Profile' }),
            ).toBeInTheDocument();
        });
    });
});
