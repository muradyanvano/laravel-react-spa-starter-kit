import { AuthProvider } from '@/auth/auth-provider';
import { initializeTheme } from '@/hooks/use-appearance';
import { router } from '@/router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';

initializeTheme();

const rootElement = document.getElementById('app');

if (!rootElement) {
    throw new Error('Root element #app not found');
}

createRoot(rootElement).render(
    <StrictMode>
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    </StrictMode>,
);
