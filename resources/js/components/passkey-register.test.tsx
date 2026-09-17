import PasskeyRegister from '@/components/passkey-register';
import { PASSKEY_PASSWORD_CONFIRMATION_MESSAGE } from '@/lib/passkeys';
import { PasskeyError, UserCancelledError } from '@laravel/passkeys';
import { usePasskeyRegister } from '@laravel/passkeys/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';

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

const mockedUsePasskeyRegister = vi.mocked(usePasskeyRegister);
const mockedEnsureCsrfCookie = vi.mocked(ensureCsrfCookie);
const mockedPreparePasskeyCeremony = vi.mocked(preparePasskeyCeremony);

function renderRegister(onSuccess = vi.fn()) {
    return render(
        <MemoryRouter initialEntries={['/settings/security']}>
            <PasskeyRegister onSuccess={onSuccess} />
        </MemoryRouter>,
    );
}

describe('PasskeyRegister', () => {
    beforeEach(() => {
        mockedUsePasskeyRegister.mockReset();
        mockedEnsureCsrfCookie.mockClear();
        mockedPreparePasskeyCeremony.mockClear();
    });

    it('shows official unsupported message when browser does not support passkeys', () => {
        mockedUsePasskeyRegister.mockReturnValue({
            register: vi.fn(),
            isLoading: false,
            error: null,
            errorInstance: null,
            isSupported: false,
        });

        renderRegister();

        expect(
            screen.getByText('Passkeys are not supported in this browser.'),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Add passkey' }),
        ).not.toBeInTheDocument();
    });

    it('shows Add passkey before opening the registration form', async () => {
        mockedUsePasskeyRegister.mockReturnValue({
            register: vi.fn(),
            isLoading: false,
            error: null,
            errorInstance: null,
            isSupported: true,
        });

        renderRegister();

        expect(
            screen.getByRole('button', { name: 'Add passkey' }),
        ).toBeInTheDocument();
        expect(screen.queryByLabelText('Passkey name')).not.toBeInTheDocument();
    });

    it('opens official registration UI with default name and actions', async () => {
        const user = userEvent.setup();
        mockedUsePasskeyRegister.mockReturnValue({
            register: vi.fn(),
            isLoading: false,
            error: null,
            errorInstance: null,
            isSupported: true,
        });

        renderRegister();

        await user.click(screen.getByRole('button', { name: 'Add passkey' }));

        expect(screen.getByLabelText('Passkey name')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Register passkey' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Cancel' }),
        ).toBeInTheDocument();
        expect(
            screen.getByText('A name helps you identify this passkey later.'),
        ).toBeInTheDocument();
    });

    it('does not submit whitespace-only names', async () => {
        const user = userEvent.setup();
        const register = vi.fn().mockResolvedValue(undefined);
        mockedUsePasskeyRegister.mockReturnValue({
            register,
            isLoading: false,
            error: null,
            errorInstance: null,
            isSupported: true,
        });

        renderRegister();

        await user.click(screen.getByRole('button', { name: 'Add passkey' }));
        await user.clear(screen.getByLabelText('Passkey name'));
        await user.type(screen.getByLabelText('Passkey name'), '   ');
        await user.click(
            screen.getByRole('button', { name: 'Register passkey' }),
        );

        expect(register).not.toHaveBeenCalled();
    });

    it('prepares CSRF and registers with trimmed name', async () => {
        const user = userEvent.setup();
        const register = vi.fn().mockResolvedValue(undefined);
        const onSuccess = vi.fn();
        mockedUsePasskeyRegister.mockImplementation(
            (options?: { onSuccess?: () => void }) => ({
                register: async (name: string) => {
                    await register(name);
                    options?.onSuccess?.();
                },
                isLoading: false,
                error: null,
                errorInstance: null,
                isSupported: true,
            }),
        );

        renderRegister(onSuccess);

        await user.click(screen.getByRole('button', { name: 'Add passkey' }));
        await user.clear(screen.getByLabelText('Passkey name'));
        await user.type(
            screen.getByLabelText('Passkey name'),
            '  Work Laptop  ',
        );
        await user.click(
            screen.getByRole('button', { name: 'Register passkey' }),
        );

        expect(mockedPreparePasskeyCeremony).toHaveBeenCalledTimes(1);
        expect(register).toHaveBeenCalledWith('Work Laptop');
        expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it('shows loading state while registering', async () => {
        mockedUsePasskeyRegister.mockReturnValue({
            register: vi.fn(),
            isLoading: true,
            error: null,
            errorInstance: null,
            isSupported: true,
        });

        renderRegister();

        await userEvent
            .setup()
            .click(screen.getByRole('button', { name: 'Add passkey' }));

        expect(
            screen.getByRole('button', { name: 'Registering...' }),
        ).toBeDisabled();
    });

    it('maps registration errors without exposing raw payloads', async () => {
        mockedUsePasskeyRegister.mockReturnValue({
            register: vi.fn(),
            isLoading: false,
            error: 'Unable to register passkey.',
            errorInstance: new PasskeyError('Unable to register passkey.'),
            isSupported: true,
        });

        renderRegister();

        await userEvent
            .setup()
            .click(screen.getByRole('button', { name: 'Add passkey' }));

        expect(
            screen.getByText('Unable to register passkey.'),
        ).toBeInTheDocument();
    });

    it('keeps cancellation silent', async () => {
        mockedUsePasskeyRegister.mockReturnValue({
            register: vi.fn(),
            isLoading: false,
            error: 'The passkey operation was cancelled.',
            errorInstance: new UserCancelledError(),
            isSupported: true,
        });

        renderRegister();

        await userEvent
            .setup()
            .click(screen.getByRole('button', { name: 'Add passkey' }));

        expect(
            screen.queryByText('The passkey operation was cancelled.'),
        ).not.toBeInTheDocument();
    });

    it('registers an onError handler for password confirmation without replaying success', () => {
        const onSuccess = vi.fn();
        mockedUsePasskeyRegister.mockReturnValue({
            register: vi.fn(),
            isLoading: false,
            error: null,
            errorInstance: null,
            isSupported: true,
        });

        renderRegister(onSuccess);

        const registerOptions = mockedUsePasskeyRegister.mock.calls.at(
            -1,
        )?.[0] as { onError?: (error: PasskeyError) => void } | undefined;
        registerOptions?.onError?.(
            new PasskeyError(PASSKEY_PASSWORD_CONFIRMATION_MESSAGE),
        );

        expect(typeof registerOptions?.onError).toBe('function');
        expect(onSuccess).not.toHaveBeenCalled();
    });
});
