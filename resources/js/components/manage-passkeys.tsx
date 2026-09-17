import AlertError from '@/components/alert-error';
import Heading from '@/components/heading';
import PasskeyItem from '@/components/passkey-item';
import PasskeyRegister from '@/components/passkey-register';
import { Skeleton } from '@/components/ui/skeleton';
import { isRequestAborted, normalizeApiError } from '@/lib/http';
import { locationToPath } from '@/lib/navigation';
import { navigateToConfirmPasswordIfRequired } from '@/lib/password-confirmation';
import { deletePasskey, fetchPasskeys } from '@/lib/settings-api';
import type { Passkey } from '@/types/auth';
import { KeyRound } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

export type Props = {
    canManagePasskeys?: boolean;
};

function EmptyState() {
    return (
        <div className="p-8 text-center">
            <div className="bg-muted mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
                <KeyRound
                    className="text-muted-foreground h-7 w-7"
                    aria-hidden="true"
                />
            </div>
            <p className="font-medium">No passkeys yet</p>
            <p className="text-muted-foreground mt-1 text-sm">
                Add a passkey to sign in without a password
            </p>
        </div>
    );
}

function PasskeyListSkeleton() {
    return (
        <div
            className="space-y-0"
            aria-busy="true"
            aria-label="Loading passkeys"
            data-testid="passkeys-loading"
        >
            <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-48" />
                    </div>
                </div>
                <Skeleton className="h-8 w-8" />
            </div>
        </div>
    );
}

export default function ManagePasskeys({ canManagePasskeys = false }: Props) {
    const navigate = useNavigate();
    const from = locationToPath(useLocation());
    const [passkeys, setPasskeys] = useState<Passkey[]>([]);
    const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>(
        'loading',
    );
    const [loadError, setLoadError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const listRequestId = useRef(0);

    const loadPasskeys = useCallback(async (): Promise<void> => {
        const requestId = ++listRequestId.current;

        try {
            const nextPasskeys = await fetchPasskeys();

            if (requestId !== listRequestId.current) {
                return;
            }

            setPasskeys(nextPasskeys);
            setPhase('ready');
            setLoadError(null);
        } catch (error) {
            if (isRequestAborted(error)) {
                return;
            }

            if (requestId !== listRequestId.current) {
                return;
            }

            setLoadError(normalizeApiError(error).message);
            setPhase('error');
        }
    }, []);

    useEffect(() => {
        if (!canManagePasskeys) {
            return;
        }

        const controller = new AbortController();
        listRequestId.current += 1;
        const requestId = listRequestId.current;
        setPhase('loading');
        setLoadError(null);

        void (async () => {
            try {
                const nextPasskeys = await fetchPasskeys({
                    signal: controller.signal,
                });

                if (requestId !== listRequestId.current) {
                    return;
                }

                setPasskeys(nextPasskeys);
                setPhase('ready');
            } catch (error) {
                if (isRequestAborted(error)) {
                    return;
                }

                if (requestId !== listRequestId.current) {
                    return;
                }

                setLoadError(normalizeApiError(error).message);
                setPhase('error');
            }
        })();

        return () => {
            controller.abort();
        };
    }, [canManagePasskeys]);

    if (!canManagePasskeys) {
        return null;
    }

    const handleRegisterSuccess = () => {
        setActionError(null);
        void loadPasskeys();
    };

    const handleDelete = (
        id: number,
        onComplete: (success: boolean) => void,
    ) => {
        setActionError(null);

        void (async () => {
            try {
                await deletePasskey(id);
                await loadPasskeys();
                onComplete(true);
            } catch (error) {
                if (
                    navigateToConfirmPasswordIfRequired(error, navigate, from)
                ) {
                    onComplete(false);

                    return;
                }

                setActionError(normalizeApiError(error).message);
                onComplete(false);
            }
        })();
    };

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title="Passkeys"
                description="Manage your passkeys for passwordless sign-in"
            />

            {actionError ? <AlertError errors={[actionError]} /> : null}
            {phase === 'error' && loadError ? (
                <AlertError errors={[loadError]} />
            ) : null}

            <div className="border-border overflow-hidden rounded-lg border">
                {phase === 'loading' ? <PasskeyListSkeleton /> : null}

                {phase === 'ready' && passkeys.length > 0
                    ? passkeys.map((passkey) => (
                          <PasskeyItem
                              key={passkey.id}
                              passkey={passkey}
                              onDelete={handleDelete}
                          />
                      ))
                    : null}

                {phase === 'ready' && passkeys.length === 0 ? (
                    <EmptyState />
                ) : null}
            </div>

            <PasskeyRegister onSuccess={handleRegisterSuccess} />
        </div>
    );
}
