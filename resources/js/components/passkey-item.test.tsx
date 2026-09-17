import PasskeyItem from '@/components/passkey-item';
import type { Passkey } from '@/types/auth';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const passkey: Passkey = {
    id: 1,
    name: 'Chrome on Windows',
    authenticator: 'platform',
    created_at_diff: '2 days ago',
    last_used_at_diff: '1 hour ago',
};

describe('PasskeyItem', () => {
    it('renders safe metadata only', () => {
        render(<PasskeyItem passkey={passkey} onDelete={vi.fn()} />);

        expect(screen.getByText('Chrome on Windows')).toBeInTheDocument();
        expect(screen.getByText('platform')).toBeInTheDocument();
        expect(screen.getByText(/Added 2 days ago/)).toBeInTheDocument();
        expect(screen.getByText(/Last used 1 hour ago/)).toBeInTheDocument();
        expect(screen.queryByText(/credential/i)).not.toBeInTheDocument();
    });

    it('handles nullable authenticator and last-used metadata', () => {
        render(
            <PasskeyItem
                passkey={{
                    ...passkey,
                    authenticator: null,
                    last_used_at_diff: null,
                }}
                onDelete={vi.fn()}
            />,
        );

        expect(screen.getByText('Chrome on Windows')).toBeInTheDocument();
        expect(screen.queryByText('platform')).not.toBeInTheDocument();
        expect(screen.getByText(/Added 2 days ago/)).toBeInTheDocument();
        expect(screen.queryByText(/Last used/)).not.toBeInTheDocument();
    });

    it('requires confirmation before deleting', async () => {
        const user = userEvent.setup();
        const onDelete = vi.fn();

        render(<PasskeyItem passkey={passkey} onDelete={onDelete} />);

        await user.click(screen.getByRole('button', { name: 'Remove' }));

        expect(
            screen.getByRole('heading', { name: 'Remove passkey' }),
        ).toBeInTheDocument();
        expect(onDelete).not.toHaveBeenCalled();
    });

    it('does not delete when cancel is clicked', async () => {
        const user = userEvent.setup();
        const onDelete = vi.fn();

        render(<PasskeyItem passkey={passkey} onDelete={onDelete} />);

        await user.click(screen.getByRole('button', { name: 'Remove' }));
        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(onDelete).not.toHaveBeenCalled();
    });

    it('deletes once after confirmation and shows destructive loading state', async () => {
        const user = userEvent.setup();
        const onDelete = vi.fn((_id, onComplete) => {
            onComplete(true);
        });

        render(<PasskeyItem passkey={passkey} onDelete={onDelete} />);

        await user.click(screen.getByRole('button', { name: 'Remove' }));
        await user.click(
            screen.getByRole('button', { name: 'Remove passkey' }),
        );

        expect(onDelete).toHaveBeenCalledTimes(1);
        expect(onDelete).toHaveBeenCalledWith(1, expect.any(Function));
    });

    it('keeps the item when deletion fails', async () => {
        const user = userEvent.setup();
        const onDelete = vi.fn((_id, onComplete) => {
            onComplete(false);
        });

        render(<PasskeyItem passkey={passkey} onDelete={onDelete} />);

        await user.click(screen.getByRole('button', { name: 'Remove' }));
        await user.click(
            screen.getByRole('button', { name: 'Remove passkey' }),
        );

        expect(screen.getByText('Chrome on Windows')).toBeInTheDocument();
        expect(
            screen.getByRole('heading', { name: 'Remove passkey' }),
        ).toBeInTheDocument();
    });
});
