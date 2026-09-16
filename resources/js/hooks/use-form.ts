import {
    ensureCsrfCookie,
    http,
    isNormalizedApiError,
    normalizeApiError,
} from '@/lib/http';
import type { LaravelValidationErrors } from '@/types/http';
import { useCallback, useState } from 'react';

type FormErrors = Record<string, string>;

function firstErrorMessages(errors: LaravelValidationErrors): FormErrors {
    return Object.fromEntries(
        Object.entries(errors).map(([field, messages]) => [
            field,
            messages[0] ?? '',
        ]),
    );
}

export function useForm<T extends Record<string, unknown>>(initial: T) {
    const [data, setData] = useState<T>(initial);
    const [errors, setErrors] = useState<FormErrors>({});
    const [processing, setProcessing] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    const setField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
        setData((current) => ({ ...current, [key]: value }));
    }, []);

    const clearErrors = useCallback(() => {
        setErrors({});
        setFormError(null);
    }, []);

    const reset = useCallback(
        (...fields: Array<keyof T>) => {
            if (fields.length === 0) {
                setData(initial);

                return;
            }

            setData((current) => {
                const next = { ...current };

                for (const field of fields) {
                    next[field] = initial[field];
                }

                return next;
            });
        },
        [initial],
    );

    const submit = useCallback(
        async (action: (formData: T) => Promise<void | string | null>) => {
            if (processing) {
                return;
            }

            setProcessing(true);
            clearErrors();
            setStatus(null);

            try {
                const result = await action(data);

                if (typeof result === 'string') {
                    setStatus(result);
                }
            } catch (error) {
                const normalized = isNormalizedApiError(error)
                    ? error
                    : normalizeApiError(error);

                if (normalized.kind === 'csrf') {
                    try {
                        await ensureCsrfCookie();
                    } catch {
                        // Ignore secondary CSRF bootstrap failures.
                    }
                }

                if (normalized.kind === 'validation') {
                    setErrors(firstErrorMessages(normalized.errors));
                    setFormError(normalized.message);
                } else {
                    setFormError(normalized.message);
                }

                throw normalized;
            } finally {
                setProcessing(false);
            }
        },
        [clearErrors, data, processing],
    );

    return {
        data,
        setData,
        setField,
        errors,
        processing,
        status,
        setStatus,
        formError,
        setFormError,
        clearErrors,
        reset,
        submit,
        hasErrors: Object.keys(errors).length > 0 || formError !== null,
    };
}

export function fieldErrorId(field: string): string {
    return `${field}-error`;
}

export function fieldDescribedBy(
    field: string,
    errors: FormErrors,
): string | undefined {
    return errors[field] ? fieldErrorId(field) : undefined;
}

/** Shared helper for auth POSTs that must send JSON to Fortify. */
export async function postFortify(
    url: string,
    payload: Record<string, unknown>,
): Promise<unknown> {
    await ensureCsrfCookie();

    const response = await http.post(url, payload);

    return response.data;
}
