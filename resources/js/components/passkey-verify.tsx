import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import {
    mapPasskeyErrorMessage,
    preparePasskeyCeremony,
    type PasskeyCeremonyRoutes,
} from '@/lib/passkeys';
import { usePasskeyVerify } from '@laravel/passkeys/react';
import { KeyRound } from 'lucide-react';
import { useCallback } from 'react';

type Props = {
    routes?: PasskeyCeremonyRoutes;
    label?: string;
    loadingLabel?: string;
    separator?: string;
    onSuccess?: () => void | Promise<void>;
};

export default function PasskeyVerify({
    routes,
    label,
    loadingLabel,
    separator,
    onSuccess,
}: Props = {}) {
    const { verify, isLoading, error, errorInstance, isSupported } =
        usePasskeyVerify({
            ...(routes && { routes }),
            onSuccess: () => {
                void onSuccess?.();
            },
        });

    const handleVerify = useCallback(async () => {
        await preparePasskeyCeremony();
        await verify();
    }, [verify]);

    if (!isSupported) {
        return null;
    }

    const visibleError = mapPasskeyErrorMessage(errorInstance ?? error);

    return (
        <>
            <div className="grid gap-2">
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                        void handleVerify();
                    }}
                    disabled={isLoading}
                    data-testid="passkey-verify-button"
                >
                    {isLoading ? <Spinner /> : <KeyRound className="h-4 w-4" />}
                    {isLoading
                        ? (loadingLabel ?? 'Authenticating...')
                        : (label ?? 'Sign in with a passkey')}
                </Button>
                {visibleError ? (
                    <InputError
                        message={visibleError}
                        className="text-center"
                    />
                ) : null}
            </div>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background text-muted-foreground px-2">
                        {separator ?? 'Or continue with email'}
                    </span>
                </div>
            </div>
        </>
    );
}
