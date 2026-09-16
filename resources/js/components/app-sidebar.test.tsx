import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TestProviders } from '@/testing/test-providers';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';

vi.mock('@/lib/auth-api', () => ({
    fetchCurrentUser: vi.fn().mockResolvedValue(null),
    logout: vi.fn(),
}));

vi.mock('@/components/nav-user', () => ({
    NavUser: () => null,
}));

describe('AppSidebar repository link', () => {
    it('points to this starter-kit repository', async () => {
        render(
            <TestProviders>
                <MemoryRouter>
                    <SidebarProvider>
                        <AppSidebar />
                    </SidebarProvider>
                </MemoryRouter>
            </TestProviders>,
        );

        expect(
            await screen.findByRole('link', { name: /Repository/i }),
        ).toHaveAttribute(
            'href',
            'https://github.com/muradyanvano/laravel-react-spa-starter-kit',
        );
    });
});
