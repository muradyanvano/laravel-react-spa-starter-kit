import { SettingsLayout } from '@/layouts/settings-layout';

export default function PasswordSettingsPage() {
    return (
        <SettingsLayout title="Password settings">
            <div className="space-y-2">
                <h1 className="text-2xl font-medium">Password</h1>
                <p className="text-[#706f6c] dark:text-[#A1A09A]">
                    Password settings UI is planned for a later phase.
                </p>
            </div>
        </SettingsLayout>
    );
}
