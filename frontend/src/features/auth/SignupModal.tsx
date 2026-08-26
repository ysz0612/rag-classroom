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
    MailOutlined,
    SmileOutlined,
    UserOutlined,
} from "@ant-design/icons";

import { signupApi } from "../../api/authApi";

import "../../styles/auth-modal.css";


interface SignupModalProps {
    open: boolean;

    onClose: () => void;

    onLogin: () => void;
}


export default function SignupModal({
                                        open,
                                        onClose,
                                        onLogin,
                                    }: SignupModalProps) {

    const [username, setUsername] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [nickname, setNickname] =
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
            setEmail("");
            setNickname("");
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


        if (
            !username.trim() ||
            !email.trim() ||
            !nickname.trim() ||
            !password.trim()
        ) {

            setError(
                "모든 항목을 입력해주세요.",
            );

            return;

        }


        setError("");
        setLoading(true);


        try {

            await signupApi({
                username: username.trim(),
                email: email.trim(),
                password,
                nickname: nickname.trim(),
            });


            setLoading(false);

            onClose();

            /*
             * 회원가입 성공 후
             * 로그인 팝업으로 자동 이동
             */
            onLogin();


        } catch {

            setLoading(false);

            setError(
                "회원가입에 실패했습니다.",
            );

        }

    };


    const moveLogin = () => {

        onClose();

        onLogin();

    };


    return (
        <div className="auth-modal-overlay">

            <div className="auth-modal-window signup-window">

                <div className="auth-modal-topbar">

                    <div className="auth-modal-topbar-title">

                        <span className="auth-window-dot" />

                        CREATE STUDENT ACCOUNT

                    </div>


                    <button
                        type="button"
                        className="auth-close-button"
                        onClick={onClose}
                    >
                        <CloseOutlined />
                    </button>

                </div>


                <div className="auth-modal-content">

                    <div className="auth-modal-symbol">
                        +
                    </div>


                    <div className="auth-modal-heading">

                        <span>
                            JOIN CLASSROOM
                        </span>

                        <h2>
                            회원가입
                        </h2>

                        <p>
                            학습 기록과 RAG 실습을 위한
                            계정을 만들어주세요.
                        </p>

                    </div>


                    <form
                        className="auth-form signup-form"
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
                                    placeholder="아이디"
                                />

                            </div>

                        </label>


                        <label className="auth-field">

                            <span>
                                이메일
                            </span>

                            <div className="auth-input-wrap">

                                <MailOutlined />

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="example@email.com"
                                />

                            </div>

                        </label>


                        <label className="auth-field">

                            <span>
                                닉네임
                            </span>

                            <div className="auth-input-wrap">

                                <SmileOutlined />

                                <input
                                    value={nickname}
                                    onChange={(event) =>
                                        setNickname(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="강의실에서 사용할 이름"
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
                                    placeholder="비밀번호"
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
                                ? "CREATING..."
                                : "CREATE ACCOUNT"}

                        </button>

                    </form>


                    <div className="auth-switch-area">

                        <span>
                            이미 계정이 있나요?
                        </span>

                        <button
                            type="button"
                            onClick={moveLogin}
                        >
                            로그인
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}