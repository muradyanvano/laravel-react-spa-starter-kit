import { AuthSessionBridge } from '@/auth/auth-session-bridge';
import { GuestRoute, ProtectedRoute, VerifiedRoute } from '@/router/guards';
import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router';

const WelcomePage = lazy(() => import('@/pages/welcome'));
const DashboardPage = lazy(() => import('@/pages/dashboard'));
const LoginPage = lazy(() => import('@/pages/auth/login'));
const RegisterPage = lazy(() => import('@/pages/auth/register'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/forgot-password'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/reset-password'));
const VerifyEmailPage = lazy(() => import('@/pages/auth/verify-email'));
const ConfirmPasswordPage = lazy(() => import('@/pages/auth/confirm-password'));
const TwoFactorChallengePage = lazy(
    () => import('@/pages/auth/two-factor-challenge'),
);
const ProfileSettingsPage = lazy(() => import('@/pages/settings/profile'));
const SecuritySettingsPage = lazy(() => import('@/pages/settings/security'));
const AppearanceSettingsPage = lazy(
    () => import('@/pages/settings/appearance'),
);
const NotFoundPage = lazy(() => import('@/pages/not-found'));

function LazyPage({ children }: { children: ReactNode }) {
    return (
        <Suspense
            fallback={
                <div className="bg-background text-muted-foreground p-6">
                    Loading…
                </div>
            }
        >
            {children}
        </Suspense>
    );
}

function RootLayout() {
    return (
        <>
            <AuthSessionBridge />
            <Outlet />
        </>
    );
}

export const router = createBrowserRouter([
    {
        element: <RootLayout />,
        children: [
            {
                path: '/',
                element: (
                    <LazyPage>
                        <WelcomePage />
                    </LazyPage>
                ),
            },
            {
                element: <GuestRoute />,
                children: [
                    {
                        path: '/login',
                        element: (
                            <LazyPage>
                                <LoginPage />
                            </LazyPage>
                        ),
                    },
                    {
                        path: '/register',
                        element: (
                            <LazyPage>
                                <RegisterPage />
                            </LazyPage>
                        ),
                    },
                    {
                        path: '/forgot-password',
                        element: (
                            <LazyPage>
                                <ForgotPasswordPage />
                            </LazyPage>
                        ),
                    },
                    {
                        path: '/reset-password/:token',
                        element: (
                            <LazyPage>
                                <ResetPasswordPage />
                            </LazyPage>
                        ),
                    },
                    {
                        path: '/two-factor-challenge',
                        element: (
                            <LazyPage>
                                <TwoFactorChallengePage />
                            </LazyPage>
                        ),
                    },
                ],
            },
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        path: '/verify-email',
                        element: (
                            <LazyPage>
                                <VerifyEmailPage />
                            </LazyPage>
                        ),
                    },
                    {
                        path: '/confirm-password',
                        element: (
                            <LazyPage>
                                <ConfirmPasswordPage />
                            </LazyPage>
                        ),
                    },
                ],
            },
            {
                element: <VerifiedRoute />,
                children: [
                    {
                        path: '/dashboard',
                        element: (
                            <LazyPage>
                                <DashboardPage />
                            </LazyPage>
                        ),
                    },
                    {
                        path: '/settings',
                        children: [
                            {
                                index: true,
                                element: (
                                    <Navigate to="/settings/profile" replace />
                                ),
                            },
                            {
                                path: 'profile',
                                element: (
                                    <LazyPage>
                                        <ProfileSettingsPage />
                                    </LazyPage>
                                ),
                            },
                            {
                                path: 'security',
                                element: (
                                    <LazyPage>
                                        <SecuritySettingsPage />
                                    </LazyPage>
                                ),
                            },
                            {
                                path: 'appearance',
                                element: (
                                    <LazyPage>
                                        <AppearanceSettingsPage />
                                    </LazyPage>
                                ),
                            },
                            {
                                path: 'password',
                                element: (
                                    <Navigate to="/settings/security" replace />
                                ),
                            },
                            {
                                path: 'two-factor',
                                element: (
                                    <Navigate to="/settings/security" replace />
                                ),
                            },
                        ],
                    },
                ],
            },
            {
                path: '*',
                element: (
                    <LazyPage>
                        <NotFoundPage />
                    </LazyPage>
                ),
            },
        ],
    },
]);
