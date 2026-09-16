import { useAuth } from '@/auth/auth-provider';
import { DocumentTitle } from '@/components/document-title';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router';
import { useState } from 'react';

export default function DashboardPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loggingOut, setLoggingOut] = useState(false);

    return (
        <div className="bg-background text-foreground min-h-svh">
            <DocumentTitle title="Dashboard" />
            <header className="border-border border-b">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
                    <Link to="/dashboard" className="font-medium">
                        {import.meta.env.VITE_APP_NAME || 'Laravel'}
                    </Link>
                    <nav
                        aria-label="Primary"
                        className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm"
                    >
                        <Link to="/dashboard" className="hover:text-foreground">
                            Dashboard
                        </Link>
                        <Link
                            to="/settings/profile"
                            className="hover:text-foreground"
                        >
                            Settings
                        </Link>
                    </nav>
                </div>
            </header>
            <main className="mx-auto max-w-5xl space-y-4 px-6 py-8">
                <h1 className="text-2xl font-medium">Dashboard</h1>
                <p className="text-muted-foreground">
                    You are signed in as {user?.email}.
                </p>
                <Button
                    type="button"
                    variant="outline"
                    disabled={loggingOut}
                    onClick={() => {
                        setLoggingOut(true);
                        void logout()
                            .then(async () => {
                                await navigate('/login', { replace: true });
                            })
                            .finally(() => {
                                setLoggingOut(false);
                            });
                    }}
                >
                    {loggingOut ? 'Logging out…' : 'Log out'}
                </Button>
            </main>
        </div>
    );
}
