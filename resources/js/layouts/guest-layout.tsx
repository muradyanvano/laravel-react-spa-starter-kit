import { DocumentTitle } from '@/components/document-title';
import { Link } from 'react-router';
import type { ReactNode } from 'react';

export function GuestLayout({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFDFC] px-6 py-12 text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
            <DocumentTitle title={title} />
            <Link to="/" className="mb-8 text-lg font-medium">
                {import.meta.env.VITE_APP_NAME || 'Laravel'}
            </Link>
            <div className="w-full max-w-md">{children}</div>
        </div>
    );
}
