import {
    useEffect,
    useState,
} from "react";

import type {
    FormEvent,
} from "react";

import {
    CloseOutlined,
    LockOutlined,
    UserOutlined,
} from "@ant-design/icons";

import { useAuth } from "./AuthContext";

import "../../styles/auth-modal.css";


interface LoginModalProps {
    open: boolean;

    onClose: () => void;

    onSignup: () => void;

    onSuccess?: () => void;
}


export default function LoginModal({
                                       open,
                                       onClose,
                                       onSignup,
                                       onSuccess,
                                   }: LoginModalProps) {

    const {
        login,
    } = useAuth();


    const [username, setUsername] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    useEffect(() => {

        if (!open) {

            setUsername("");
            setPassword("");
            setError("");
            setLoading(false);

        }

    }, [open]);


    if (!open) {
        return null;
    }


    const handleSubmit = async (
        event: FormEvent,
    ) => {

        event.preventDefault();

        if (!username.trim()) {
            setError("아이디를 입력해주세요.");
            return;
        }

        if (!password.trim()) {
            setError("비밀번호를 입력해주세요.");
            return;
        }


        setError("");
        setLoading(true);


        try {

            await login({
                username: username.trim(),
                password,
            });


            setLoading(false);

            onClose();

            onSuccess?.();


        } catch {

            setLoading(false);

            setError(
                "아이디 또는 비밀번호를 확인해주세요.",
            );

        }

    };


    const moveSignup = () => {

        setError("");

        onClose();

        onSignup();

    };


    return (
        <div className="auth-modal-overlay">

            <div className="auth-modal-window">

                {/* 상단 바 */}

                <div className="auth-modal-topbar">

                    <div className="auth-modal-topbar-title">

                        <span className="auth-window-dot" />

                        RAG CLASSROOM LOGIN

                    </div>


                    <button
                        type="button"
                        className="auth-close-button"
                        onClick={onClose}
                    >
                        <CloseOutlined />
                    </button>

                </div>


                {/* 내용 */}

                <div className="auth-modal-content">

                    <div className="auth-modal-symbol">
                        R
                    </div>


                    <div className="auth-modal-heading">

                        <span>
                            WELCOME BACK
                        </span>

                        <h2>
                            로그인
                        </h2>

                        <p>
                            RAG Classroom에 다시 오신 것을
                            환영합니다.
                        </p>

                    </div>


                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                    >

                        <label className="auth-field">

                            <span>
                                아이디
                            </span>

                            <div className="auth-input-wrap">

                                <UserOutlined />

                                <input
                                    value={username}
                                    onChange={(event) =>
                                        setUsername(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="아이디를 입력하세요"
                                    autoComplete="username"
                                />

                            </div>

                        </label>


                        <label className="auth-field">

                            <span>
                                비밀번호
                            </span>

                            <div className="auth-input-wrap">

                                <LockOutlined />

                                <input
                                    type="password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="비밀번호를 입력하세요"
                                    autoComplete="current-password"
                                />

                            </div>

                        </label>


                        {error && (
                            <div className="auth-error">
                                ! {error}
                            </div>
                        )}


                        <button
                            className="auth-submit-button"
                            type="submit"
                            disabled={loading}
                        >

                            {loading
                                ? "LOGIN..."
                                : "LOGIN"}

                        </button>

                    </form>


                    <div className="auth-switch-area">

                        <span>
                            아직 계정이 없나요?
                        </span>

                        <button
                            type="button"
                            onClick={moveSignup}
                        >
                            회원가입
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}