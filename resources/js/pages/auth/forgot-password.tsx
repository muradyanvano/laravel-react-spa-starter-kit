import { DocumentTitle } from '@/components/document-title';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { fieldDescribedBy, fieldErrorId, useForm } from '@/hooks/use-form';
import AuthLayout from '@/layouts/auth-layout';
import { requestPasswordReset } from '@/lib/auth-api';

export default function ForgotPassword() {
    const form = useForm({
        email: '',
    });

    return (
        <AuthLayout
            title="Forgot password"
            description="Enter your email to receive a password reset link"
        >
            <DocumentTitle title="Forgot password" />

            {form.status && (
                <div
                    className="mb-4 text-center text-sm font-medium text-green-600"
                    role="status"
                    aria-live="polite"
                >
                    {form.status}
                </div>
            )}

            <div className="space-y-6">
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        void form
                            .submit(async (data) =>
                                requestPasswordReset(data.email),
                            )
                            .catch(() => undefined);
                    }}
                    noValidate
                >
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="off"
                            autoFocus
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

                    {form.formError && !form.errors.email ? (
                        <p
                            className="mt-2 text-sm text-red-600 dark:text-red-400"
                            role="alert"
                        >
                            {form.formError}
                        </p>
                    ) : null}

                    <div className="my-6 flex items-center justify-start">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={form.processing}
                            data-test="email-password-reset-link-button"
                        >
                            {form.processing && <Spinner />}
                            Email password reset link
                        </Button>
                    </div>
                </form>

                <div className="text-muted-foreground space-x-1 text-center text-sm">
                    <span>Or, return to</span>
                    <TextLink to="/login">log in</TextLink>
                </div>
            </div>
        </AuthLayout>
    );
}
