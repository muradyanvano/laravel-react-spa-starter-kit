import { AuthProvider } from '@/auth/auth-provider';
import Login from '@/pages/auth/login';
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

vi.mock('@/lib/passkeys', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/lib/passkeys')>();

    return {
        ...actual,
        preparePasskeyCeremony: vi.fn().mockResolvedValue(undefined),
    };
});

import { fetchCurrentUser } from '@/lib/auth-api';

const mockedFetchCurrentUser = vi.mocked(fetchCurrentUser);
const mockedUsePasskeyVerify = vi.mocked(usePasskeyVerify);

function renderLogin(
    initialEntry:
        | string
        | { pathname: string; state?: { from?: string } } = '/login',
) {
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={[initialEntry]}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/dashboard"
                        element={<div>Dashboard page</div>}
                    />
                    <Route
                        path="/settings/profile"
                        element={<div>Profile settings page</div>}
                    />
                    <Route
                        path="/verify-email"
                        element={<div>Verify email page</div>}
                    />
                    <Route
                        path="/two-factor-challenge"
                        element={<div>Two-factor challenge page</div>}
                    />
                    <Route
                        path="/confirm-password"
                        element={<div>Confirm password page</div>}
                    />
                </Routes>
            </MemoryRouter>
        </AuthProvider>,
    );
}

function mockSupportedPasskey() {
    mockedUsePasskeyVerify.mockImplementation((options) => ({
        verify: vi.fn(async () => {
            options?.onSuccess?.({ redirect: '/dashboard' });
        }),
        isLoading: false,
        error: null,
        errorInstance: null,
        isSupported: true,
    }));
}

describe('Login passkey integration', () => {
    beforeEach(() => {
        mockedFetchCurrentUser.mockReset();
        mockedUsePasskeyVerify.mockReset();
        mockedFetchCurrentUser.mockResolvedValue(null);
        mockedUsePasskeyVerify.mockReturnValue({
            verify: vi.fn(),
            isLoading: false,
            error: null,
            errorInstance: null,
            isSupported: false,
        });
    });

    it('renders passkey UI before the password form when supported', async () => {
        mockSupportedPasskey();

        renderLogin();

        const passkeyButton = await screen.findByRole('button', {
            name: 'Sign in with a passkey',
        });
        const emailField = screen.getByLabelText('Email address');

        expect(
            passkeyButton.compareDocumentPosition(emailField) &
                Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
        expect(screen.getByText('Or continue with email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Log in' }),
        ).toBeInTheDocument();
    });

    it('refreshes current user exactly once after successful passkey login', async () => {
        const user = userEvent.setup();
        mockSupportedPasskey();
        mockedFetchCurrentUser
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
                email_verified_at: '2026-01-01T00:00:00+00:00',
            });

        renderLogin();

        await user.click(
            await screen.findByRole('button', {
                name: 'Sign in with a passkey',
            }),
        );

        await waitFor(() => {
            expect(screen.getByText('Dashboard page')).toBeInTheDocument();
        });

        expect(mockedFetchCurrentUser).toHaveBeenCalledTimes(2);
    });

    it('navigates verified users to the safe intended destination', async () => {
        const user = userEvent.setup();
        mockSupportedPasskey();
        mockedFetchCurrentUser
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
                email_verified_at: '2026-01-01T00:00:00+00:00',
            });

        renderLogin({
            pathname: '/login',
            state: { from: '/settings/profile' },
        });

        await user.click(
            await screen.findByRole('button', {
                name: 'Sign in with a passkey',
            }),
        );

        await waitFor(() => {
            expect(
                screen.getByText('Profile settings page'),
            ).toBeInTheDocument();
        });
    });

    it('navigates unverified users to verify-email after passkey login', async () => {
        const user = userEvent.setup();
        mockSupportedPasskey();
        mockedFetchCurrentUser
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
                email_verified_at: null,
            });

        renderLogin();

        await user.click(
            await screen.findByRole('button', {
                name: 'Sign in with a passkey',
            }),
        );

        await waitFor(() => {
            expect(screen.getByText('Verify email page')).toBeInTheDocument();
        });
    });

    it('rejects external intended destinations after passkey login', async () => {
        const user = userEvent.setup();
        mockSupportedPasskey();
        mockedFetchCurrentUser
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
                email_verified_at: '2026-01-01T00:00:00+00:00',
            });

        renderLogin({
            pathname: '/login',
            state: { from: 'https://evil.test' },
        });

        await user.click(
            await screen.findByRole('button', {
                name: 'Sign in with a passkey',
            }),
        );

        await waitFor(() => {
            expect(screen.getByText('Dashboard page')).toBeInTheDocument();
        });
    });

    it('rejects protocol-relative intended destinations after passkey login', async () => {
        const user = userEvent.setup();
        mockSupportedPasskey();
        mockedFetchCurrentUser
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
                email_verified_at: '2026-01-01T00:00:00+00:00',
            });

        renderLogin({
            pathname: '/login',
            state: { from: '//evil.test' },
        });

        await user.click(
            await screen.findByRole('button', {
                name: 'Sign in with a passkey',
            }),
        );

        await waitFor(() => {
            expect(screen.getByText('Dashboard page')).toBeInTheDocument();
        });
    });

    it('does not resume confirm-password after passkey login', async () => {
        const user = userEvent.setup();
        mockSupportedPasskey();
        mockedFetchCurrentUser
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
                email_verified_at: '2026-01-01T00:00:00+00:00',
            });

        renderLogin({
            pathname: '/login',
            state: { from: '/confirm-password' },
        });

        await user.click(
            await screen.findByRole('button', {
                name: 'Sign in with a passkey',
            }),
        );

        await waitFor(() => {
            expect(screen.getByText('Dashboard page')).toBeInTheDocument();
        });
    });

    it('does not route passkey login into the password-login two-factor challenge', async () => {
        const user = userEvent.setup();
        mockSupportedPasskey();
        mockedFetchCurrentUser
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
                email_verified_at: '2026-01-01T00:00:00+00:00',
            });

        renderLogin({
            pathname: '/login',
            state: { from: '/two-factor-challenge' },
        });

        await user.click(
            await screen.findByRole('button', {
                name: 'Sign in with a passkey',
            }),
        );

        await waitFor(() => {
            expect(screen.getByText('Dashboard page')).toBeInTheDocument();
        });
        expect(
            screen.queryByText('Two-factor challenge page'),
        ).not.toBeInTheDocument();
    });

    it('does not refresh or navigate when passkey verification is cancelled', async () => {
        const user = userEvent.setup();

        mockedUsePasskeyVerify.mockReturnValue({
            verify: vi.fn(),
            isLoading: false,
            error: null,
            errorInstance: null,
            isSupported: true,
        });

        renderLogin();

        await user.click(
            await screen.findByRole('button', {
                name: 'Sign in with a passkey',
            }),
        );

        expect(mockedFetchCurrentUser).toHaveBeenCalledTimes(1);
        expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    });

    it('leaves password login intact when passkeys are unsupported', async () => {
        renderLogin();

        expect(
            screen.queryByRole('button', { name: 'Sign in with a passkey' }),
        ).not.toBeInTheDocument();
        expect(
            await screen.findByLabelText('Email address'),
        ).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });
});
