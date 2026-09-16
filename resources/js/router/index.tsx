import { AuthSessionBridge } from '@/auth/auth-session-bridge';
import { useAuth } from '@/auth/auth-provider';
import { AppLoader } from '@/components/app-loader';
import ConfirmPasswordPage from '@/pages/auth/confirm-password';
import ForgotPasswordPage from '@/pages/auth/forgot-password';
import LoginPage from '@/pages/auth/login';
import RegisterPage from '@/pages/auth/register';
import ResetPasswordPage from '@/pages/auth/reset-password';
import TwoFactorChallengePage from '@/pages/auth/two-factor-challenge';
import VerifyEmailPage from '@/pages/auth/verify-email';
import DashboardPage from '@/pages/dashboard';
import NotFoundPage from '@/pages/not-found';
import AppearanceSettingsPage from '@/pages/settings/appearance';
import ProfileSettingsPage from '@/pages/settings/profile';
import SecuritySettingsPage from '@/pages/settings/security';
import WelcomePage from '@/pages/welcome';
import { GuestRoute, ProtectedRoute, VerifiedRoute } from '@/router/guards';
import { createBrowserRouter, Navigate, Outlet } from 'react-router';

function RootLayout() {
    const { isLoading } = useAuth();

    if (isLoading) {
        return <AppLoader />;
    }

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
                element: <WelcomePage />,
            },
            {
                element: <GuestRoute />,
                children: [
                    {
                        path: '/login',
                        element: <LoginPage />,
                    },
                    {
                        path: '/register',
                        element: <RegisterPage />,
                    },
                    {
                        path: '/forgot-password',
                        element: <ForgotPasswordPage />,
                    },
                    {
                        path: '/reset-password/:token',
                        element: <ResetPasswordPage />,
                    },
                    {
                        path: '/two-factor-challenge',
                        element: <TwoFactorChallengePage />,
                    },
                ],
            },
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        path: '/verify-email',
                        element: <VerifyEmailPage />,
                    },
                    {
                        path: '/confirm-password',
                        element: <ConfirmPasswordPage />,
                    },
                ],
            },
            {
                element: <VerifiedRoute />,
                children: [
                    {
                        path: '/dashboard',
                        element: <DashboardPage />,
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
                                element: <ProfileSettingsPage />,
                            },
                            {
                                path: 'security',
                                element: <SecuritySettingsPage />,
                            },
                            {
                                path: 'appearance',
                                element: <AppearanceSettingsPage />,
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
                element: <NotFoundPage />,
            },
        ],
    },
]);
