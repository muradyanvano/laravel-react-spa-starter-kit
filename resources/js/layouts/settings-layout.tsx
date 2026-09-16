import AppLayout from '@/layouts/app-layout';
import SettingsLayoutTemplate from '@/layouts/settings/layout';
import type { BreadcrumbItem } from '@/types';
import type { ReactNode } from 'react';

export function SettingsLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: ReactNode;
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <SettingsLayoutTemplate>{children}</SettingsLayoutTemplate>
        </AppLayout>
    );
}

export default SettingsLayout;
