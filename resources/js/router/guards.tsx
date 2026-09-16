import { useAuth } from '@/auth/auth-provider';
import { getSafeInternalPath, locationToPath } from '@/lib/navigation';
import { Navigate, Outlet, useLocation } from 'react-router';

function AuthLoadingScreen() {
    return (
        <div
            className="bg-background text-muted-foreground flex min-h-svh items-center justify-center"
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
            <Navigate
                to="/login"
                replace
                state={{ from: locationToPath(location) }}
            />
        );
    }

    return <Outlet />;
}

export function VerifiedRoute() {
    const { isLoading, isAuthenticated, isVerified } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <AuthLoadingScreen />;
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: locationToPath(location) }}
            />
        );
    }

    if (!isVerified) {
        return <Navigate to="/verify-email" replace />;
    }

    return <Outlet />;
}

export function GuestRoute() {
    const { isLoading, isAuthenticated, isVerified } = useAuth();
    const location = useLocation();
    const intended = getSafeInternalPath(
        (location.state as { from?: string } | null)?.from,
        '/dashboard',
    );

    if (isLoading) {
        return <AuthLoadingScreen />;
    }

    if (isAuthenticated) {
        if (!isVerified) {
            return <Navigate to="/verify-email" replace />;
        }

        return <Navigate to={intended} replace />;
    }

    return <Outlet />;
}
