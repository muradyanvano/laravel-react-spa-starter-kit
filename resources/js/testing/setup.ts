import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

vi.mock('@laravel/passkeys/react', () => ({
    usePasskeyVerify: vi.fn(() => ({
        verify: vi.fn(),
        isLoading: false,
        error: null,
        errorInstance: null,
        isSupported: false,
    })),
    usePasskeyRegister: vi.fn(() => ({
        register: vi.fn(),
        isLoading: false,
        error: null,
        errorInstance: null,
        isSupported: false,
    })),
}));

afterEach(() => {
    cleanup();
});

class ResizeObserverMock {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
}

if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = ResizeObserverMock;
}

type MatchMediaMock = MediaQueryList & {
    dispatchChange: (matches: boolean) => void;
};

function createMatchMediaMock(query: string, matches = false): MatchMediaMock {
    let currentMatches = matches;
    const listeners = new Set<(event: MediaQueryListEvent) => void>();

    return {
        media: query,
        get matches() {
            return currentMatches;
        },
        onchange: null,
        addEventListener: (
            _type: string,
            listener: (event: MediaQueryListEvent) => void,
        ) => {
            listeners.add(listener);
        },
        removeEventListener: (
            _type: string,
            listener: (event: MediaQueryListEvent) => void,
        ) => {
            listeners.delete(listener);
        },
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => true,
        dispatchChange(nextMatches: boolean) {
            currentMatches = nextMatches;
            listeners.forEach((listener) => {
                listener({ matches: nextMatches } as MediaQueryListEvent);
            });
        },
    } as MatchMediaMock;
}

const matchMediaMocks = new Map<string, MatchMediaMock>();

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => {
        if (!matchMediaMocks.has(query)) {
            matchMediaMocks.set(query, createMatchMediaMock(query));
        }

        return matchMediaMocks.get(query)!;
    },
});

if (typeof document.elementFromPoint !== 'function') {
    document.elementFromPoint = () => null;
}

export function getMatchMediaMock(query: string): MatchMediaMock {
    window.matchMedia(query);

    return matchMediaMocks.get(query)!;
}
