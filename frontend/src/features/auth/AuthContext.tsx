import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import {
    getMeApi,
    loginApi,
    logoutApi,
} from "../../api/authApi";

import type {
    LoginRequest,
    User,
} from "./authTypes";


interface AuthContextValue {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;

    login: (
        data: LoginRequest,
    ) => Promise<void>;

    logout: () => Promise<void>;
}


const AuthContext = createContext<AuthContextValue | null>(
    null,
);


export function AuthProvider({
                                 children,
                             }: {
    children: ReactNode;
}) {

    const [user, setUser] = useState<User | null>(
        null,
    );

    const [loading, setLoading] = useState(
        true,
    );


    useEffect(() => {

        const loadUser = async () => {

            const token = localStorage.getItem(
                "accessToken",
            );

            if (!token) {
                setLoading(false);
                return;
            }

            try {

                const me = await getMeApi();

                setUser(me);

            } catch {

                localStorage.removeItem(
                    "accessToken",
                );

                setUser(null);

            } finally {

                setLoading(false);
            }
        };


        loadUser();

    }, []);


    const login = async (
        data: LoginRequest,
    ) => {

        const result = await loginApi(
            data,
        );

        localStorage.setItem(
            "accessToken",
            result.access_token,
        );

        setUser(
            result.user,
        );
    };


    const logout = async () => {

        try {

            await logoutApi();

        } finally {

            localStorage.removeItem(
                "accessToken",
            );

            setUser(null);
        }
    };


    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {

    const context = useContext(
        AuthContext,
    );

    if (!context) {
        throw new Error(
            "useAuth는 AuthProvider 안에서 사용해야 합니다.",
        );
    }

    return context;
}