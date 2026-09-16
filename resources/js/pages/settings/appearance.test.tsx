import { VerifiedRoute } from '@/router/guards';
import { TestProviders } from '@/testing/test-providers';
import { initializeTheme } from '@/hooks/use-appearance';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';
import Appearance from '@/pages/settings/appearance';

vi.mock('@/lib/auth-api', () => ({
    fetchCurrentUser: vi.fn(),
    logout: vi.fn(),
}));

import { fetchCurrentUser } from '@/lib/auth-api';

const mockedFetchCurrentUser = vi.mocked(fetchCurrentUser);

const verifiedUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    email_verified_at: '2026-01-01T00:00:00+00:00',
};

function renderAppearance() {
    return render(
        <TestProviders>
            <MemoryRouter initialEntries={['/settings/appearance']}>
                <Routes>
                    <Route element={<VerifiedRoute />}>
                        <Route
                            path="/settings/appearance"
                            element={<Appearance />}
                        />
                    </Route>
                </Routes>
            </MemoryRouter>
        </TestProviders>,
    );
}

describe('Appearance settings page', () => {
    beforeEach(() => {
        mockedFetchCurrentUser.mockReset();
        mockedFetchCurrentUser.mockResolvedValue(verifiedUser);
        localStorage.clear();
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = '';
        initializeTheme();
    });

    it('renders light, dark, and system appearance buttons', async () => {
        renderAppearance();

        expect(
            await screen.findByRole('button', { name: 'Light' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Dark' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'System' }),
        ).toBeInTheDocument();
    });

    it('applies dark appearance when the dark button is clicked', async () => {
        const user = userEvent.setup();

        renderAppearance();

        await user.click(await screen.findByRole('button', { name: 'Dark' }));

        expect(localStorage.getItem('appearance')).toBe('dark');
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(screen.getByRole('button', { name: 'Dark' })).toHaveAttribute(
            'aria-pressed',
            'true',
        );
    });
});
