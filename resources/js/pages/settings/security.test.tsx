import { VerifiedRoute } from '@/router/guards';
import { TestProviders } from '@/testing/test-providers';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';
import Security from '@/pages/settings/security';

vi.mock('@/lib/auth-api', () => ({
    fetchCurrentUser: vi.fn(),
    logout: vi.fn(),
}));

vi.mock('@/lib/settings-api', () => ({
    fetchPasswordConfirmationStatus: vi.fn(),
    fetchSecuritySettings: vi.fn(),
    updatePassword: vi.fn(),
    enableTwoFactor: vi.fn(),
    disableTwoFactor: vi.fn(),
    fetchTwoFactorQrCode: vi.fn(),
    fetchTwoFactorSecretKey: vi.fn(),
    fetchRecoveryCodes: vi.fn(),
}));

import { fetchCurrentUser } from '@/lib/auth-api';
import {
    fetchPasswordConfirmationStatus,
    fetchSecuritySettings,
} from '@/lib/settings-api';

const mockedFetchCurrentUser = vi.mocked(fetchCurrentUser);
const mockedFetchPasswordConfirmationStatus = vi.mocked(
    fetchPasswordConfirmationStatus,
);
const mockedFetchSecuritySettings = vi.mocked(fetchSecuritySettings);

const verifiedUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    email_verified_at: '2026-01-01T00:00:00+00:00',
};

const securitySettings = {
    canManageTwoFactor: true,
    twoFactorEnabled: false,
    requiresConfirmation: true,
    passwordRules: 'min:8',
};

function renderSecurity() {
    return render(
        <TestProviders>
            <MemoryRouter initialEntries={['/settings/security']}>
                <Routes>
                    <Route element={<VerifiedRoute />}>
                        <Route
                            path="/settings/security"
                            element={<Security />}
                        />
                    </Route>
                </Routes>
            </MemoryRouter>
        </TestProviders>,
    );
}

describe('Security settings page', () => {
    beforeEach(() => {
        mockedFetchCurrentUser.mockReset();
        mockedFetchPasswordConfirmationStatus.mockReset();
        mockedFetchSecuritySettings.mockReset();
        mockedFetchCurrentUser.mockResolvedValue(verifiedUser);
        mockedFetchPasswordConfirmationStatus.mockResolvedValue({
            confirmed: true,
        });
        mockedFetchSecuritySettings.mockResolvedValue(securitySettings);
    });

    it('shows the password form and two-factor section when settings are loaded', async () => {
        renderSecurity();

        expect(
            await screen.findByLabelText('Current password'),
        ).toBeInTheDocument();
        expect(screen.getByLabelText('New password')).toBeInTheDocument();
        expect(screen.getByLabelText('Confirm password')).toBeInTheDocument();
        expect(
            await screen.findByRole('heading', {
                name: 'Two-factor authentication',
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Enable 2FA' }),
        ).toBeInTheDocument();
    });
});
