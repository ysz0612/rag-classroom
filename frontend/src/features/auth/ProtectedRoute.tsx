import type {
    ReactNode,
} from "react";

import {
    Navigate,
} from "react-router-dom";

import {
    useAuth,
} from "./AuthContext";


export default function ProtectedRoute({
                                           children,
                                       }: {
    children: ReactNode;
}) {

    const {
        isAuthenticated,
        loading,
    } = useAuth();


    if (loading) {

        return (
            <div>
                확인 중...
            </div>
        );
    }


    if (!isAuthenticated) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    return children;
}