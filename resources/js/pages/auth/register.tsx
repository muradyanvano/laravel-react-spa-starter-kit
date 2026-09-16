import { useAuth } from '@/auth/auth-provider';
import { DocumentTitle } from '@/components/document-title';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { fieldDescribedBy, fieldErrorId, useForm } from '@/hooks/use-form';
import AuthLayout from '@/layouts/auth-layout';
import { register as registerRequest } from '@/lib/auth-api';
import { useNavigate } from 'react-router';

export default function Register() {
    const { refreshUser } = useAuth();
    const navigate = useNavigate();

    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    return (
        <AuthLayout
            title="Create an account"
            description="Enter your details below to create your account"
        >
            <DocumentTitle title="Register" />

            <form
                className="flex flex-col gap-6"
                onSubmit={(event) => {
                    event.preventDefault();
                    void form
                        .submit(async (data) => {
                            await registerRequest(data);
                            const user = await refreshUser();

                            if (user && user.email_verified_at === null) {
                                await navigate('/verify-email', {
                                    replace: true,
                                });

                                return;
                            }

                            await navigate('/dashboard', { replace: true });
                        })
                        .catch(() => undefined);
                }}
                noValidate
            >
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            name="name"
                            placeholder="Full name"
                            value={form.data.name}
                            onChange={(event) =>
                                form.setField('name', event.target.value)
                            }
                            aria-invalid={Boolean(form.errors.name)}
                            aria-describedby={fieldDescribedBy(
                                'name',
                                form.errors,
                            )}
                            disabled={form.processing}
                        />
                        <InputError
                            id={fieldErrorId('name')}
                            message={form.errors.name}
                            className="mt-2"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            name="email"
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
                        <Label htmlFor="password">Password</Label>
                        <PasswordInput
                            id="password"
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            name="password"
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

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">
                            Confirm password
                        </Label>
                        <PasswordInput
                            id="password_confirmation"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            name="password_confirmation"
                            placeholder="Confirm password"
                            value={form.data.password_confirmation}
                            onChange={(event) =>
                                form.setField(
                                    'password_confirmation',
                                    event.target.value,
                                )
                            }
                            aria-invalid={Boolean(
                                form.errors.password_confirmation,
                            )}
                            aria-describedby={fieldDescribedBy(
                                'password_confirmation',
                                form.errors,
                            )}
                            disabled={form.processing}
                        />
                        <InputError
                            id={fieldErrorId('password_confirmation')}
                            message={form.errors.password_confirmation}
                        />
                    </div>

                    {form.formError && Object.keys(form.errors).length === 0 ? (
                        <p
                            className="text-sm text-red-600 dark:text-red-400"
                            role="alert"
                        >
                            {form.formError}
                        </p>
                    ) : null}

                    <Button
                        type="submit"
                        className="mt-2 w-full"
                        tabIndex={5}
                        disabled={form.processing}
                        data-test="register-user-button"
                    >
                        {form.processing && <Spinner />}
                        Create account
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    Already have an account?{' '}
                    <TextLink to="/login" tabIndex={6}>
                        Log in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
