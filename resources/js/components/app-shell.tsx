import { SidebarProvider } from '@/components/ui/sidebar';
import type { AppVariant } from '@/types';
import { useState, type ReactNode } from 'react';

type Props = {
    children: ReactNode;
    variant?: AppVariant;
};

/** The sidebar writes its own `sidebar_state` cookie; read it back for the initial render. */
function readSidebarState(): boolean {
    if (typeof document === 'undefined') {
        return true;
    }

    const match = document.cookie.match(
        /(?:^|;\s*)sidebar_state=(true|false)(?:;|$)/,
    );

    return match ? match[1] === 'true' : true;
}

export function AppShell({ children, variant = 'sidebar' }: Props) {
    const [isOpen] = useState(readSidebarState);

    if (variant === 'header') {
        return (
            <div className="flex min-h-screen w-full flex-col">{children}</div>
        );
    }

    return <SidebarProvider defaultOpen={isOpen}>{children}</SidebarProvider>;
}
