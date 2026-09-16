import { SettingsLayout } from '@/layouts/settings-layout';

export default function TwoFactorSettingsPage() {
    return (
        <SettingsLayout title="Two-factor settings">
            <div className="space-y-2">
                <h1 className="text-2xl font-medium">
                    Two-factor authentication
                </h1>
                <p className="text-[#706f6c] dark:text-[#A1A09A]">
                    Two-factor settings UI is planned for a later phase. Fortify
                    2FA is enabled on the backend.
                </p>
            </div>
        </SettingsLayout>
    );
}
