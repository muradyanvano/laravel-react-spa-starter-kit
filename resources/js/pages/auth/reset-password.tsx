import { GuestLayout } from '@/layouts/guest-layout';
import { useParams } from 'react-router';

export default function ResetPasswordPage() {
    const { token } = useParams();

    return (
        <GuestLayout title="Reset password">
            <div className="space-y-4 rounded-lg border border-[#e3e3e0] bg-white p-6 dark:border-[#3E3E3A] dark:bg-[#161615]">
                <h1 className="text-xl font-medium">Reset password</h1>
                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                    Password reset form UI is planned for a later phase.
                </p>
                {token ? (
                    <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">
                        Reset token received.
                    </p>
                ) : null}
            </div>
        </GuestLayout>
    );
}
