import { useEffect } from 'react';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

export function DocumentTitle({ title }: { title?: string }) {
    useEffect(() => {
        document.title = title ? `${title} - ${appName}` : appName;
    }, [title]);

    return null;
}
