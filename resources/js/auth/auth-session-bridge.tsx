import { useAuth } from '@/auth/auth-provider';
import {
    configureAuthSessionHandlers,
    setAuthSessionHandlersSuppressed,
} from '@/lib/http';
import { getSafeInternalPath, locationToPath } from '@/lib/navigation';
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';

const GUEST_AUTH_PREFIXES = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/two-factor-challenge',
] as const;

function isGuestAuthPath(pathname: string): boolean {
    return GUEST_AUTH_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );
}

/**
 * Bridges Axios session-expiration 401 to AuthProvider + React Router.
 * Password-confirmation (423) is handled contextually by sensitive callers.
 */
export function AuthSessionBridge() {
    const { status, setUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const statusRef = useRef(status);
    const locationRef = useRef(location);

    statusRef.current = status;
    locationRef.current = location;

    useEffect(() => {
        configureAuthSessionHandlers({
            onUnauthenticated: () => {
                if (statusRef.current !== 'authenticated') {
                    return;
                }

                setUser(null);

                const current = locationRef.current;

                if (isGuestAuthPath(current.pathname)) {
                    return;
                }

                const intended = getSafeInternalPath(locationToPath(current));

                void navigate('/login', {
                    replace: true,
                    state: { from: intended },
                });
            },
        });

        return () => {
            configureAuthSessionHandlers({});
            setAuthSessionHandlersSuppressed(false);
        };
    }, [navigate, setUser]);

    return null;
}
