import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import type { Passkey } from '@/types/auth';
import { KeyRound, Trash2 } from 'lucide-react';
import { useState } from 'react';

type Props = {
    passkey: Passkey;
    onDelete: (id: number, onComplete: (success: boolean) => void) => void;
};

export default function PasskeyItem({ passkey, onDelete }: Props) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [open, setOpen] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        onDelete(passkey.id, (success) => {
            setIsDeleting(false);

            if (success) {
                setOpen(false);
            }
        });
    };

    return (
        <div className="flex items-center justify-between border-b p-4 last:border-b-0">
            <div className="flex items-center gap-4">
                <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                    <KeyRound
                        className="text-muted-foreground h-5 w-5"
                        aria-hidden="true"
                    />
                </div>
                <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <p className="font-medium tracking-tight">
                            {passkey.name}
                        </p>
                        {passkey.authenticator ? (
                            <span className="bg-muted text-muted-foreground ring-border inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase ring-1 ring-inset">
                                {passkey.authenticator}
                            </span>
                        ) : null}
                    </div>
                    <p className="text-muted-foreground text-sm">
                        Added {passkey.created_at_diff}
                        {passkey.last_used_at_diff ? (
                            <>
                                <span className="text-muted-foreground/50 mx-1">
                                    /
                                </span>
                                Last used {passkey.last_used_at_diff}
                            </>
                        ) : null}
                    </p>
                </div>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">Remove</span>
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogTitle>Remove passkey</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to remove the &quot;{passkey.name}
                        &quot; passkey? You will no longer be able to use it to
                        sign in.
                    </DialogDescription>
                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Removing...' : 'Remove passkey'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
