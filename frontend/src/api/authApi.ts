import { apiClient } from "./client";

import type {
    LoginRequest,
    LoginResponse,
    SignupRequest,
    User,
} from "../features/auth/authTypes";


export async function loginApi(
    data: LoginRequest,
): Promise<LoginResponse> {

    const response = await apiClient.post<LoginResponse>(
        "/api/auth/login",
        data,
    );

    return response.data;
}


export async function signupApi(
    data: SignupRequest,
): Promise<User> {

    const response = await apiClient.post<User>(
        "/api/auth/signup",
        data,
    );

    return response.data;
}


export async function getMeApi(): Promise<User> {

    const response = await apiClient.get<User>(
        "/api/auth/me",
    );

    return response.data;
}


export async function logoutApi(): Promise<void> {

    await apiClient.post(
        "/api/auth/logout",
    );
}