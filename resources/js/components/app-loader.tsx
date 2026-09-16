import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

type AppLoaderProps = {
    className?: string;
};

/**
 * Minimal full-viewport loader for auth bootstrap only.
 */
export function AppLoader({ className }: AppLoaderProps) {
    return (
        <div
            className={cn(
                'bg-background flex min-h-svh items-center justify-center',
                className,
            )}
            role="status"
            aria-live="polite"
            aria-busy="true"
            data-testid="app-loader"
        >
            <Spinner className="text-muted-foreground size-6 motion-reduce:animate-none" />
            <span className="sr-only">Loading</span>
        </div>
    );
}
