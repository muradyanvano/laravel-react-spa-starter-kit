import { navigateToConfirmPasswordIfRequired } from '@/lib/password-confirmation';
import { describe, expect, it, vi } from 'vitest';

describe('navigateToConfirmPasswordIfRequired', () => {
    it('navigates for password confirmation errors', () => {
        const navigate = vi.fn();

        const handled = navigateToConfirmPasswordIfRequired(
            {
                kind: 'password_confirmation',
                status: 423,
                message: 'Confirm password',
                errors: {},
            },
            navigate,
            '/settings/security',
        );

        expect(handled).toBe(true);
        expect(navigate).toHaveBeenCalledWith('/confirm-password', {
            replace: true,
            state: { from: '/settings/security' },
        });
    });

    it('ignores unrelated errors', () => {
        const navigate = vi.fn();

        const handled = navigateToConfirmPasswordIfRequired(
            {
                kind: 'validation',
                status: 422,
                message: 'Invalid',
                errors: {},
            },
            navigate,
            '/settings/security',
        );

        expect(handled).toBe(false);
        expect(navigate).not.toHaveBeenCalled();
    });

    it('rejects unsafe intended destinations', () => {
        const navigate = vi.fn();

        navigateToConfirmPasswordIfRequired(
            {
                kind: 'password_confirmation',
                status: 423,
                message: 'Confirm password',
                errors: {},
            },
            navigate,
            'https://evil.test',
        );

        expect(navigate).toHaveBeenCalledWith('/confirm-password', {
            replace: true,
            state: { from: '/settings/security' },
        });
    });
});
