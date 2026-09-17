import { AuthProvider } from '@/auth/auth-provider';
import ConfirmPassword from '@/pages/auth/confirm-password';
import { usePasskeyVerify } from '@laravel/passkeys/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';

vi.mock('@/lib/auth-api', () => ({
    fetchCurrentUser: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    requestPasswordReset: vi.fn(),
    resetPassword: vi.fn(),
    resendVerificationEmail: vi.fn(),
}));

vi.mock('@/lib/settings-api', () => ({
    confirmPassword: vi.fn(),
    fetchPasswordConfirmationStatus: vi.fn(),
    fetchSecuritySettings: vi.fn(),
}));

vi.mock('@/lib/passkeys', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/lib/passkeys')>();

    return {
        ...actual,
        preparePasskeyCeremony: vi.fn().mockResolvedValue(undefined),
    };
});

import { fetchCurrentUser } from '@/lib/auth-api';
import { confirmPassword } from '@/lib/settings-api';

const mockedFetchCurrentUser = vi.mocked(fetchCurrentUser);
const mockedConfirmPassword = vi.mocked(confirmPassword);
const mockedUsePasskeyVerify = vi.mocked(usePasskeyVerify);

function renderConfirmPassword(
    initialEntry:
        | string
        | {
              pathname: string;
              state?: { from?: string };
              search?: string;
          } = '/confirm-password',
) {
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={[initialEntry]}>
                <Routes>
                    <Route
                        path="/confirm-password"
                        element={<ConfirmPassword />}
                    />
                    <Route
                        path="/settings/security"
                        element={<div>Security settings page</div>}
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

describe('Confirm password passkey integration', () => {
    beforeEach(() => {
        mockedFetchCurrentUser.mockReset();
        mockedConfirmPassword.mockReset();
        mockedUsePasskeyVerify.mockReset();
        mockedFetchCurrentUser.mockResolvedValue({
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            email_verified_at: '2026-01-01T00:00:00+00:00',
        });
        mockedUsePasskeyVerify.mockReturnValue({
            verify: vi.fn(),
            isLoading: false,
            error: null,
            errorInstance: null,
            isSupported: false,
        });
    });

    it('renders passkey UI before the password form when supported', async () => {
        mockedUsePasskeyVerify.mockReturnValue({
            verify: vi.fn(),
            isLoading: false,
            error: null,
            errorInstance: null,
            isSupported: true,
        });

        renderConfirmPassword();

        const passkeyButton = await screen.findByRole('button', {
            name: 'Confirm with passkey',
        });
        const passwordField = screen.getByLabelText('Password');

        expect(
            passkeyButton.compareDocumentPosition(passwordField) &
                Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
        expect(
            screen.getByText('Or confirm with password'),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Confirm password' }),
        ).toBeInTheDocument();
    });

    it('uses confirmation routes for passkey ceremonies', async () => {
        mockedUsePasskeyVerify.mockReturnValue({
            verify: vi.fn(),
            isLoading: false,
            error: null,
            errorInstance: null,
            isSupported: true,
        });

        renderConfirmPassword();

        await screen.findByRole('button', { name: 'Confirm with passkey' });

        expect(mockedUsePasskeyVerify).toHaveBeenCalledWith(
            expect.objectContaining({
                routes: {
                    options: '/passkeys/confirm/options',
                    submit: '/passkeys/confirm',
                },
            }),
        );
    });

    it('navigates to the safe intended destination after passkey confirmation without refreshing current user', async () => {
        const user = userEvent.setup();

        mockedUsePasskeyVerify.mockImplementation((options) => ({
            verify: vi.fn(async () => {
                options?.onSuccess?.({ redirect: '/settings/security' });
            }),
            isLoading: false,
            error: null,
            errorInstance: null,
            isSupported: true,
        }));

        renderConfirmPassword({
            pathname: '/confirm-password',
            state: { from: '/settings/security' },
        });

        await user.click(
            await screen.findByRole('button', { name: 'Confirm with passkey' }),
        );

        await waitFor(() => {
            expect(
                screen.getByText('Security settings page'),
            ).toBeInTheDocument();
        });

        expect(mockedFetchCurrentUser).toHaveBeenCalledTimes(1);
    });

    it('preserves password confirmation flow when passkeys are unsupported', async () => {
        const user = userEvent.setup();
        mockedConfirmPassword.mockResolvedValue(undefined);

        renderConfirmPassword();

        expect(
            screen.queryByRole('button', { name: 'Confirm with passkey' }),
        ).not.toBeInTheDocument();

        await user.type(await screen.findByLabelText('Password'), 'password');
        await user.click(
            screen.getByRole('button', { name: 'Confirm password' }),
        );

        await waitFor(() => {
            expect(mockedConfirmPassword).toHaveBeenCalledWith({
                password: 'password',
            });
        });
        expect(
            await screen.findByText('Security settings page'),
        ).toBeInTheDocument();
        expect(mockedFetchCurrentUser).toHaveBeenCalledTimes(1);
    });

    it('rejects unsafe intended destinations after passkey confirmation', async () => {
        const user = userEvent.setup();

        mockedUsePasskeyVerify.mockImplementation((options) => ({
            verify: vi.fn(async () => {
                options?.onSuccess?.({ redirect: '/dashboard' });
            }),
            isLoading: false,
            error: null,
            errorInstance: null,
            isSupported: true,
        }));

        renderConfirmPassword({
            pathname: '/confirm-password',
            state: { from: 'https://evil.test' },
        });

        await user.click(
            await screen.findByRole('button', { name: 'Confirm with passkey' }),
        );

        await waitFor(() => {
            expect(
                screen.getByText('Security settings page'),
            ).toBeInTheDocument();
        });
    });
});
