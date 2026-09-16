import { describe, expect, it } from 'vitest';
import { getPostAuthPath, getSafeInternalPath } from '@/lib/navigation';

describe('getSafeInternalPath', () => {
    it('accepts internal spa paths', () => {
        expect(getSafeInternalPath('/settings/profile')).toBe(
            '/settings/profile',
        );
        expect(getSafeInternalPath('/dashboard?tab=1')).toBe(
            '/dashboard?tab=1',
        );
    });

    it('rejects open redirect candidates', () => {
        expect(getSafeInternalPath('https://evil.test')).toBe('/dashboard');
        expect(getSafeInternalPath('//evil.test')).toBe('/dashboard');
        expect(getSafeInternalPath('\\evil')).toBe('/dashboard');
        expect(getSafeInternalPath('javascript:alert(1)')).toBe('/dashboard');
        expect(getSafeInternalPath('http://evil.test/path')).toBe('/dashboard');
        expect(getSafeInternalPath(null)).toBe('/dashboard');
        expect(getSafeInternalPath('')).toBe('/dashboard');
    });
});

describe('getPostAuthPath', () => {
    it('avoids resuming confirm-password after login', () => {
        expect(getPostAuthPath('/confirm-password')).toBe('/dashboard');
        expect(getPostAuthPath('/confirm-password?x=1')).toBe('/dashboard');
    });

    it('preserves other safe intended paths', () => {
        expect(getPostAuthPath('/settings/profile')).toBe('/settings/profile');
        expect(getPostAuthPath('/dashboard')).toBe('/dashboard');
    });
});
