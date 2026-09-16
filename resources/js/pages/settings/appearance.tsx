import { SettingsLayout } from '@/layouts/settings-layout';

export default function AppearanceSettingsPage() {
    return (
        <SettingsLayout title="Appearance settings">
            <div className="space-y-2">
                <h1 className="text-2xl font-medium">Appearance</h1>
                <p className="text-[#706f6c] dark:text-[#A1A09A]">
                    Appearance settings UI is planned for a later phase.
                </p>
            </div>
        </SettingsLayout>
    );
}
