import {
    BookOutlined,
    HomeOutlined,
    LoginOutlined,
    LogoutOutlined,
    UserAddOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../features/auth/AuthContext";

import "../styles/site-header.css";


interface SiteHeaderProps {
    showLearningRecord?: boolean;

    onLearningRecord?: () => void;

    onLogin?: () => void;

    onSignup?: () => void;
}


export default function SiteHeader({
                                       showLearningRecord = false,
                                       onLearningRecord,
                                       onLogin,
                                       onSignup,
                                   }: SiteHeaderProps) {

    const navigate = useNavigate();

    const {
        user,
        isAuthenticated,
        logout,
    } = useAuth();


    const handleLogout = () => {

        logout();

        navigate("/");
    };


    return (
        <header className="site-header">

            {/* =================================================
                LEFT - BRAND
            ================================================= */}

            <button
                type="button"
                className="site-brand"
                onClick={() => navigate("/")}
            >

                <span className="site-brand-logo">
                    R
                </span>


                <span className="site-brand-copy">

                    <strong>
                        RAG CLASSROOM
                    </strong>

                    <small>
                        INTERACTIVE AI LEARNING LAB
                    </small>

                </span>

            </button>


            {/* =================================================
                RIGHT
            ================================================= */}

            <div className="site-header-actions">

                {/* ---------------------------------------------
                    홈이 아닌 페이지에서도 사용할 홈 버튼
                --------------------------------------------- */}

                <button
                    type="button"
                    className="site-header-button"
                    onClick={() => navigate("/")}
                >

                    <HomeOutlined />

                    <span>
                        홈
                    </span>

                </button>


                {/* ---------------------------------------------
                    Classroom에서만 학습 기록 표시
                --------------------------------------------- */}

                {showLearningRecord && (
                    <button
                        type="button"
                        className="site-header-button"
                        onClick={onLearningRecord}
                    >

                        <BookOutlined />

                        <span>
                            학습 기록
                        </span>

                    </button>
                )}


                {/* =================================================
                    로그인 전
                ================================================= */}

                {!isAuthenticated && (
                    <>

                        <button
                            type="button"
                            className="site-header-button"
                            onClick={onLogin}
                        >

                            <LoginOutlined />

                            <span>
                                로그인
                            </span>

                        </button>


                        <button
                            type="button"
                            className="
                                site-header-button
                                site-signup-button
                            "
                            onClick={onSignup}
                        >

                            <UserAddOutlined />

                            <span>
                                회원가입
                            </span>

                        </button>

                    </>
                )}


                {/* =================================================
                    로그인 후
                ================================================= */}

                {isAuthenticated && (
                    <>

                        <div className="site-user-card">

                            <span className="site-online-dot" />


                            <span className="site-user-avatar">

                                {(
                                    user?.nickname ??
                                    user?.username ??
                                    "U"
                                )
                                    .slice(0, 1)
                                    .toUpperCase()}

                            </span>


                            <strong>

                                {user?.nickname ??
                                    user?.username ??
                                    "USER"}

                            </strong>

                        </div>


                        <button
                            type="button"
                            className="
                                site-header-button
                                site-logout-button
                            "
                            onClick={handleLogout}
                        >

                            <LogoutOutlined />

                            <span>
                                로그아웃
                            </span>

                        </button>

                    </>
                )}

            </div>

        </header>
    );
}