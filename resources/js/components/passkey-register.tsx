import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { locationToPath } from '@/lib/navigation';
import { navigateToConfirmPasswordIfRequired } from '@/lib/password-confirmation';
import {
    mapPasskeyErrorMessage,
    passkeyRegisterRoutes,
    preparePasskeyCeremony,
} from '@/lib/passkeys';
import { usePasskeyRegister } from '@laravel/passkeys/react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

function defaultPasskeyName(): string {
    const ua = navigator.userAgent;

    const browser = [
        { pattern: /Edg|Edge/, name: 'Edge' },
        { pattern: /OPR|Opera|OPiOS/, name: 'Opera' },
        { pattern: /Firefox|FxiOS/, name: 'Firefox' },
        { pattern: /Chrome|CriOS/, name: 'Chrome' },
        { pattern: /Safari/, name: 'Safari' },
    ].find(({ pattern }) => pattern.test(ua))?.name;

    const os = [
        { pattern: /iPhone/, name: 'iPhone' },
        { pattern: /iPad|Macintosh(?=.*Mobile)/, name: 'iPad' },
        { pattern: /Android/, name: 'Android' },
        { pattern: /Mac/, name: 'Mac' },
        { pattern: /Windows/, name: 'Windows' },
    ].find(({ pattern }) => pattern.test(ua))?.name;

    return [browser, os].filter(Boolean).join(' on ') || '';
}

type Props = {
    onSuccess: () => void;
};

export default function PasskeyRegister({ onSuccess }: Props) {
    const navigate = useNavigate();
    const from = locationToPath(useLocation());
    const [name, setName] = useState(defaultPasskeyName);
    const [showForm, setShowForm] = useState(false);
    const { register, isLoading, error, errorInstance, isSupported } =
        usePasskeyRegister({
            routes: passkeyRegisterRoutes,
            onSuccess: () => {
                setName(defaultPasskeyName());
                setShowForm(false);
                onSuccess();
            },
            onError: (passkeyError) => {
                navigateToConfirmPasswordIfRequired(
                    passkeyError,
                    navigate,
                    from,
                );
            },
        });

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const trimmedName = name.trim();

        if (!trimmedName) {
            return;
        }

        await preparePasskeyCeremony();
        await register(trimmedName);
    };

    const handleCancel = () => {
        setShowForm(false);
        setName('');
    };

    if (!isSupported) {
        return (
            <div className="text-muted-foreground text-sm">
                Passkeys are not supported in this browser.
            </div>
        );
    }

    if (!showForm) {
        return (
            <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(true)}
            >
                Add passkey
            </Button>
        );
    }

    const visibleError = mapPasskeyErrorMessage(errorInstance ?? error);

    return (
        <form
            onSubmit={(event) => {
                void handleSubmit(event);
            }}
            className="border-border bg-muted/50 space-y-4 rounded-lg border p-4"
        >
            <div className="grid gap-2">
                <Label htmlFor="passkey-name">Passkey name</Label>
                <Input
                    id="passkey-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g., MacBook Pro, iPhone"
                    className="border-foreground/20 mt-1 block w-full"
                    autoFocus
                />
                <p className="text-muted-foreground text-xs">
                    A name helps you identify this passkey later.
                </p>
            </div>

            {visibleError ? <InputError message={visibleError} /> : null}

            <div className="flex gap-2">
                <Button type="submit" disabled={isLoading || !name.trim()}>
                    {isLoading ? 'Registering...' : 'Register passkey'}
                </Button>
                <Button type="button" variant="ghost" onClick={handleCancel}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}
