import { useLocation } from 'react-router';

export type IsCurrentUrlFn = (
    urlToCheck: string,
    startsWith?: boolean,
) => boolean;

export type IsCurrentOrParentUrlFn = (urlToCheck: string) => boolean;

export type WhenCurrentUrlFn = <TIfTrue, TIfFalse = null>(
    urlToCheck: string,
    ifTrue: TIfTrue,
    ifFalse?: TIfFalse,
) => TIfTrue | TIfFalse;

export type UseCurrentUrlReturn = {
    currentUrl: string;
    isCurrentUrl: IsCurrentUrlFn;
    isCurrentOrParentUrl: IsCurrentOrParentUrlFn;
    whenCurrentUrl: WhenCurrentUrlFn;
};

function pathnameOf(url: string): string | null {
    if (!url.startsWith('http')) {
        return url;
    }

    try {
        return new URL(url).pathname;
    } catch {
        return null;
    }
}

export function useCurrentUrl(): UseCurrentUrlReturn {
    const currentUrl = useLocation().pathname;

    const isCurrentUrl: IsCurrentUrlFn = (urlToCheck, startsWith = false) => {
        const path = pathnameOf(urlToCheck);

        if (path === null) {
            return false;
        }

        return startsWith ? currentUrl.startsWith(path) : path === currentUrl;
    };

    const isCurrentOrParentUrl: IsCurrentOrParentUrlFn = (urlToCheck) =>
        isCurrentUrl(urlToCheck, true);

    const whenCurrentUrl: WhenCurrentUrlFn = <TIfTrue, TIfFalse = null>(
        urlToCheck: string,
        ifTrue: TIfTrue,
        ifFalse: TIfFalse = null as TIfFalse,
    ): TIfTrue | TIfFalse => (isCurrentUrl(urlToCheck) ? ifTrue : ifFalse);

    return {
        currentUrl,
        isCurrentUrl,
        isCurrentOrParentUrl,
        whenCurrentUrl,
    };
}
