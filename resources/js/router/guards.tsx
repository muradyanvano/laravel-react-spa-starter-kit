import { useAuth } from '@/auth/auth-provider';
import { getPostAuthPath, locationToPath } from '@/lib/navigation';
import { Navigate, Outlet, useLocation } from 'react-router';

/**
 * While auth is resolving, render nothing. RootLayout owns the AppLoader
 * so guards never flash a second loader or redirect prematurely.
 */
function waitForAuth(isLoading: boolean): boolean {
    return isLoading;
}

export function ProtectedRoute() {
    const { isLoading, isAuthenticated } = useAuth();
    const location = useLocation();

    if (waitForAuth(isLoading)) {
        return null;
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

    if (waitForAuth(isLoading)) {
        return null;
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
    const intended = getPostAuthPath(
        (location.state as { from?: string } | null)?.from,
        '/dashboard',
    );

    if (waitForAuth(isLoading)) {
        return null;
    }

    if (isAuthenticated) {
        if (!isVerified) {
            return <Navigate to="/verify-email" replace />;
        }

        return <Navigate to={intended} replace />;
    }

    return <Outlet />;
}
