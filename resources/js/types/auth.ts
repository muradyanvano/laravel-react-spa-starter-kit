export type User = {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    avatar?: string | null;
};

export type AuthUser = User;

export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};
