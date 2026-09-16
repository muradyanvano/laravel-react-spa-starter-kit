import { AuthProvider } from '@/auth/auth-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { ReactNode } from 'react';

export function TestProviders({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <TooltipProvider>{children}</TooltipProvider>
        </AuthProvider>
    );
}
