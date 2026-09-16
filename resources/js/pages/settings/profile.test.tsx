import { VerifiedRoute } from '@/router/guards';
import { TestProviders } from '@/testing/test-providers';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';
import Profile from '@/pages/settings/profile';

vi.mock('@/lib/auth-api', () => ({
    fetchCurrentUser: vi.fn(),
    logout: vi.fn(),
    resendVerificationEmail: vi.fn(),
}));

vi.mock('@/lib/settings-api', () => ({
    updateProfile: vi.fn(),
    deleteAccount: vi.fn(),
}));

import { fetchCurrentUser } from '@/lib/auth-api';
import { updateProfile } from '@/lib/settings-api';

const mockedFetchCurrentUser = vi.mocked(fetchCurrentUser);
const mockedUpdateProfile = vi.mocked(updateProfile);

const verifiedUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    email_verified_at: '2026-01-01T00:00:00+00:00',
};

function renderProfile() {
    return render(
        <TestProviders>
            <MemoryRouter initialEntries={['/settings/profile']}>
                <Routes>
                    <Route element={<VerifiedRoute />}>
                        <Route path="/settings/profile" element={<Profile />} />
                    </Route>
                </Routes>
            </MemoryRouter>
        </TestProviders>,
    );
}

describe('Profile settings page', () => {
    beforeEach(() => {
        mockedFetchCurrentUser.mockReset();
        mockedUpdateProfile.mockReset();
        mockedFetchCurrentUser.mockResolvedValue(verifiedUser);
    });

    it('renders the profile form with the current user values', async () => {
        renderProfile();

        expect(await screen.findByLabelText('Name')).toHaveValue('Test User');
        expect(screen.getByLabelText('Email address')).toHaveValue(
            'test@example.com',
        );
    });

    it('shows validation errors from updateProfile rejection', async () => {
        const user = userEvent.setup();
        mockedUpdateProfile.mockRejectedValue({
            kind: 'validation',
            status: 422,
            message: 'The given data was invalid.',
            errors: {
                email: ['The email has already been taken.'],
            },
        });

        renderProfile();

        await user.clear(await screen.findByLabelText('Email address'));
        await user.type(
            screen.getByLabelText('Email address'),
            'taken@example.com',
        );
        await user.click(screen.getByRole('button', { name: 'Save' }));

        expect(
            await screen.findByText('The email has already been taken.'),
        ).toBeInTheDocument();
    });

    it('calls updateProfile and refreshUser on success', async () => {
        const user = userEvent.setup();
        mockedUpdateProfile.mockResolvedValue(undefined);
        mockedFetchCurrentUser
            .mockResolvedValueOnce(verifiedUser)
            .mockResolvedValueOnce({
                ...verifiedUser,
                name: 'Updated User',
            });

        renderProfile();

        await user.clear(await screen.findByLabelText('Name'));
        await user.type(screen.getByLabelText('Name'), 'Updated User');
        await user.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() => {
            expect(mockedUpdateProfile).toHaveBeenCalledWith({
                name: 'Updated User',
                email: 'test@example.com',
            });
        });

        expect(mockedFetchCurrentUser).toHaveBeenCalledTimes(2);
        expect(await screen.findByText('Profile updated.')).toBeInTheDocument();
    });
});
