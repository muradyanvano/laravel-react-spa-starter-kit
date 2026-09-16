import AlertError from '@/components/alert-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { normalizeApiError } from '@/lib/http';
import { locationToPath } from '@/lib/navigation';
import { navigateToConfirmPasswordIfRequired } from '@/lib/password-confirmation';
import { regenerateRecoveryCodes } from '@/lib/settings-api';
import { Eye, EyeOff, LockKeyhole, RefreshCw } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

type Props = {
    recoveryCodesList: string[];
    fetchRecoveryCodes: () => Promise<void>;
    errors: string[];
};

export default function TwoFactorRecoveryCodes({
    recoveryCodesList,
    fetchRecoveryCodes,
    errors,
}: Props) {
    const [codesAreVisible, setCodesAreVisible] = useState(false);
    const [isLoadingCodes, setIsLoadingCodes] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [regenerateError, setRegenerateError] = useState<string | null>(null);
    const codesSectionRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();
    const from = locationToPath(useLocation());
    const canRegenerateCodes = recoveryCodesList.length > 0 && codesAreVisible;

    const toggleCodesVisibility = useCallback(async () => {
        const nextVisible = !codesAreVisible;

        if (nextVisible && !recoveryCodesList.length) {
            setIsLoadingCodes(true);

            try {
                await fetchRecoveryCodes();
            } finally {
                setIsLoadingCodes(false);
            }
        }

        setCodesAreVisible(nextVisible);

        if (nextVisible) {
            setTimeout(() => {
                codesSectionRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });
            });
        }
    }, [codesAreVisible, recoveryCodesList.length, fetchRecoveryCodes]);

    const handleRegenerate = useCallback(async () => {
        setProcessing(true);
        setRegenerateError(null);

        try {
            await regenerateRecoveryCodes();
            await fetchRecoveryCodes();
            setCodesAreVisible(true);
        } catch (error) {
            if (navigateToConfirmPasswordIfRequired(error, navigate, from)) {
                return;
            }

            setRegenerateError(normalizeApiError(error).message);
        } finally {
            setProcessing(false);
        }
    }, [fetchRecoveryCodes, from, navigate]);

    const RecoveryCodeIconComponent = codesAreVisible ? EyeOff : Eye;
    const visibleErrors = regenerateError
        ? [...errors, regenerateError]
        : errors;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex gap-3">
                    <LockKeyhole className="size-4" aria-hidden="true" />
                    2FA recovery codes
                </CardTitle>
                <CardDescription>
                    Recovery codes let you regain access if you lose your 2FA
                    device. Store them in a secure password manager.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-3 select-none sm:flex-row sm:items-center sm:justify-between">
                    <Button
                        type="button"
                        onClick={() => void toggleCodesVisibility()}
                        className="w-fit"
                        aria-expanded={codesAreVisible}
                        aria-controls="recovery-codes-section"
                        disabled={isLoadingCodes}
                    >
                        <RecoveryCodeIconComponent
                            className="size-4"
                            aria-hidden="true"
                        />
                        {codesAreVisible ? 'Hide' : 'View'} recovery codes
                    </Button>

                    {canRegenerateCodes && (
                        <Button
                            variant="secondary"
                            type="button"
                            disabled={processing}
                            onClick={() => void handleRegenerate()}
                            aria-describedby="regenerate-warning"
                        >
                            <RefreshCw /> Regenerate codes
                        </Button>
                    )}
                </div>
                <div
                    id="recovery-codes-section"
                    className={`relative overflow-hidden transition-all duration-300 ${codesAreVisible ? 'h-auto opacity-100' : 'h-0 opacity-0'}`}
                    aria-hidden={!codesAreVisible}
                >
                    <div className="mt-3 space-y-3">
                        {visibleErrors.length ? (
                            <AlertError errors={visibleErrors} />
                        ) : (
                            <>
                                <div
                                    ref={codesSectionRef}
                                    className="bg-muted grid gap-1 rounded-lg p-4 font-mono text-sm"
                                    role="list"
                                    aria-label="Recovery codes"
                                >
                                    {recoveryCodesList.length ? (
                                        recoveryCodesList.map((code, index) => (
                                            <div
                                                key={index}
                                                role="listitem"
                                                className="select-text"
                                            >
                                                {code}
                                            </div>
                                        ))
                                    ) : (
                                        <div
                                            className="space-y-2"
                                            aria-label="Loading recovery codes"
                                        >
                                            {Array.from(
                                                { length: 8 },
                                                (_, index) => (
                                                    <div
                                                        key={index}
                                                        className="bg-muted-foreground/20 h-4 animate-pulse rounded"
                                                        aria-hidden="true"
                                                    />
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="text-muted-foreground text-xs select-none">
                                    <p id="regenerate-warning">
                                        Each recovery code can be used once to
                                        access your account and will be removed
                                        after use. If you need more, click{' '}
                                        <span className="font-bold">
                                            Regenerate codes
                                        </span>{' '}
                                        above.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
