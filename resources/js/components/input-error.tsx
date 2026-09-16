import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * Field validation message. Place as the last child of a `grid gap-2` field
 * unit (Label, Input, InputError). Do not add top margin — the grid gap owns
 * spacing between the control and this message.
 */
export default function InputError({
    message,
    className = '',
    ...props
}: HTMLAttributes<HTMLParagraphElement> & { message?: string }) {
    return message ? (
        <p
            {...props}
            className={cn('text-sm text-red-600 dark:text-red-400', className)}
        >
            {message}
        </p>
    ) : null;
}
