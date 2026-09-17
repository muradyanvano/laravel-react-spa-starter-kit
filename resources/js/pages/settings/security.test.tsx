import { VerifiedRoute } from '@/router/guards';
import { TestProviders } from '@/testing/test-providers';
import { render, screen, waitFor } from '@testing-library/react';
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
    fetchPasskeys: vi.fn(),
    deletePasskey: vi.fn(),
    updatePassword: vi.fn(),
    enableTwoFactor: vi.fn(),
    disableTwoFactor: vi.fn(),
    fetchTwoFactorQrCode: vi.fn(),
    fetchTwoFactorSecretKey: vi.fn(),
    fetchRecoveryCodes: vi.fn(),
}));

import { fetchCurrentUser } from '@/lib/auth-api';
import {
    fetchPasskeys,
    fetchPasswordConfirmationStatus,
    fetchRecoveryCodes,
    fetchSecuritySettings,
} from '@/lib/settings-api';

const mockedFetchCurrentUser = vi.mocked(fetchCurrentUser);
const mockedFetchPasswordConfirmationStatus = vi.mocked(
    fetchPasswordConfirmationStatus,
);
const mockedFetchSecuritySettings = vi.mocked(fetchSecuritySettings);
const mockedFetchPasskeys = vi.mocked(fetchPasskeys);
const mockedFetchRecoveryCodes = vi.mocked(fetchRecoveryCodes);

const verifiedUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    email_verified_at: '2026-01-01T00:00:00+00:00',
};

const securitySettings = {
    canManageTwoFactor: true,
    canManagePasskeys: true,
    twoFactorEnabled: false,
    requiresConfirmation: true,
    passwordRules: 'min:8',
};

function renderSecurity(initialEntry = '/settings/security') {
    return render(
        <TestProviders>
            <MemoryRouter initialEntries={[initialEntry]}>
                <Routes>
                    <Route element={<VerifiedRoute />}>
                        <Route
                            path="/settings/security"
                            element={<Security />}
                        />
                    </Route>
                    <Route
                        path="/confirm-password"
                        element={<div>Confirm password page</div>}
                    />
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
        mockedFetchPasskeys.mockReset();
        mockedFetchRecoveryCodes.mockReset();
        mockedFetchCurrentUser.mockResolvedValue(verifiedUser);
        mockedFetchPasswordConfirmationStatus.mockResolvedValue({
            confirmed: true,
        });
        mockedFetchSecuritySettings.mockResolvedValue(securitySettings);
        mockedFetchPasskeys.mockResolvedValue([]);
    });

    it('shows a skeleton before password controls appear', async () => {
        let resolveConfirmation: (value: { confirmed: boolean }) => void = () =>
            undefined;

        mockedFetchPasswordConfirmationStatus.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveConfirmation = resolve;
                }),
        );

        renderSecurity();

        expect(
            await screen.findByTestId('security-skeleton'),
        ).toBeInTheDocument();
        expect(
            screen.queryByLabelText('Current password'),
        ).not.toBeInTheDocument();

        resolveConfirmation({ confirmed: true });

        expect(
            await screen.findByLabelText('Current password'),
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('security-skeleton'),
        ).not.toBeInTheDocument();
    });

    it('calls confirmation-status and security settings once during initialization', async () => {
        renderSecurity();

        expect(
            await screen.findByLabelText('Current password'),
        ).toBeInTheDocument();

        expect(mockedFetchPasswordConfirmationStatus).toHaveBeenCalledTimes(1);
        expect(mockedFetchSecuritySettings).toHaveBeenCalledTimes(1);
        expect(mockedFetchPasskeys).toHaveBeenCalledTimes(1);
        expect(mockedFetchRecoveryCodes).not.toHaveBeenCalled();
        expect(mockedFetchCurrentUser).toHaveBeenCalledTimes(1);
    });

    it('does not fetch recovery codes when two-factor is already enabled', async () => {
        mockedFetchSecuritySettings.mockResolvedValue({
            ...securitySettings,
            twoFactorEnabled: true,
        });

        renderSecurity();

        expect(
            await screen.findByRole('button', { name: 'Disable 2FA' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /View recovery codes/i }),
        ).toBeInTheDocument();
        expect(mockedFetchRecoveryCodes).not.toHaveBeenCalled();
        expect(mockedFetchPasswordConfirmationStatus).toHaveBeenCalledTimes(1);
        expect(mockedFetchSecuritySettings).toHaveBeenCalledTimes(1);
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
        expect(
            await screen.findByRole('heading', { name: 'Passkeys' }),
        ).toBeInTheDocument();
    });

    it('orders sections as password, two-factor, then passkeys', async () => {
        renderSecurity();

        expect(
            await screen.findByLabelText('Current password'),
        ).toBeInTheDocument();

        const headings = screen
            .getAllByRole('heading')
            .map((heading) => heading.textContent);

        expect(headings.indexOf('Update password')).toBeLessThan(
            headings.indexOf('Two-factor authentication'),
        );
        expect(headings.indexOf('Two-factor authentication')).toBeLessThan(
            headings.indexOf('Passkeys'),
        );
    });

    it('does not fetch passkeys when capability is false', async () => {
        mockedFetchSecuritySettings.mockResolvedValue({
            ...securitySettings,
            canManagePasskeys: false,
        });

        renderSecurity();

        expect(
            await screen.findByLabelText('Current password'),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('heading', { name: 'Passkeys' }),
        ).not.toBeInTheDocument();
        expect(mockedFetchPasskeys).not.toHaveBeenCalled();
    });

    it('redirects to confirm-password when confirmation is required', async () => {
        mockedFetchPasswordConfirmationStatus.mockResolvedValue({
            confirmed: false,
        });

        renderSecurity();

        expect(
            await screen.findByText('Confirm password page'),
        ).toBeInTheDocument();
        expect(
            screen.queryByLabelText('Current password'),
        ).not.toBeInTheDocument();
        expect(mockedFetchSecuritySettings).not.toHaveBeenCalled();
    });

    it('does not flash password inputs while redirecting for confirmation', async () => {
        let resolveConfirmation: (value: { confirmed: boolean }) => void = () =>
            undefined;

        mockedFetchPasswordConfirmationStatus.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveConfirmation = resolve;
                }),
        );

        renderSecurity();

        expect(
            await screen.findByTestId('security-skeleton'),
        ).toBeInTheDocument();

        resolveConfirmation({ confirmed: false });

        await waitFor(() => {
            expect(
                screen.getByText('Confirm password page'),
            ).toBeInTheDocument();
        });

        expect(
            screen.queryByLabelText('Current password'),
        ).not.toBeInTheDocument();
    });
});
