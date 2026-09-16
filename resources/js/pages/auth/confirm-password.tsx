import { DocumentTitle } from '@/components/document-title';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { fieldDescribedBy, fieldErrorId, useForm } from '@/hooks/use-form';
import AuthLayout from '@/layouts/auth-layout';
import { getSafeInternalPath } from '@/lib/navigation';
import { confirmPassword } from '@/lib/settings-api';
import { useLocation, useNavigate } from 'react-router';

export default function ConfirmPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const form = useForm({ password: '' });

    const intended = getSafeInternalPath(
        (location.state as { from?: string } | null)?.from ??
            new URLSearchParams(location.search).get('intended'),
        '/settings/security',
    );

    return (
        <AuthLayout
            title="Confirm your password"
            description="This is a secure area of the application. Please confirm your password before continuing."
        >
            <DocumentTitle title="Confirm password" />

            <form
                noValidate
                onSubmit={(event) => {
                    event.preventDefault();
                    void form
                        .submit(async (data) => {
                            await confirmPassword({ password: data.password });
                            await navigate(intended, { replace: true });
                        })
                        .catch(() => {
                            form.setField('password', '');
                        });
                }}
            >
                <div className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <PasswordInput
                            id="password"
                            name="password"
                            placeholder="Password"
                            autoComplete="current-password"
                            autoFocus
                            required
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
                            message={
                                form.errors.password ??
                                form.formError ??
                                undefined
                            }
                        />
                    </div>

                    <div className="flex items-center">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={form.processing}
                            data-test="confirm-password-button"
                        >
                            {form.processing && <Spinner />}
                            Confirm password
                        </Button>
                    </div>
                </div>
            </form>
        </AuthLayout>
    );
}
