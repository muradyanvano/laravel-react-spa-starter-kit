import ManagePasskeys from '@/components/manage-passkeys';
import { PASSKEY_PASSWORD_CONFIRMATION_MESSAGE } from '@/lib/passkeys';
import { PasskeyError, UserCancelledError } from '@laravel/passkeys';
import { usePasskeyRegister } from '@laravel/passkeys/react';
import { render, screen, waitFor } from '@testing-library/react';
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

vi.mock('@/lib/settings-api', () => ({
    fetchPasskeys: vi.fn(),
    deletePasskey: vi.fn(),
}));

import { deletePasskey, fetchPasskeys } from '@/lib/settings-api';

const mockedFetchPasskeys = vi.mocked(fetchPasskeys);
const mockedDeletePasskey = vi.mocked(deletePasskey);
const mockedUsePasskeyRegister = vi.mocked(usePasskeyRegister);

const samplePasskeys = [
    {
        id: 1,
        name: 'Chrome on Windows',
        authenticator: 'platform',
        created_at_diff: '2 days ago',
        last_used_at_diff: '1 hour ago',
    },
];

function renderManagePasskeys(canManagePasskeys = true) {
    return render(
        <MemoryRouter initialEntries={['/settings/security']}>
            <ManagePasskeys canManagePasskeys={canManagePasskeys} />
        </MemoryRouter>,
    );
}

