/**
 * Laravel validation error payload (HTTP 422).
 */
export type LaravelValidationErrors = Record<string, string[]>;

export type LaravelValidationErrorBody = {
    message: string;
    errors: LaravelValidationErrors;
};

export type ApiErrorKind =
    | 'validation'
    | 'unauthenticated'
    | 'forbidden'
    | 'csrf'
    | 'server'
    | 'network'
    | 'unknown';

export type NormalizedApiError = {
    kind: ApiErrorKind;
    status: number | null;
    message: string;
    errors: LaravelValidationErrors;
};
