import { useAuth } from '@/auth/auth-provider';
import { DocumentTitle } from '@/components/document-title';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { fieldDescribedBy, fieldErrorId, useForm } from '@/hooks/use-form';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import AuthLayout from '@/layouts/auth-layout';
import { getPostAuthPath } from '@/lib/navigation';
import { submitTwoFactorChallenge } from '@/lib/settings-api';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

export default function TwoFactorChallenge() {
    const { refreshUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showRecoveryInput, setShowRecoveryInput] = useState(false);
    const form = useForm({ code: '', recovery_code: '' });

    const intended = getPostAuthPath(
        (location.state as { from?: string } | null)?.from,
        '/dashboard',
    );

    const authConfigContent = useMemo<{
        title: string;
        description: string;
        toggleText: string;
    }>(() => {
        if (showRecoveryInput) {
            return {
                title: 'Recovery code',
                description:
                    'Please confirm access to your account by entering one of your emergency recovery codes.',
                toggleText: 'login using an authentication code',
            };
        }

        return {
            title: 'Authentication code',
            description:
                'Enter the authentication code provided by your authenticator application.',
            toggleText: 'login using a recovery code',
        };
    }, [showRecoveryInput]);

    const toggleRecoveryMode = (): void => {
        setShowRecoveryInput(!showRecoveryInput);
        form.clearErrors();
        form.reset();
    };

    return (
        <AuthLayout
            title={authConfigContent.title}
            description={authConfigContent.description}
        >
            <DocumentTitle title="Two-factor authentication" />

            <div className="space-y-6">
                <form
                    className="space-y-4"
                    noValidate
                    onSubmit={(event) => {
                        event.preventDefault();
                        void form
                            .submit(async (data) => {
                                await submitTwoFactorChallenge(
                                    showRecoveryInput
                                        ? { recovery_code: data.recovery_code }
                                        : { code: data.code },
                                );

                                const user = await refreshUser();

                                if (user && user.email_verified_at === null) {
                                    await navigate('/verify-email', {
                                        replace: true,
                                    });

                                    return;
                                }

                                await navigate(intended, { replace: true });
                            })
                            .catch(() => {
                                form.reset('code');
                            });
                    }}
                >
                    {showRecoveryInput ? (
                        <>
                            <Input
                                name="recovery_code"
                                type="text"
                                placeholder="Enter recovery code"
                                autoFocus
                                required
                                value={form.data.recovery_code}
                                onChange={(event) =>
                                    form.setField(
                                        'recovery_code',
                                        event.target.value,
                                    )
                                }
                                aria-invalid={Boolean(
                                    form.errors.recovery_code,
                                )}
                                aria-describedby={fieldDescribedBy(
                                    'recovery_code',
                                    form.errors,
                                )}
                                disabled={form.processing}
                            />
                            <InputError
                                id={fieldErrorId('recovery_code')}
                                message={
                                    form.errors.recovery_code ??
                                    form.formError ??
                                    undefined
                                }
                            />
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center space-y-3 text-center">
                            <div className="flex w-full items-center justify-center">
                                <InputOTP
                                    name="code"
                                    maxLength={OTP_MAX_LENGTH}
                                    value={form.data.code}
                                    onChange={(value) =>
                                        form.setField('code', value)
                                    }
                                    disabled={form.processing}
                                    pattern={REGEXP_ONLY_DIGITS}
                                    autoFocus
                                >
                                    <InputOTPGroup>
                                        {Array.from(
                                            { length: OTP_MAX_LENGTH },
                                            (_, index) => (
                                                <InputOTPSlot
                                                    key={index}
                                                    index={index}
                                                />
                                            ),
                                        )}
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>
                            <InputError
                                id={fieldErrorId('code')}
                                message={
                                    form.errors.code ??
                                    form.formError ??
                                    undefined
                                }
                            />
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={form.processing}
                    >
                        Continue
                    </Button>

                    <div className="text-muted-foreground text-center text-sm">
                        <span>or you can </span>
                        <button
                            type="button"
                            className="text-foreground cursor-pointer underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                            onClick={toggleRecoveryMode}
                        >
                            {authConfigContent.toggleText}
                        </button>
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
}
