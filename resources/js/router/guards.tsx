import { useAuth } from '@/auth/auth-provider';
import { Navigate, Outlet, useLocation } from 'react-router';

function AuthLoadingScreen() {
    return (
        <div
            className="flex min-h-screen items-center justify-center bg-[#FDFDFC] text-[#706f6c] dark:bg-[#0a0a0a] dark:text-[#A1A09A]"
            role="status"
            aria-live="polite"
        >
            <span className="text-sm">Loading…</span>
        </div>
    );
}

export function ProtectedRoute() {
    const { isLoading, isAuthenticated } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <AuthLoadingScreen />;
    }

    if (!isAuthenticated) {
        return (
            <Navigate to="/login" replace state={{ from: location.pathname }} />
        );
    }

    return <Outlet />;
}

export function GuestRoute() {
    const { isLoading, isAuthenticated } = useAuth();
    const location = useLocation();
    const redirectTo =
        (location.state as { from?: string } | null)?.from ?? '/dashboard';

    if (isLoading) {
        return <AuthLoadingScreen />;
    }

    if (isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    return <Outlet />;
}
