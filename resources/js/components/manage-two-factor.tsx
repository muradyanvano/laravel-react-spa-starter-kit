import AlertError from '@/components/alert-error';
import Heading from '@/components/heading';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Button } from '@/components/ui/button';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { normalizeApiError } from '@/lib/http';
import { locationToPath } from '@/lib/navigation';
import { navigateToConfirmPasswordIfRequired } from '@/lib/password-confirmation';
import { disableTwoFactor, enableTwoFactor } from '@/lib/settings-api';
import { ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

export type Props = {
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
    onUpdated?: () => Promise<void>;
};

export default function ManageTwoFactor({
    canManageTwoFactor = false,
    requiresConfirmation = false,
    twoFactorEnabled = false,
    onUpdated,
}: Props) {
    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        clearTwoFactorAuthData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const navigate = useNavigate();
    const from = locationToPath(useLocation());
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const prevTwoFactorEnabled = useRef(twoFactorEnabled);

    useEffect(() => {
        if (prevTwoFactorEnabled.current && !twoFactorEnabled) {
            clearTwoFactorAuthData();
        }

        prevTwoFactorEnabled.current = twoFactorEnabled;
    }, [twoFactorEnabled, clearTwoFactorAuthData]);

    if (!canManageTwoFactor) {
        return null;
    }

    const runAction = async (action: () => Promise<void>): Promise<boolean> => {
        setProcessing(true);
        setActionError(null);

        try {
            await action();
            await onUpdated?.();

            return true;
        } catch (error) {
            if (navigateToConfirmPasswordIfRequired(error, navigate, from)) {
                return false;
            }

            setActionError(normalizeApiError(error).message);

            return false;
        } finally {
            setProcessing(false);
        }
    };

    const handleEnable = async (): Promise<void> => {
        if (await runAction(enableTwoFactor)) {
            setShowSetupModal(true);
        }
    };

    const handleDisable = async (): Promise<void> => {
        await runAction(disableTwoFactor);
    };

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title="Two-factor authentication"
                description="Manage your two-factor authentication settings"
            />

            {actionError && <AlertError errors={[actionError]} />}

            {twoFactorEnabled ? (
                <div className="flex flex-col items-start justify-start space-y-4">
                    <p className="text-muted-foreground text-sm">
                        You will be prompted for a secure, random pin during
                        login, which you can retrieve from the TOTP-supported
                        application on your phone.
                    </p>

                    <div className="relative inline">
                        <Button
                            variant="destructive"
                            type="button"
                            disabled={processing}
                            onClick={() => void handleDisable()}
                        >
                            Disable 2FA
                        </Button>
                    </div>

                    <TwoFactorRecoveryCodes
                        recoveryCodesList={recoveryCodesList}
                        fetchRecoveryCodes={fetchRecoveryCodes}
                        errors={errors}
                    />
                </div>
            ) : (
                <div className="flex flex-col items-start justify-start space-y-4">
                    <p className="text-muted-foreground text-sm">
                        When you enable two-factor authentication, you will be
                        prompted for a secure pin during login. This pin can be
                        retrieved from a TOTP-supported application on your
                        phone.
                    </p>

                    <div>
                        {hasSetupData ? (
                            <Button
                                type="button"
                                onClick={() => setShowSetupModal(true)}
                            >
                                <ShieldCheck />
                                Continue setup
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                disabled={processing}
                                onClick={() => void handleEnable()}
                            >
                                Enable 2FA
                            </Button>
                        )}
                    </div>
                </div>
            )}

            <TwoFactorSetupModal
                isOpen={showSetupModal}
                onClose={() => setShowSetupModal(false)}
                onConfirmed={onUpdated}
                requiresConfirmation={requiresConfirmation}
                twoFactorEnabled={twoFactorEnabled}
                qrCodeSvg={qrCodeSvg}
                manualSetupKey={manualSetupKey}
                clearSetupData={clearSetupData}
                fetchSetupData={fetchSetupData}
                errors={errors}
            />
        </div>
    );
}
