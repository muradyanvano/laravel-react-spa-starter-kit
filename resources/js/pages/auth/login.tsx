import { useAuth } from '@/auth/auth-provider';
import { DocumentTitle } from '@/components/document-title';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { fieldDescribedBy, fieldErrorId, useForm } from '@/hooks/use-form';
import AuthLayout from '@/layouts/auth-layout';
import { login as loginRequest } from '@/lib/auth-api';
import { getSafeInternalPath } from '@/lib/navigation';
import { useLocation, useNavigate } from 'react-router';

const canResetPassword = true;
const canRegister = true;

export default function Login() {
    const { refreshUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const flashStatus =
        (location.state as { status?: string } | null)?.status ?? null;

    const form = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const intended = getSafeInternalPath(
        (location.state as { from?: string } | null)?.from,
        '/dashboard',
    );

    return (
        <AuthLayout
            title="Log in to your account"
            description="Enter your email and password below to log in"
        >
            <DocumentTitle title="Log in" />

            <form
                className="flex flex-col gap-6"
                onSubmit={(event) => {
                    event.preventDefault();
                    void form
                        .submit(async (data) => {
                            await loginRequest({
                                email: data.email,
                                password: data.password,
                                remember: data.remember,
                            });

                            const user = await refreshUser();

                            if (user && user.email_verified_at === null) {
                                await navigate('/verify-email', {
                                    replace: true,
                                });

                                return;
                            }

                            await navigate(intended, { replace: true });
                        })
                        .catch(() => undefined);
                }}
                noValidate
            >
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            placeholder="email@example.com"
                            value={form.data.email}
                            onChange={(event) =>
                                form.setField('email', event.target.value)
                            }
                            aria-invalid={Boolean(form.errors.email)}
                            aria-describedby={fieldDescribedBy(
                                'email',
                                form.errors,
                            )}
                            disabled={form.processing}
                        />
                        <InputError
                            id={fieldErrorId('email')}
                            message={form.errors.email}
                        />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            {canResetPassword && (
                                <TextLink
                                    to="/forgot-password"
                                    className="ml-auto text-sm"
                                    tabIndex={5}
                                >
                                    Forgot your password?
                                </TextLink>
                            )}
                        </div>
                        <PasswordInput
                            id="password"
                            name="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            placeholder="Password"
                            value={form.data.password}
                            onChange={(event) =>
                                form.setField('password', event.target.value)
                            }
                            aria-invalid={Boolean(form.errors.password)}
                            aria-describedby={fieldDescribedBy(
                                'password',
                                form.errors,
                            )}
                            disabled={form.processing}
                        />
                        <InputError
                            id={fieldErrorId('password')}
                            message={form.errors.password}
                        />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            tabIndex={3}
                            checked={form.data.remember}
                            onCheckedChange={(checked) =>
                                form.setField('remember', checked === true)
                            }
                            disabled={form.processing}
                        />
                        <Label htmlFor="remember">Remember me</Label>
                    </div>

                    {form.formError &&
                    !form.errors.email &&
                    !form.errors.password ? (
                        <p
                            className="text-sm text-red-600 dark:text-red-400"
                            role="alert"
                        >
                            {form.formError}
                        </p>
                    ) : null}

                    <Button
                        type="submit"
                        className="mt-4 w-full"
                        tabIndex={4}
                        disabled={form.processing}
                        data-test="login-button"
                    >
                        {form.processing && <Spinner />}
                        Log in
                    </Button>
                </div>

                {canRegister ? (
                    <div className="text-muted-foreground text-center text-sm">
                        Don't have an account?{' '}
                        <TextLink to="/register" tabIndex={5}>
                            Sign up
                        </TextLink>
                    </div>
                ) : null}
            </form>

            {(flashStatus || form.status) && (
                <div
                    className="mb-4 text-center text-sm font-medium text-green-600"
                    role="status"
                    aria-live="polite"
                >
                    {flashStatus ?? form.status}
                </div>
            )}
        </AuthLayout>
    );
}
