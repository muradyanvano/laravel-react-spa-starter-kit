import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';
import { AuthProvider } from '@/auth/auth-provider';
import ForgotPassword from '@/pages/auth/forgot-password';
import ResetPassword from '@/pages/auth/reset-password';
import VerifyEmail from '@/pages/auth/verify-email';

vi.mock('@/lib/auth-api', () => ({
    fetchCurrentUser: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    requestPasswordReset: vi.fn(),
    resetPassword: vi.fn(),
    resendVerificationEmail: vi.fn(),
}));

import {
    fetchCurrentUser,
    logout,
    requestPasswordReset,
    resetPassword,
    resendVerificationEmail,
} from '@/lib/auth-api';

const mockedFetchCurrentUser = vi.mocked(fetchCurrentUser);
const mockedRequestPasswordReset = vi.mocked(requestPasswordReset);
const mockedResetPassword = vi.mocked(resetPassword);
const mockedResendVerificationEmail = vi.mocked(resendVerificationEmail);
const mockedLogout = vi.mocked(logout);

describe('Forgot password page', () => {
    beforeEach(() => {
        mockedFetchCurrentUser.mockReset();
        mockedRequestPasswordReset.mockReset();
        mockedFetchCurrentUser.mockResolvedValue(null);
    });

    it('submits the email and shows a success status', async () => {
        const user = userEvent.setup();
        mockedRequestPasswordReset.mockResolvedValue(
            'We have emailed your password reset link.',
        );

        render(
            <AuthProvider>
                <MemoryRouter initialEntries={['/forgot-password']}>
                    <Routes>
                        <Route
                            path="/forgot-password"
                            element={<ForgotPassword />}
                        />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>,
        );

        await user.type(
            await screen.findByLabelText('Email address'),
            'jane@example.com',
        );
        await user.click(
            screen.getByRole('button', {
                name: 'Email password reset link',
            }),
        );

        expect(
            await screen.findByText(
                'We have emailed your password reset link.',
            ),
        ).toBeInTheDocument();
    });
});

describe('Reset password page', () => {
    beforeEach(() => {
        mockedFetchCurrentUser.mockReset();
        mockedResetPassword.mockReset();
        mockedFetchCurrentUser.mockResolvedValue(null);
    });

    it('resets the password using the token and email query', async () => {
        const user = userEvent.setup();
        mockedResetPassword.mockResolvedValue('Your password has been reset.');

        render(
            <AuthProvider>
                <MemoryRouter
                    initialEntries={[
                        '/reset-password/test-token?email=jane%40example.com',
                    ]}
                >
                    <Routes>
                        <Route
                            path="/reset-password/:token"
                            element={<ResetPassword />}
                        />
                        <Route path="/login" element={<div>Login page</div>} />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>,
        );

        expect(await screen.findByLabelText('Email')).toHaveValue(
            'jane@example.com',
        );

        await user.type(screen.getByLabelText('Password'), 'new-password');
        await user.type(
            screen.getByLabelText('Confirm password'),
            'new-password',
        );
        await user.click(
            screen.getByRole('button', { name: 'Reset password' }),
        );

        await waitFor(() => {
            expect(mockedResetPassword).toHaveBeenCalledWith({
                token: 'test-token',
                email: 'jane@example.com',
                password: 'new-password',
                password_confirmation: 'new-password',
            });
        });

        expect(await screen.findByText('Login page')).toBeInTheDocument();
    });
});

describe('Verify email page', () => {
    beforeEach(() => {
        mockedFetchCurrentUser.mockReset();
        mockedResendVerificationEmail.mockReset();
        mockedLogout.mockReset();
        mockedFetchCurrentUser.mockResolvedValue({
            id: 1,
            name: 'Jane',
            email: 'jane@example.com',
            email_verified_at: null,
        });
    });

    it('resends the verification email and shows status', async () => {
        const user = userEvent.setup();
        mockedResendVerificationEmail.mockResolvedValue(
            'verification-link-sent',
        );

        render(
            <AuthProvider>
                <MemoryRouter initialEntries={['/verify-email']}>
                    <Routes>
                        <Route path="/verify-email" element={<VerifyEmail />} />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>,
        );

        await user.click(
            await screen.findByRole('button', {
                name: 'Resend verification email',
            }),
        );

        expect(
            await screen.findByText(/A new verification link has been sent/i),
        ).toBeInTheDocument();
    });

    it('logs the user out', async () => {
        const user = userEvent.setup();
        mockedLogout.mockResolvedValue(undefined);

        render(
            <AuthProvider>
                <MemoryRouter initialEntries={['/verify-email']}>
                    <Routes>
                        <Route path="/verify-email" element={<VerifyEmail />} />
                        <Route path="/login" element={<div>Login page</div>} />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>,
        );

        await user.click(
            await screen.findByRole('button', { name: 'Log out' }),
        );

        await waitFor(() => {
            expect(mockedLogout).toHaveBeenCalled();
        });
    });
});
