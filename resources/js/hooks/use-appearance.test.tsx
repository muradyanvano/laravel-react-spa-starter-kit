import {
    initializeTheme,
    useAppearance,
    type Appearance,
} from '@/hooks/use-appearance';
import { getMatchMediaMock } from '@/testing/setup';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

describe('useAppearance', () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = '';
        document.cookie = 'appearance=; max-age=0';

        initializeTheme();
    });

    it.each<[Appearance, boolean]>([
        ['light', false],
        ['dark', true],
    ])('persists %s appearance in localStorage', (mode, isDark) => {
        const { result } = renderHook(() => useAppearance());

        act(() => {
            result.current.updateAppearance(mode);
        });

        expect(localStorage.getItem('appearance')).toBe(mode);
        expect(document.documentElement.classList.contains('dark')).toBe(
            isDark,
        );
        expect(result.current.appearance).toBe(mode);
    });

    it('follows system preference changes when appearance is system', () => {
        const darkPreference = getMatchMediaMock(
            '(prefers-color-scheme: dark)',
        );
        const { result } = renderHook(() => useAppearance());

        act(() => {
            result.current.updateAppearance('system');
        });

        expect(localStorage.getItem('appearance')).toBe('system');
        expect(document.documentElement.classList.contains('dark')).toBe(false);

        act(() => {
            darkPreference.dispatchChange(true);
        });

        expect(document.documentElement.classList.contains('dark')).toBe(true);

        act(() => {
            darkPreference.dispatchChange(false);
        });

        expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
});
