import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';

vi.mock('@/lib/settings-api', () => ({
    regenerateRecoveryCodes: vi.fn(),
}));

function renderRecoveryCodes(
    props: React.ComponentProps<typeof TwoFactorRecoveryCodes>,
) {
    return render(
        <MemoryRouter>
            <TwoFactorRecoveryCodes {...props} />
        </MemoryRouter>,
    );
}

describe('TwoFactorRecoveryCodes lazy loading', () => {
    afterEach(() => {
        cleanup();
    });

    it('does not fetch recovery codes on mount', () => {
        const fetchRecoveryCodes = vi.fn().mockResolvedValue(undefined);

        renderRecoveryCodes({
            recoveryCodesList: [],
            fetchRecoveryCodes,
            errors: [],
        });

        expect(fetchRecoveryCodes).not.toHaveBeenCalled();
        expect(
            screen.getByRole('button', { name: /View recovery codes/i }),
        ).toBeInTheDocument();
    });

    it('fetches recovery codes when the user chooses to view them', async () => {
        Element.prototype.scrollIntoView = vi.fn();

        const user = userEvent.setup();
        const fetchRecoveryCodes = vi.fn().mockImplementation(async () => {
            // Parent would set codes; leave empty for loading UI.
        });

        const { rerender } = renderRecoveryCodes({
            recoveryCodesList: [],
            fetchRecoveryCodes,
            errors: [],
        });

        await user.click(
            screen.getByRole('button', { name: /View recovery codes/i }),
        );

        await waitFor(() => {
            expect(fetchRecoveryCodes).toHaveBeenCalledTimes(1);
        });

        rerender(
            <MemoryRouter>
                <TwoFactorRecoveryCodes
                    recoveryCodesList={['abcd-efgh', 'ijkl-mnop']}
                    fetchRecoveryCodes={fetchRecoveryCodes}
                    errors={[]}
                />
            </MemoryRouter>,
        );

        expect(await screen.findByText('abcd-efgh')).toBeInTheDocument();
        expect(screen.getByText('ijkl-mnop')).toBeInTheDocument();
    });
});
