import { DocumentTitle } from '@/components/document-title';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { fieldDescribedBy, fieldErrorId, useForm } from '@/hooks/use-form';
import AuthLayout from '@/layouts/auth-layout';
import { resetPassword } from '@/lib/auth-api';
import { useNavigate, useParams, useSearchParams } from 'react-router';

export default function ResetPassword() {
    const navigate = useNavigate();
    const { token } = useParams();
    const [searchParams] = useSearchParams();
    const emailFromQuery = searchParams.get('email') ?? '';

    const form = useForm({
        email: emailFromQuery,
        password: '',
        password_confirmation: '',
    });

    return (
        <AuthLayout
            title="Reset password"
            description="Please enter your new password below"
        >
            <DocumentTitle title="Reset password" />

            <form
                onSubmit={(event) => {
                    event.preventDefault();

                    if (!token) {
                        form.setFormError(
                            'This password reset link is invalid.',
                        );

                        return;
                    }

                    void form
                        .submit(async (data) => {
                            const status = await resetPassword({
                                token,
                                email: data.email,
                                password: data.password,
                                password_confirmation:
                                    data.password_confirmation,
                            });

                            await navigate('/login', {
                                replace: true,
                                state: { status },
                            });
                        })
                        .catch(() => undefined);
                }}
                noValidate
            >
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={form.data.email}
                            className="mt-1 block w-full"
                            readOnly
                            aria-invalid={Boolean(form.errors.email)}
                            aria-describedby={fieldDescribedBy(
                                'email',
                                form.errors,
                            )}
                        />
                        <InputError
                            id={fieldErrorId('email')}
                            message={form.errors.email}
                            className="mt-2"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <PasswordInput
                            id="password"
                            name="password"
                            autoComplete="new-password"
                            className="mt-1 block w-full"
                            autoFocus
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
                            name="password_confirmation"
                            autoComplete="new-password"
                            className="mt-1 block w-full"
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
                            className="mt-2"
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
                        className="mt-4 w-full"
                        disabled={form.processing || !token}
                        data-test="reset-password-button"
                    >
                        {form.processing && <Spinner />}
                        Reset password
                    </Button>
                </div>
            </form>
        </AuthLayout>
    );
}
