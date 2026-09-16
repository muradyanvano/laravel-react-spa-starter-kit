import { useAuth } from '@/auth/auth-provider';
import DeleteUser from '@/components/delete-user';
import { DocumentTitle } from '@/components/document-title';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fieldDescribedBy, fieldErrorId, useForm } from '@/hooks/use-form';
import { SettingsLayout } from '@/layouts/settings-layout';
import { resendVerificationEmail } from '@/lib/auth-api';
import { updateProfile } from '@/lib/settings-api';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

export default function Profile() {
    const { user, refreshUser } = useAuth();
    const [verificationStatus, setVerificationStatus] = useState<string | null>(
        null,
    );
    const form = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
    });

    return (
        <SettingsLayout breadcrumbs={breadcrumbs}>
            <DocumentTitle title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Profile"
                    description="Update your name and email address"
                />

                <form
                    className="space-y-6"
                    noValidate
                    onSubmit={(event) => {
                        event.preventDefault();
                        void form
                            .submit(async (data) => {
                                await updateProfile(data);
                                await refreshUser();

                                return 'Profile updated.';
                            })
                            .catch(() => undefined);
                    }}
                >
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>

                        <Input
                            id="name"
                            name="name"
                            className="block w-full"
                            required
                            autoComplete="name"
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
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>

                        <Input
                            id="email"
                            type="email"
                            name="email"
                            className="block w-full"
                            required
                            autoComplete="username"
                            placeholder="Email address"
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

                    {user && user.email_verified_at === null && (
                        <div>
                            <p className="text-muted-foreground -mt-4 text-sm">
                                Your email address is unverified.{' '}
                                <button
                                    type="button"
                                    className="text-foreground cursor-pointer underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    onClick={() => {
                                        void resendVerificationEmail()
                                            .then(setVerificationStatus)
                                            .catch(() => undefined);
                                    }}
                                >
                                    Click here to re-send the verification
                                    email.
                                </button>
                            </p>

                            {verificationStatus ===
                                'verification-link-sent' && (
                                <div className="mt-2 text-sm font-medium text-green-600">
                                    A new verification link has been sent to
                                    your email address.
                                </div>
                            )}
                        </div>
                    )}

                    {form.formError &&
                    !form.errors.name &&
                    !form.errors.email ? (
                        <p
                            className="text-sm text-red-600 dark:text-red-400"
                            role="alert"
                        >
                            {form.formError}
                        </p>
                    ) : null}

                    <div className="flex items-center gap-4">
                        <Button
                            type="submit"
                            disabled={form.processing}
                            data-test="update-profile-button"
                        >
                            Save
                        </Button>

                        {form.status && (
                            <p
                                className="text-sm text-neutral-600 dark:text-neutral-400"
                                role="status"
                                aria-live="polite"
                            >
                                {form.status}
                            </p>
                        )}
                    </div>
                </form>
            </div>

            <DeleteUser />
        </SettingsLayout>
    );
}
