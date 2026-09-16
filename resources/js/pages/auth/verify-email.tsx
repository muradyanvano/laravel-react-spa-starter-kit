import { AppShellLayout } from '@/layouts/app-shell-layout';

export default function VerifyEmailPage() {
    return (
        <AppShellLayout title="Verify email">
            <div className="space-y-4">
                <h1 className="text-2xl font-medium">Verify your email</h1>
                <p className="text-[#706f6c] dark:text-[#A1A09A]">
                    Email verification UI is planned for a later phase. Fortify
                    email verification is enabled on the backend.
                </p>
            </div>
        </AppShellLayout>
    );
}
