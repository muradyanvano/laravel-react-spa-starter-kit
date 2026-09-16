import { useAuth } from '@/auth/auth-provider';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
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
import { Label } from '@/components/ui/label';
import { fieldDescribedBy, fieldErrorId, useForm } from '@/hooks/use-form';
import { deleteAccount } from '@/lib/settings-api';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const form = useForm({ password: '' });

    const closeDialog = () => {
        setIsOpen(false);
        form.reset();
        form.clearErrors();
    };

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title="Delete account"
                description="Delete your account and all of its resources"
            />
            <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                    <p className="font-medium">Warning</p>
                    <p className="text-sm">
                        Please proceed with caution, this cannot be undone.
                    </p>
                </div>

                <Dialog
                    open={isOpen}
                    onOpenChange={(open) =>
                        open ? setIsOpen(true) : closeDialog()
                    }
                >
                    <DialogTrigger asChild>
                        <Button
                            variant="destructive"
                            data-test="delete-user-button"
                        >
                            Delete account
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>
                            Are you sure you want to delete your account?
                        </DialogTitle>
                        <DialogDescription>
                            Once your account is deleted, all of its resources
                            and data will also be permanently deleted. Please
                            enter your password to confirm you would like to
                            permanently delete your account.
                        </DialogDescription>

                        <form
                            className="space-y-6"
                            noValidate
                            onSubmit={(event) => {
                                event.preventDefault();
                                void form
                                    .submit(async (data) => {
                                        await deleteAccount({
                                            password: data.password,
                                        });
                                        setUser(null);
                                        await navigate('/', { replace: true });
                                    })
                                    .catch(() => {
                                        passwordInput.current?.focus();
                                    });
                            }}
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="sr-only">
                                    Password
                                </Label>

                                <PasswordInput
                                    id="password"
                                    name="password"
                                    ref={passwordInput}
                                    placeholder="Password"
                                    autoComplete="current-password"
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
                                    message={
                                        form.errors.password ??
                                        form.formError ??
                                        undefined
                                    }
                                />
                            </div>

                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button variant="secondary" type="button">
                                        Cancel
                                    </Button>
                                </DialogClose>

                                <Button
                                    variant="destructive"
                                    type="submit"
                                    disabled={form.processing}
                                    data-test="confirm-delete-user-button"
                                >
                                    Delete account
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
