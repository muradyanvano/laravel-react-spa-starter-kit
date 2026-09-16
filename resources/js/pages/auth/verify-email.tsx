import { useAuth } from '@/auth/auth-provider';
import { DocumentTitle } from '@/components/document-title';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useForm } from '@/hooks/use-form';
import AuthLayout from '@/layouts/auth-layout';
import { resendVerificationEmail } from '@/lib/auth-api';
import { Navigate, useNavigate } from 'react-router';
import { useState } from 'react';

export default function VerifyEmail() {
    const { logout, user, isVerified } = useAuth();
    const navigate = useNavigate();
    const [status, setStatus] = useState<string | null>(null);
    const form = useForm({});
    const [loggingOut, setLoggingOut] = useState(false);

    if (isVerified) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <AuthLayout
            title="Email verification"
            description="Please verify your email address by clicking on the link we just emailed to you."
        >
            <DocumentTitle title="Email verification" />

            {status === 'verification-link-sent' && (
                <div
                    className="mb-4 text-center text-sm font-medium text-green-600"
                    role="status"
                    aria-live="polite"
                >
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            {user?.email ? (
                <p className="text-muted-foreground mb-4 text-center text-sm">
                    {user.email}
                </p>
            ) : null}

            <div className="space-y-6 text-center">
                <Button
                    type="button"
                    disabled={form.processing}
                    variant="secondary"
                    onClick={() => {
                        void form
                            .submit(async () => {
                                await resendVerificationEmail();
                                setStatus('verification-link-sent');
                            })
                            .catch(() => undefined);
                    }}
                >
                    {form.processing && <Spinner />}
                    Resend verification email
                </Button>

                {form.formError ? (
                    <p
                        className="text-sm text-red-600 dark:text-red-400"
                        role="alert"
                    >
                        {form.formError}
                    </p>
                ) : null}

                <button
                    type="button"
                    className="text-foreground mx-auto block text-sm underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                    disabled={loggingOut}
                    onClick={() => {
                        setLoggingOut(true);
                        void logout()
                            .then(async () => {
                                await navigate('/login', { replace: true });
                            })
                            .finally(() => {
                                setLoggingOut(false);
                            });
                    }}
                >
                    {loggingOut ? 'Logging out…' : 'Log out'}
                </button>
            </div>
        </AuthLayout>
    );
}
