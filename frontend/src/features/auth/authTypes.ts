export interface User {
    id: number;
    username: string;
    email: string;
    nickname: string | null;
    is_active: boolean;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
    user: User;
}

export interface SignupRequest {
    username: string;
    email: string;
    password: string;
    nickname?: string;
}