describe('ManagePasskeys', () => {
    beforeEach(() => {
        mockedFetchPasskeys.mockReset();
        mockedDeletePasskey.mockReset();
        mockedUsePasskeyRegister.mockReset();
        mockedFetchPasskeys.mockResolvedValue([]);
        mockedUsePasskeyRegister.mockReturnValue({
            register: vi.fn(),
            isLoading: false,
            error: null,
            errorInstance: null,
            isSupported: true,
        });
    });

    it('renders nothing when capability is false', () => {
        renderManagePasskeys(false);

        expect(
            screen.queryByRole('heading', { name: 'Passkeys' }),
        ).not.toBeInTheDocument();
        expect(mockedFetchPasskeys).not.toHaveBeenCalled();
    });

    it('shows loading state and fetches passkeys on mount', async () => {
        let resolvePasskeys: (value: typeof samplePasskeys) => void = () =>
            undefined;

        mockedFetchPasskeys.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolvePasskeys = resolve;
                }),
        );

        renderManagePasskeys();

        expect(
            await screen.findByTestId('passkeys-loading'),
        ).toBeInTheDocument();

        resolvePasskeys(samplePasskeys);

        expect(
            await screen.findByText('Chrome on Windows'),
        ).toBeInTheDocument();
        expect(mockedFetchPasskeys).toHaveBeenCalledTimes(1);
    });

    it('renders empty state when no passkeys exist', async () => {
        renderManagePasskeys();

        expect(await screen.findByText('No passkeys yet')).toBeInTheDocument();
        expect(
            screen.getByText('Add a passkey to sign in without a password'),
        ).toBeInTheDocument();
    });

    it('shows list errors without clearing the section', async () => {
        mockedFetchPasskeys.mockRejectedValue({
            kind: 'server',
            status: 500,
            message: 'Unable to load passkeys.',
            errors: {},
        });

        renderManagePasskeys();

        expect(
            await screen.findByText('Unable to load passkeys.'),
        ).toBeInTheDocument();
    });

    it('still shows existing passkeys when registration is unsupported', async () => {
        mockedFetchPasskeys.mockResolvedValue(samplePasskeys);
        mockedUsePasskeyRegister.mockReturnValue({
            register: vi.fn(),
            isLoading: false,
            error: null,
            errorInstance: null,
            isSupported: false,
        });

        renderManagePasskeys();

        expect(
            await screen.findByText('Chrome on Windows'),
        ).toBeInTheDocument();
        expect(
            screen.getByText('Passkeys are not supported in this browser.'),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Add passkey' }),
        ).not.toBeInTheDocument();
    });

    it('refreshes the list exactly once after successful registration', async () => {
        const user = userEvent.setup();
        mockedFetchPasskeys
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce(samplePasskeys);

        mockedUsePasskeyRegister.mockImplementation(
            (options?: { onSuccess?: () => void }) => ({
                register: async () => {
                    options?.onSuccess?.();
                },
                isLoading: false,
                error: null,
                errorInstance: null,
                isSupported: true,
            }),
        );

        renderManagePasskeys();

        await screen.findByText('No passkeys yet');
        await user.click(screen.getByRole('button', { name: 'Add passkey' }));
        await user.clear(screen.getByLabelText('Passkey name'));
        await user.type(screen.getByLabelText('Passkey name'), 'Work Laptop');
        await user.click(
            screen.getByRole('button', { name: 'Register passkey' }),
        );

        await waitFor(() => {
            expect(mockedFetchPasskeys).toHaveBeenCalledTimes(2);
        });
        expect(
            await screen.findByText('Chrome on Windows'),
        ).toBeInTheDocument();
    });

    it('does not refresh the list after registration cancellation', async () => {
        mockedFetchPasskeys.mockResolvedValue([]);
        mockedUsePasskeyRegister.mockReturnValue({
            register: vi.fn(),
            isLoading: false,
            error: 'The passkey operation was cancelled.',
            errorInstance: new UserCancelledError(),
            isSupported: true,
        });

        renderManagePasskeys();

        await screen.findByText('No passkeys yet');
        expect(mockedFetchPasskeys).toHaveBeenCalledTimes(1);
    });

    it('deletes once and refreshes the list exactly once', async () => {
        const user = userEvent.setup();
        mockedFetchPasskeys
            .mockResolvedValueOnce(samplePasskeys)
            .mockResolvedValueOnce([]);
        mockedDeletePasskey.mockResolvedValue(undefined);

        renderManagePasskeys();

        await screen.findByText('Chrome on Windows');
        await user.click(screen.getByRole('button', { name: 'Remove' }));
        await user.click(
            screen.getByRole('button', { name: 'Remove passkey' }),
        );

        await waitFor(() => {
            expect(mockedDeletePasskey).toHaveBeenCalledTimes(1);
            expect(mockedDeletePasskey).toHaveBeenCalledWith(1);
            expect(mockedFetchPasskeys).toHaveBeenCalledTimes(2);
        });
    });

    it('shows delete failures and keeps the passkey visible', async () => {
        const user = userEvent.setup();
        mockedFetchPasskeys.mockResolvedValue(samplePasskeys);
        mockedDeletePasskey.mockRejectedValue({
            kind: 'forbidden',
            status: 403,
            message: 'This action is unauthorized.',
            errors: {},
        });

        renderManagePasskeys();

        await screen.findByText('Chrome on Windows');
        await user.click(screen.getByRole('button', { name: 'Remove' }));
        await user.click(
            screen.getByRole('button', { name: 'Remove passkey' }),
        );

        expect(
            await screen.findByText('This action is unauthorized.'),
        ).toBeInTheDocument();
        expect(screen.getByText('Chrome on Windows')).toBeInTheDocument();
        expect(mockedFetchPasskeys).toHaveBeenCalledTimes(1);
    });

    it('handles registration 423 through the passkey error callback', async () => {
        mockedUsePasskeyRegister.mockReturnValue({
            register: vi.fn(),
            isLoading: false,
            error: PASSKEY_PASSWORD_CONFIRMATION_MESSAGE,
            errorInstance: new PasskeyError(
                PASSKEY_PASSWORD_CONFIRMATION_MESSAGE,
            ),
            isSupported: true,
        });

        renderManagePasskeys();

        await screen.findByText('No passkeys yet');

        const registerOptions = mockedUsePasskeyRegister.mock.calls.at(
            -1,
        )?.[0] as { onError?: (error: PasskeyError) => void } | undefined;
        registerOptions?.onError?.(
            new PasskeyError(PASSKEY_PASSWORD_CONFIRMATION_MESSAGE),
        );

        expect(mockedFetchPasskeys).toHaveBeenCalledTimes(1);
    });
});
