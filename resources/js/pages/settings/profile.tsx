import { SettingsLayout } from '@/layouts/settings-layout';

export default function ProfileSettingsPage() {
    return (
        <SettingsLayout title="Profile settings">
            <div className="space-y-2">
                <h1 className="text-2xl font-medium">Profile</h1>
                <p className="text-[#706f6c] dark:text-[#A1A09A]">
                    Profile settings UI is planned for a later phase.
                </p>
            </div>
        </SettingsLayout>
    );
}
