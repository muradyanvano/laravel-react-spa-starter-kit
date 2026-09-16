import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';
import { AuthProvider } from '@/auth/auth-provider';
import Login from '@/pages/auth/login';

vi.mock('@/lib/auth-api', () => ({
    fetchCurrentUser: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    requestPasswordReset: vi.fn(),
    resetPassword: vi.fn(),
    resendVerificationEmail: vi.fn(),
}));

import { fetchCurrentUser, login } from '@/lib/auth-api';

const mockedFetchCurrentUser = vi.mocked(fetchCurrentUser);
const mockedLogin = vi.mocked(login);

function renderLogin(initialEntry = '/login') {
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
                        path="/verify-email"
                        element={<div>Verify email page</div>}
                    />
                    <Route
                        path="/forgot-password"
                        element={<div>Forgot password page</div>}
                    />
                    <Route
                        path="/register"
                        element={<div>Register page</div>}
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

describe('Login page', () => {
    beforeEach(() => {
        mockedFetchCurrentUser.mockReset();
        mockedLogin.mockReset();
        mockedFetchCurrentUser.mockResolvedValue(null);
    });

    it('renders the login form', async () => {
        renderLogin();

        expect(
            await screen.findByRole('heading', {
                name: 'Log in to your account',
            }),
        ).toBeInTheDocument();
        expect(screen.getByLabelText('Email address')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Log in' }),
        ).toBeInTheDocument();
    });

    it('shows validation errors from the server', async () => {
        const user = userEvent.setup();
        mockedLogin.mockRejectedValue({
            kind: 'validation',
            status: 422,
            message: 'The given data was invalid.',
            errors: {
                email: ['These credentials do not match our records.'],
            },
        });

        renderLogin();

        await user.type(
            await screen.findByLabelText('Email address'),
            'a@b.com',
        );
        await user.type(screen.getByLabelText('Password'), 'password');
        await user.click(screen.getByRole('button', { name: 'Log in' }));

        expect(
            await screen.findByText(
                'These credentials do not match our records.',
            ),
        ).toBeInTheDocument();
    });

    it('navigates to the dashboard after successful login', async () => {
        const user = userEvent.setup();
        mockedLogin.mockResolvedValue({ two_factor: false });
        mockedFetchCurrentUser
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
                email_verified_at: '2026-01-01T00:00:00+00:00',
            });

        renderLogin();

        await user.type(
            await screen.findByLabelText('Email address'),
            'a@b.com',
        );
        await user.type(screen.getByLabelText('Password'), 'password');
        await user.click(screen.getByRole('button', { name: 'Log in' }));

        await waitFor(() => {
            expect(screen.getByText('Dashboard page')).toBeInTheDocument();
        });

        // Bootstrap guest fetch + one explicit refresh after login.
        expect(mockedFetchCurrentUser).toHaveBeenCalledTimes(2);
    });

    it('does not resume confirm-password as the post-login destination', async () => {
        const user = userEvent.setup();
        mockedLogin.mockResolvedValue({ two_factor: false });
        mockedFetchCurrentUser
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
                email_verified_at: '2026-01-01T00:00:00+00:00',
            });

        render(
            <AuthProvider>
                <MemoryRouter
                    initialEntries={[
                        {
                            pathname: '/login',
                            state: { from: '/confirm-password' },
                        },
                    ]}
                >
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route
                            path="/dashboard"
                            element={<div>Dashboard page</div>}
                        />
                        <Route
                            path="/confirm-password"
                            element={<div>Confirm password page</div>}
                        />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>,
        );

        await user.type(
            await screen.findByLabelText('Email address'),
            'a@b.com',
        );
        await user.type(screen.getByLabelText('Password'), 'password');
        await user.click(screen.getByRole('button', { name: 'Log in' }));

        await waitFor(() => {
            expect(screen.getByText('Dashboard page')).toBeInTheDocument();
        });
        expect(
            screen.queryByText('Confirm password page'),
        ).not.toBeInTheDocument();
    });

    it('disables the submit button while processing', async () => {
        const user = userEvent.setup();
        let resolveLogin: () => void = () => undefined;
        mockedLogin.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveLogin = () => resolve({ two_factor: false });
                }),
        );

        renderLogin();

        await user.type(
            await screen.findByLabelText('Email address'),
            'a@b.com',
        );
        await user.type(screen.getByLabelText('Password'), 'password');
        await user.click(screen.getByRole('button', { name: 'Log in' }));

        expect(screen.getByRole('button', { name: /Log in/i })).toBeDisabled();

        resolveLogin();
    });
});
