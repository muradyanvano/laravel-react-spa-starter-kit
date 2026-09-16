import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('router page loading strategy', () => {
    it('statically imports pages without React.lazy or Suspense', () => {
        const source = readFileSync(
            resolve(process.cwd(), 'resources/js/router/index.tsx'),
            'utf8',
        );

        expect(source).not.toMatch(/\blazy\s*\(/);
        expect(source).not.toMatch(/\bSuspense\b/);
        expect(source).not.toContain('Loading…');
        expect(source).toContain(
            "import DashboardPage from '@/pages/dashboard'",
        );
        expect(source).toContain(
            "import SecuritySettingsPage from '@/pages/settings/security'",
        );
        expect(source).toContain('<AppLoader />');
    });
});
