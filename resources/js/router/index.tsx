import { GuestRoute, ProtectedRoute, VerifiedRoute } from '@/router/guards';
import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';

const WelcomePage = lazy(() => import('@/pages/welcome'));
const DashboardPage = lazy(() => import('@/pages/dashboard'));
const LoginPage = lazy(() => import('@/pages/auth/login'));
const RegisterPage = lazy(() => import('@/pages/auth/register'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/forgot-password'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/reset-password'));
const VerifyEmailPage = lazy(() => import('@/pages/auth/verify-email'));
const ProfileSettingsPage = lazy(() => import('@/pages/settings/profile'));
const PasswordSettingsPage = lazy(() => import('@/pages/settings/password'));
const AppearanceSettingsPage = lazy(
    () => import('@/pages/settings/appearance'),
);
const TwoFactorSettingsPage = lazy(() => import('@/pages/settings/two-factor'));
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

export const router = createBrowserRouter([
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
                        element: <Navigate to="/settings/profile" replace />,
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
                        path: 'password',
                        element: (
                            <LazyPage>
                                <PasswordSettingsPage />
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
                        path: 'two-factor',
                        element: (
                            <LazyPage>
                                <TwoFactorSettingsPage />
                            </LazyPage>
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
]);
