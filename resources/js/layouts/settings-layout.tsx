import { AppShellLayout } from '@/layouts/app-shell-layout';
import { Link } from 'react-router';
import type { ReactNode } from 'react';

function SettingsNav() {
    const links = [
        { to: '/settings/profile', label: 'Profile' },
        { to: '/settings/password', label: 'Password' },
        { to: '/settings/appearance', label: 'Appearance' },
        { to: '/settings/two-factor', label: 'Two-factor' },
    ];

    return (
        <nav
            aria-label="Settings"
            className="mb-6 flex flex-wrap gap-3 text-sm"
        >
            {links.map((link) => (
                <Link
                    key={link.to}
                    to={link.to}
                    className="text-[#706f6c] underline-offset-4 hover:text-[#1b1b18] hover:underline dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]"
                >
                    {link.label}
                </Link>
            ))}
        </nav>
    );
}

export function SettingsLayout({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <AppShellLayout title={title}>
            <SettingsNav />
            {children}
        </AppShellLayout>
    );
}
