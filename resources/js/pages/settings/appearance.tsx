import AppearanceTabs from '@/components/appearance-tabs';
import { DocumentTitle } from '@/components/document-title';
import Heading from '@/components/heading';
import { SettingsLayout } from '@/layouts/settings-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: '/settings/appearance',
    },
];

export default function Appearance() {
    return (
        <SettingsLayout breadcrumbs={breadcrumbs}>
            <DocumentTitle title="Appearance settings" />

            <h1 className="sr-only">Appearance settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Appearance settings"
                    description="Update the appearance settings for your account"
                />
                <AppearanceTabs />
            </div>
        </SettingsLayout>
    );
}
