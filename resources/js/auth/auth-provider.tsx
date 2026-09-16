import { setAuthSessionHandlersSuppressed } from '@/lib/http';
import { fetchCurrentUser, logout as logoutRequest } from '@/lib/auth-api';
import type { User } from '@/types/auth';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
    user: User | null;
    status: AuthStatus;
    isAuthenticated: boolean;
    isLoading: boolean;
    isVerified: boolean;
    refreshUser: () => Promise<User | null>;
    setUser: (user: User | null) => void;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUserState] = useState<User | null>(null);
    const [status, setStatus] = useState<AuthStatus>('loading');

    const setUser = useCallback((nextUser: User | null) => {
        setUserState(nextUser);
        setStatus(nextUser ? 'authenticated' : 'unauthenticated');
    }, []);

    const refreshUser = useCallback(async (): Promise<User | null> => {
        try {
            const nextUser = await fetchCurrentUser();
            setUser(nextUser);

            return nextUser;
        } catch {
            setUser(null);

            return null;
        }
    }, [setUser]);

    const logout = useCallback(async (): Promise<void> => {
        try {
            await logoutRequest();
        } finally {
            setUser(null);
        }
    }, [setUser]);

    useEffect(() => {
        let cancelled = false;

        setAuthSessionHandlersSuppressed(true);

        void refreshUser().finally(() => {
            if (!cancelled) {
                setAuthSessionHandlersSuppressed(false);
            }
        });

        return () => {
            cancelled = true;
            setAuthSessionHandlersSuppressed(false);
        };
    }, [refreshUser]);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            status,
            isAuthenticated: status === 'authenticated',
            isLoading: status === 'loading',
            isVerified: user?.email_verified_at !== null && user !== null,
            refreshUser,
            setUser,
            logout,
        }),
        [user, status, refreshUser, setUser, logout],
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}
