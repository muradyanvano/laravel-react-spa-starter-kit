import { GuestLayout } from '@/layouts/guest-layout';
import { Link } from 'react-router';

export default function LoginPage() {
    return (
        <GuestLayout title="Log in">
            <div className="space-y-4 rounded-lg border border-[#e3e3e0] bg-white p-6 dark:border-[#3E3E3A] dark:bg-[#161615]">
                <h1 className="text-xl font-medium">Log in</h1>
                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                    Authentication UI will be completed in a later phase.
                    Fortify and Sanctum cookie/session auth are already
                    configured.
                </p>
                <p className="text-sm">
                    <Link
                        to="/register"
                        className="underline underline-offset-4"
                    >
                        Create an account
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}
