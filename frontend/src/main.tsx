import React from "react";
import ReactDOM from "react-dom/client";

import { ConfigProvider } from "antd";

import App from "./App";

import { AuthProvider } from "./features/auth/AuthContext";

import "./styles/global.css";


ReactDOM.createRoot(
    document.getElementById("root")!,
).render(
    <React.StrictMode>

        <ConfigProvider>

            <AuthProvider>

                <App />

            </AuthProvider>

        </ConfigProvider>

    </React.StrictMode>,
);