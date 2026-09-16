import { GuestLayout } from '@/layouts/guest-layout';
import { Link } from 'react-router';

export default function ForgotPasswordPage() {
    return (
        <GuestLayout title="Forgot password">
            <div className="space-y-4 rounded-lg border border-[#e3e3e0] bg-white p-6 dark:border-[#3E3E3A] dark:bg-[#161615]">
                <h1 className="text-xl font-medium">Forgot password</h1>
                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                    Password reset UI is planned for a later phase.
                </p>
                <p className="text-sm">
                    <Link to="/login" className="underline underline-offset-4">
                        Back to log in
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}
