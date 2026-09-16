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
    refreshUser: () => Promise<User | null>;
    setUser: (user: User | null) => void;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [status, setStatus] = useState<AuthStatus>('loading');

    const refreshUser = useCallback(async (): Promise<User | null> => {
        try {
            const nextUser = await fetchCurrentUser();
            setUser(nextUser);
            setStatus(nextUser ? 'authenticated' : 'unauthenticated');

            return nextUser;
        } catch {
            setUser(null);
            setStatus('unauthenticated');

            return null;
        }
    }, []);

    const logout = useCallback(async (): Promise<void> => {
        try {
            await logoutRequest();
        } finally {
            setUser(null);
            setStatus('unauthenticated');
        }
    }, []);

    useEffect(() => {
        void refreshUser();
    }, [refreshUser]);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            status,
            isAuthenticated: status === 'authenticated',
            isLoading: status === 'loading',
            refreshUser,
            setUser: (nextUser) => {
                setUser(nextUser);
                setStatus(nextUser ? 'authenticated' : 'unauthenticated');
            },
            logout,
        }),
        [user, status, refreshUser, logout],
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
