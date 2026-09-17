import AlertError from '@/components/alert-error';
import { DocumentTitle } from '@/components/document-title';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import ManagePasskeys from '@/components/manage-passkeys';
import ManageTwoFactor from '@/components/manage-two-factor';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { fieldDescribedBy, fieldErrorId, useForm } from '@/hooks/use-form';
import { SettingsLayout } from '@/layouts/settings-layout';
import { isRequestAborted, normalizeApiError } from '@/lib/http';
import { locationToPath } from '@/lib/navigation';
import {
    fetchPasswordConfirmationStatus,
    fetchSecuritySettings,
    updatePassword,
    type SecuritySettings,
} from '@/lib/settings-api';
import type { BreadcrumbItem } from '@/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Security settings',
        href: '/settings/security',
    },
];

function SecurityContentSkeleton() {
    return (
        <div
            className="space-y-8"
            aria-busy="true"
            aria-label="Loading security settings"
            data-testid="security-skeleton"
        >
            <div className="space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-72 max-w-full" />
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-9 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-9 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-9 w-full" />
                    </div>
                    <Skeleton className="h-9 w-20" />
                </div>
            </div>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-52" />
                    <Skeleton className="h-4 w-full max-w-md" />
                </div>
                <Skeleton className="h-9 w-28" />
            </div>
        </div>
    );
}

export default function Security() {
    const navigate = useNavigate();
    const location = useLocation();
    const intendedPathRef = useRef(locationToPath(location));
    intendedPathRef.current = locationToPath(location);
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const [settings, setSettings] = useState<SecuritySettings | null>(null);
    const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>(
        'loading',
    );
    const [loadError, setLoadError] = useState<string | null>(null);

    const form = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const loadSettings = useCallback(async (): Promise<void> => {
        setSettings(await fetchSecuritySettings());
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        let active = true;

        const load = async (): Promise<void> => {
            try {
                const { confirmed } = await fetchPasswordConfirmationStatus({
                    signal: controller.signal,
                });

                if (!active) {
                    return;
                }

                if (!confirmed) {
                    await navigate('/confirm-password', {
                        replace: true,
                        state: { from: intendedPathRef.current },
                    });

                    return;
                }

                const nextSettings = await fetchSecuritySettings({
                    signal: controller.signal,
                });

                if (!active) {
                    return;
                }

                setSettings(nextSettings);
                setPhase('ready');
            } catch (error) {
                if (!active || isRequestAborted(error)) {
                    return;
                }

                setLoadError(normalizeApiError(error).message);
                setPhase('error');
            }
        };

        void load();

        return () => {
            active = false;
            controller.abort();
        };
    }, [navigate]);

    return (
        <SettingsLayout breadcrumbs={breadcrumbs}>
            <DocumentTitle title="Security settings" />

            <h1 className="sr-only">Security settings</h1>

            {phase === 'loading' ? <SecurityContentSkeleton /> : null}

            {phase === 'error' && loadError ? (
                <AlertError errors={[loadError]} />
            ) : null}

            {phase === 'ready' && settings ? (
                <>
                    <div className="space-y-6">
                        <Heading
                            variant="small"
                            title="Update password"
                            description="Ensure your account is using a long, random password to stay secure"
                        />

                        <form
                            className="space-y-6"
                            noValidate
                            onSubmit={(event) => {
                                event.preventDefault();
                                void form
                                    .submit(async (data) => {
                                        await updatePassword(data);
                                        form.reset();

                                        return 'Password updated.';
                                    })
                                    .catch((error: unknown) => {
                                        const { errors } =
                                            normalizeApiError(error);

                                        if (errors.password) {
                                            form.reset(
                                                'password',
                                                'password_confirmation',
                                            );
                                            passwordInput.current?.focus();
                                        }

                                        if (errors.current_password) {
                                            form.reset('current_password');
                                            currentPasswordInput.current?.focus();
                                        }
                                    });
                            }}
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="current_password">
                                    Current password
                                </Label>

                                <PasswordInput
                                    id="current_password"
                                    ref={currentPasswordInput}
                                    name="current_password"
                                    className="block w-full"
                                    autoComplete="current-password"
                                    placeholder="Current password"
                                    value={form.data.current_password}
                                    onChange={(event) =>
                                        form.setField(
                                            'current_password',
                                            event.target.value,
                                        )
                                    }
                                    aria-invalid={Boolean(
                                        form.errors.current_password,
                                    )}
                                    aria-describedby={fieldDescribedBy(
                                        'current_password',
                                        form.errors,
                                    )}
                                    disabled={form.processing}
                                />

                                <InputError
                                    id={fieldErrorId('current_password')}
                                    message={form.errors.current_password}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">New password</Label>

                                <PasswordInput
                                    id="password"
                                    ref={passwordInput}
                                    name="password"
                                    className="block w-full"
                                    autoComplete="new-password"
                                    placeholder="New password"
                                    passwordrules={settings.passwordRules}
                                    value={form.data.password}
                                    onChange={(event) =>
                                        form.setField(
                                            'password',
                                            event.target.value,
                                        )
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
                                    className="block w-full"
                                    autoComplete="new-password"
                                    placeholder="Confirm password"
                                    passwordrules={settings.passwordRules}
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

                            {form.formError &&
                            !form.errors.current_password &&
                            !form.errors.password &&
                            !form.errors.password_confirmation ? (
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
                                    data-test="update-password-button"
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

                    <ManageTwoFactor
                        canManageTwoFactor={settings.canManageTwoFactor}
                        requiresConfirmation={settings.requiresConfirmation}
                        twoFactorEnabled={settings.twoFactorEnabled}
                        onUpdated={loadSettings}
                    />

                    <ManagePasskeys
                        canManagePasskeys={settings.canManagePasskeys}
                    />
                </>
            ) : null}
        </SettingsLayout>
    );
}
