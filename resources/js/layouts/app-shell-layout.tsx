import { DocumentTitle } from '@/components/document-title';
import { Link } from 'react-router';
import type { ReactNode } from 'react';

export function AppShellLayout({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
            <DocumentTitle title={title} />
            <header className="border-b border-[#e3e3e0] dark:border-[#3E3E3A]">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
                    <Link
                        to="/dashboard"
                        className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]"
                    >
                        {import.meta.env.VITE_APP_NAME || 'Laravel'}
                    </Link>
                    <nav
                        aria-label="Primary"
                        className="flex flex-wrap items-center gap-4 text-sm"
                    >
                        <Link
                            to="/dashboard"
                            className="text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]"
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/settings/profile"
                            className="text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]"
                        >
                            Settings
                        </Link>
                    </nav>
                </div>
            </header>
            <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
        </div>
    );
}
