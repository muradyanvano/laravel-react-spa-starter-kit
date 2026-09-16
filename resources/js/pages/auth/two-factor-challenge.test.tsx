import { AuthProvider } from '@/auth/auth-provider';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';
import TwoFactorChallenge from '@/pages/auth/two-factor-challenge';

vi.mock('@/lib/auth-api', () => ({
    fetchCurrentUser: vi.fn(),
    logout: vi.fn(),
}));

vi.mock('@/lib/settings-api', () => ({
    submitTwoFactorChallenge: vi.fn(),
}));

import { fetchCurrentUser } from '@/lib/auth-api';
import { submitTwoFactorChallenge } from '@/lib/settings-api';

const mockedFetchCurrentUser = vi.mocked(fetchCurrentUser);
const mockedSubmitTwoFactorChallenge = vi.mocked(submitTwoFactorChallenge);

function renderTwoFactorChallenge() {
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={['/two-factor-challenge']}>
                <Routes>
                    <Route
                        path="/two-factor-challenge"
                        element={<TwoFactorChallenge />}
                    />
                    <Route
                        path="/dashboard"
                        element={<div>Dashboard page</div>}
                    />
                </Routes>
            </MemoryRouter>
        </AuthProvider>,
    );
}

describe('Two-factor challenge page', () => {
    beforeEach(() => {
        mockedFetchCurrentUser.mockReset();
        mockedSubmitTwoFactorChallenge.mockReset();
        mockedFetchCurrentUser.mockResolvedValue(null);
    });

    it('renders the OTP challenge UI', async () => {
        renderTwoFactorChallenge();

        expect(
            await screen.findByRole('heading', {
                name: 'Authentication code',
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Continue' }),
        ).toBeInTheDocument();
    });

    it('can switch to recovery code mode', async () => {
        const user = userEvent.setup();

        renderTwoFactorChallenge();

        await user.click(
            await screen.findByRole('button', {
                name: 'login using a recovery code',
            }),
        );

        expect(
            screen.getByRole('heading', { name: 'Recovery code' }),
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText('Enter recovery code'),
        ).toBeInTheDocument();
    });

    it('shows validation errors when the challenge is rejected', async () => {
        const user = userEvent.setup();
        mockedSubmitTwoFactorChallenge.mockRejectedValue({
            kind: 'validation',
            status: 422,
            message: 'The given data was invalid.',
            errors: {
                code: [
                    'The provided two factor authentication code was invalid.',
                ],
            },
        });

        renderTwoFactorChallenge();

        await user.click(
            await screen.findByRole('button', { name: 'Continue' }),
        );

        expect(
            await screen.findByText(
                'The provided two factor authentication code was invalid.',
            ),
        ).toBeInTheDocument();
    });
});
