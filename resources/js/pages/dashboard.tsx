import { useAuth } from '@/auth/auth-provider';
import { AppShellLayout } from '@/layouts/app-shell-layout';

export default function DashboardPage() {
    const { user, logout } = useAuth();

    return (
        <AppShellLayout title="Dashboard">
            <div className="space-y-4">
                <h1 className="text-2xl font-medium">Dashboard</h1>
                <p className="text-[#706f6c] dark:text-[#A1A09A]">
                    You are signed in as {user?.email}.
                </p>
                <button
                    type="button"
                    onClick={() => {
                        void logout();
                    }}
                    className="rounded-sm border border-[#1915014a] px-4 py-2 text-sm dark:border-[#3E3E3A]"
                >
                    Log out
                </button>
            </div>
        </AppShellLayout>
    );
}
