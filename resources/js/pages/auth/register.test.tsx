import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';
import { AuthProvider } from '@/auth/auth-provider';
import Register from '@/pages/auth/register';

vi.mock('@/lib/auth-api', () => ({
    fetchCurrentUser: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    requestPasswordReset: vi.fn(),
    resetPassword: vi.fn(),
    resendVerificationEmail: vi.fn(),
}));

import { fetchCurrentUser, register } from '@/lib/auth-api';

const mockedFetchCurrentUser = vi.mocked(fetchCurrentUser);
const mockedRegister = vi.mocked(register);

describe('Register page', () => {
    beforeEach(() => {
        mockedFetchCurrentUser.mockReset();
        mockedRegister.mockReset();
        mockedFetchCurrentUser.mockResolvedValue(null);
    });

    it('renders the registration form', async () => {
        render(
            <AuthProvider>
                <MemoryRouter initialEntries={['/register']}>
                    <Routes>
                        <Route path="/register" element={<Register />} />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>,
        );

        expect(
            await screen.findByRole('heading', { name: 'Create an account' }),
        ).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    });

    it('shows server validation errors', async () => {
        const user = userEvent.setup();
        mockedRegister.mockRejectedValue({
            kind: 'validation',
            status: 422,
            message: 'The given data was invalid.',
            errors: {
                email: ['The email has already been taken.'],
            },
        });

        render(
            <AuthProvider>
                <MemoryRouter initialEntries={['/register']}>
                    <Routes>
                        <Route path="/register" element={<Register />} />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>,
        );

        await user.type(await screen.findByLabelText('Name'), 'Jane');
        await user.type(
            screen.getByLabelText('Email address'),
            'jane@example.com',
        );
        await user.type(screen.getByLabelText('Password'), 'password');
        await user.type(screen.getByLabelText('Confirm password'), 'password');
        await user.click(
            screen.getByRole('button', { name: 'Create account' }),
        );

        expect(
            await screen.findByText('The email has already been taken.'),
        ).toBeInTheDocument();
    });

    it('redirects to verify-email after registration when unverified', async () => {
        const user = userEvent.setup();
        mockedRegister.mockResolvedValue(undefined);
        mockedFetchCurrentUser
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({
                id: 1,
                name: 'Jane',
                email: 'jane@example.com',
                email_verified_at: null,
            });

        render(
            <AuthProvider>
                <MemoryRouter initialEntries={['/register']}>
                    <Routes>
                        <Route path="/register" element={<Register />} />
                        <Route
                            path="/verify-email"
                            element={<div>Verify email page</div>}
                        />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>,
        );

        await user.type(await screen.findByLabelText('Name'), 'Jane');
        await user.type(
            screen.getByLabelText('Email address'),
            'jane@example.com',
        );
        await user.type(screen.getByLabelText('Password'), 'password');
        await user.type(screen.getByLabelText('Confirm password'), 'password');
        await user.click(
            screen.getByRole('button', { name: 'Create account' }),
        );

        await waitFor(() => {
            expect(screen.getByText('Verify email page')).toBeInTheDocument();
        });
    });
});
