import { GuestLayout } from '@/layouts/guest-layout';
import { Link } from 'react-router';

export default function RegisterPage() {
    return (
        <GuestLayout title="Register">
            <div className="space-y-4 rounded-lg border border-[#e3e3e0] bg-white p-6 dark:border-[#3E3E3A] dark:bg-[#161615]">
                <h1 className="text-xl font-medium">Register</h1>
                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                    Registration UI is planned for a later phase. Fortify
                    registration endpoints are available.
                </p>
                <p className="text-sm">
                    <Link to="/login" className="underline underline-offset-4">
                        Already registered?
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}
