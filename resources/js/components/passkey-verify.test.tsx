import PasskeyVerify from '@/components/passkey-verify';
import { UserCancelledError } from '@laravel/passkeys';
import { usePasskeyVerify } from '@laravel/passkeys/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/http', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/lib/http')>();

    return {
        ...actual,
        ensureCsrfCookie: vi.fn().mockResolvedValue(undefined),
    };
});

vi.mock('@/lib/passkeys', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/lib/passkeys')>();

    return {
        ...actual,
        preparePasskeyCeremony: vi.fn().mockResolvedValue(undefined),
    };
});

import { ensureCsrfCookie } from '@/lib/http';
import { preparePasskeyCeremony } from '@/lib/passkeys';

const mockedUsePasskeyVerify = vi.mocked(usePasskeyVerify);
const mockedEnsureCsrfCookie = vi.mocked(ensureCsrfCookie);
const mockedPreparePasskeyCeremony = vi.mocked(preparePasskeyCeremony);

describe('PasskeyVerify', () => {
    beforeEach(() => {
        mockedUsePasskeyVerify.mockReset();
        mockedEnsureCsrfCookie.mockClear();
        mockedPreparePasskeyCeremony.mockClear();
    });

    it('renders official-style passkey UI when supported', () => {
        mockedUsePasskeyVerify.mockReturnValue({
            verify: vi.fn(),
            isLoading: false,
            error: null,
            errorInstance: null,
            isSupported: true,
        });

        render(<PasskeyVerify />);

        expect(
            screen.getByRole('button', { name: 'Sign in with a passkey' }),
        ).toBeInTheDocument();
        expect(screen.getByText('Or continue with email')).toBeInTheDocument();
    });

    it('hides passkey UI when unsupported', () => {
        mockedUsePasskeyVerify.mockReturnValue({
            verify: vi.fn(),
            isLoading: false,
            error: null,
            errorInstance: null,
            isSupported: false,
        });

        render(<PasskeyVerify label="Confirm with passkey" />);

        expect(
            screen.queryByRole('button', { name: 'Confirm with passkey' }),
        ).not.toBeInTheDocument();
    });

    it('uses custom labels and separator for confirmation flows', () => {
        mockedUsePasskeyVerify.mockReturnValue({
            verify: vi.fn(),
            isLoading: false,
            error: null,
            errorInstance: null,
            isSupported: true,
        });

        render(
            <PasskeyVerify
                label="Confirm with passkey"
                loadingLabel="Confirming..."
                separator="Or confirm with password"
            />,
        );

        expect(
            screen.getByRole('button', { name: 'Confirm with passkey' }),
        ).toBeInTheDocument();
        expect(
            screen.getByText('Or confirm with password'),
        ).toBeInTheDocument();
    });

    it('shows loading state with official wording', () => {
        mockedUsePasskeyVerify.mockReturnValue({
            verify: vi.fn(),
            isLoading: true,
            error: null,
            errorInstance: null,
            isSupported: true,
        });

        render(<PasskeyVerify />);

        expect(screen.getByTestId('passkey-verify-button')).toBeDisabled();
        expect(screen.getByText('Authenticating...')).toBeInTheDocument();
    });

    it('prepares CSRF before verification and calls parent success handler', async () => {
        const user = userEvent.setup();
        const verify = vi.fn().mockResolvedValue(undefined);
        const onSuccess = vi.fn();

        mockedUsePasskeyVerify.mockImplementation((options) => ({
            verify: async () => {
                await verify();
                options?.onSuccess?.({ redirect: '/dashboard' });
            },
            isLoading: false,
            error: null,
            errorInstance: null,
            isSupported: true,
        }));

        render(<PasskeyVerify onSuccess={onSuccess} />);

        await user.click(
            screen.getByRole('button', { name: 'Sign in with a passkey' }),
        );

        expect(mockedPreparePasskeyCeremony).toHaveBeenCalledTimes(1);
        expect(verify).toHaveBeenCalledTimes(1);
        expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it('keeps cancellation silent', () => {
        mockedUsePasskeyVerify.mockReturnValue({
            verify: vi.fn(),
            isLoading: false,
            error: 'The passkey operation was cancelled.',
            errorInstance: new UserCancelledError(),
            isSupported: true,
        });

        render(<PasskeyVerify />);

        expect(
            screen.queryByText('The passkey operation was cancelled.'),
        ).not.toBeInTheDocument();
    });

    it('shows safe mapped errors', () => {
        mockedUsePasskeyVerify.mockReturnValue({
            verify: vi.fn(),
            isLoading: false,
            error: 'Unable to sign in with this account.',
            errorInstance: null,
            isSupported: true,
        });

        render(<PasskeyVerify />);

        expect(
            screen.getByText('Unable to sign in with this account.'),
        ).toBeInTheDocument();
    });

    it('places the passkey button before the separator', () => {
        mockedUsePasskeyVerify.mockReturnValue({
            verify: vi.fn(),
            isLoading: false,
            error: null,
            errorInstance: null,
            isSupported: true,
        });

        render(<PasskeyVerify />);

        const button = screen.getByTestId('passkey-verify-button');
        const separator = screen.getByText('Or continue with email');

        expect(
            button.compareDocumentPosition(separator) &
                Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
    });
});
