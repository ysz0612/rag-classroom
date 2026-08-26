import {
    BookOutlined,
    ExperimentOutlined,
    SearchOutlined,
    LockOutlined,
} from "@ant-design/icons";

import {
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    useAuth,
} from "../features/auth/AuthContext";

import {
    isLabUnlocked,
} from "../features/lab/labAccess";

import LoginModal
    from "../features/auth/LoginModal";

import SignupModal
    from "../features/auth/SignupModal";

import SiteHeader
    from "../layout/SiteHeader";

import "../styles/home.css";


type Destination =
    | "/classroom"
    | "/lab"
    | null;


export default function HomePage() {

    const navigate =
        useNavigate();


    const {
        isAuthenticated,
        user,
    } = useAuth();


    const [
        loginOpen,
        setLoginOpen,
    ] = useState(false);


    const [
        signupOpen,
        setSignupOpen,
    ] = useState(false);


    const [
        destination,
        setDestination,
    ] = useState<Destination>(
        null,
    );


    const [
        labLockedNoticeOpen,
        setLabLockedNoticeOpen,
    ] = useState(false);


    /*
     * 현재 로그인 사용자의
     * AI 실험실 잠금 해제 여부
     */
    const labUnlocked =
        !!user &&
        isLabUnlocked(
            user.id,
        );


    /* =====================================================
       공간 입장
    ===================================================== */

    const enterArea = (
        path: "/classroom" | "/lab",
    ) => {

        /*
         * 로그인하지 않은 상태
         */
        if (!isAuthenticated) {

            setDestination(path);

            setLoginOpen(true);

            return;
        }


        /*
         * 실험실이 잠겨 있는 경우
         *
         * Classroom으로 이동시키지 않고
         * 현재 Home에 그대로 둡니다.
         */
        if (
            path === "/lab" &&
            !labUnlocked
        ) {

            setLabLockedNoticeOpen(
                true,
            );

            return;
        }


        navigate(path);
    };


    /* =====================================================
       로그인 열기
    ===================================================== */

    const openLogin = () => {

        setSignupOpen(false);

        setLoginOpen(true);
    };


    /* =====================================================
       회원가입 열기
    ===================================================== */

    const openSignup = () => {

        setLoginOpen(false);

        setSignupOpen(true);
    };


    /* =====================================================
       로그인 성공
    ===================================================== */

    const handleLoginSuccess = () => {

        setLoginOpen(false);


        if (!destination) {
            return;
        }


        const target =
            destination;


        setDestination(null);


        /*
         * 로그인 전에 Lab을 눌렀던 경우에는
         * 바로 /lab으로 보내지 않습니다.
         *
         * LabGuard에서도 최종적으로 보호하지만
         * Home UX에서는 안내창만 보여줍니다.
         */
        if (target === "/lab") {

            /*
             * 로그인 성공 직후에는 AuthContext의
             * user 상태가 갱신되는 시간이 필요할 수 있으므로
             * Home에 그대로 남깁니다.
             *
             * 사용자가 다시 Lab 문을 누르면
             * 정상적으로 잠금 여부를 검사합니다.
             */
            return;
        }


        navigate(target);
    };


    return (
        <div className="home-world">

            {/* =================================================
                공통 HEADER
            ================================================= */}

            <SiteHeader
                onLogin={openLogin}
                onSignup={openSignup}
            />


            {/* =================================================
                복도
            ================================================= */}

            <main className="home-corridor">

                {/* 천장 */}

                <div className="corridor-ceiling" />


                {/* =================================================
                    중앙 조명
                ================================================= */}

                <div className="corridor-main-lamp">

                    <span className="lamp-cable" />

                    <span className="lamp-cap" />

                    <span className="lamp-light" />

                    <span className="lamp-light-glow" />

                </div>


                {/* =================================================
                    왼쪽 - 학습실
                ================================================= */}

                <section
                    className="
                        portal-zone
                        portal-left
                    "
                >

                    <div className="portal-sign">

                        <BookOutlined />

                        <div>

                            <small>
                                RAG CLASSROOM
                            </small>

                            <strong>
                                학습하기
                            </strong>

                        </div>

                    </div>


                    <div className="portal-frame">

                        <button
                            type="button"
                            className="
                                portal-door
                                blue-door
                            "
                            onClick={() =>
                                enterArea(
                                    "/classroom",
                                )
                            }
                        >

                            <span className="portal-glass">

                                <i className="shine-a" />

                                <i className="shine-b" />

                            </span>


                            <span
                                className="
                                    door-inner-panel
                                    panel-a
                                "
                            />


                            <span
                                className="
                                    door-inner-panel
                                    panel-b
                                "
                            />


                            <span className="gold-handle">

                                <i />

                            </span>

                        </button>

                    </div>


                    <button
                        type="button"
                        className="
                            portal-mat
                            blue-mat
                        "
                        onClick={() =>
                            enterArea(
                                "/classroom",
                            )
                        }
                    >
                        ENTER
                    </button>

                </section>


                {/* =================================================
                    오른쪽 - 실험실
                ================================================= */}

                <section
                    className="
                        portal-zone
                        portal-right
                    "
                >

                    <div className="portal-sign">

                        <ExperimentOutlined />

                        <div>

                            <small>
                                RAG LAB
                            </small>

                            <strong>
                                실험하기
                            </strong>

                        </div>

                    </div>


                    <div
                        className="portal-frame"
                        style={{
                            position:
                                "relative",
                        }}
                    >

                        <button
                            type="button"
                            className="
                                portal-door
                                green-door
                            "
                            onClick={() =>
                                enterArea(
                                    "/lab",
                                )
                            }
                        >

                            <span className="portal-glass">

                                <i className="shine-a" />

                                <i className="shine-b" />

                            </span>


                            <span
                                className="
                                    door-inner-panel
                                    panel-a
                                "
                            />


                            <span
                                className="
                                    door-inner-panel
                                    panel-b
                                "
                            />


                            <span className="gold-handle">

                                <i />

                            </span>

                        </button>


                        {/* =========================================
                            실험실 잠김 상태
                        ========================================== */}

                        {!labUnlocked && (

                            <>

                                {/* 문에 걸린 자물쇠 */}

                                <div
                                    style={{
                                        position:
                                            "absolute",

                                        left: "50%",
                                        top: "48%",

                                        zIndex: 20,

                                        transform:
                                            "translate(-50%, -50%)",

                                        width: 58,
                                        height: 58,

                                        display:
                                            "flex",

                                        alignItems:
                                            "center",

                                        justifyContent:
                                            "center",

                                        boxSizing:
                                            "border-box",

                                        border:
                                            "3px solid #725f3d",

                                        borderRadius:
                                            "9px",

                                        background:
                                            "#d6b665",

                                        boxShadow:
                                            "4px 5px 0 rgba(58, 47, 29, 0.28)",

                                        color:
                                            "#57472d",

                                        pointerEvents:
                                            "none",
                                    }}
                                >

                                    <LockOutlined
                                        style={{
                                            fontSize: 29,
                                        }}
                                    />

                                </div>


                                {/* 문 앞 표지판 */}

                                <div
                                    style={{
                                        position:
                                            "absolute",

                                        left: "50%",
                                        bottom: "-24px",

                                        zIndex: 30,

                                        transform:
                                            "translateX(-50%) rotate(-2deg)",

                                        width: 158,

                                        padding:
                                            "8px 10px",

                                        boxSizing:
                                            "border-box",

                                        border:
                                            "3px solid #715d3d",

                                        background:
                                            "#efe0a8",

                                        boxShadow:
                                            "4px 4px 0 rgba(61, 49, 30, 0.22)",

                                        color:
                                            "#5d4c30",

                                        fontSize: 11,

                                        fontWeight: 900,

                                        textAlign:
                                            "center",

                                        whiteSpace:
                                            "nowrap",

                                        pointerEvents:
                                            "none",
                                    }}
                                >
                                    학습을 끝내주세요!
                                </div>

                            </>

                        )}

                    </div>


                    <button
                        type="button"
                        className="
                            portal-mat
                            green-mat
                        "
                        onClick={() =>
                            enterArea(
                                "/lab",
                            )
                        }
                    >
                        ENTER
                    </button>

                </section>


                {/* =================================================
                    중앙 RAG
                ================================================= */}

                <section className="corridor-center">

                    <div className="rag-title-block">

                        <span>
                            RAG LEARNING SYSTEM
                        </span>

                        <h1>
                            RAG
                        </h1>


                        <div className="rag-ornament">

                            <i />

                            <b />

                            <i />

                        </div>


                        <p>

                            하나의 질문을

                            <br />

                            <strong>
                                단어 · 의미 · 관계
                            </strong>

                            로 다르게 검색합니다.

                        </p>

                    </div>


                    <div className="corridor-welcome-board">

                        <span>
                            WELCOME
                        </span>

                        <small>
                            TO
                        </small>

                        <strong>
                            RAG WORLD!
                        </strong>


                        <div className="welcome-face">
                            ◉‿◉
                        </div>

                    </div>

                </section>


                {/* =================================================
                    왼쪽 게시판
                ================================================= */}

                <aside
                    className="
                        pixel-board
                        notice
                    "
                >

                    <strong>
                        NOTICE
                    </strong>


                    <div className="memo-grid">

                        <i />

                        <i />

                        <i />

                        <i />

                    </div>

                </aside>


                {/* =================================================
                    오른쪽 안내판
                ================================================= */}

                <aside
                    className="
                        pixel-board
                        lab-guide
                    "
                >

                    <strong>
                        RAG
                        <br />
                        LAB GUIDE
                    </strong>


                    <span className="keyword">
                        ◆ KEYWORD
                    </span>

                    <span className="vector">
                        ◆ VECTOR
                    </span>

                    <span className="graph">
                        ◆ GRAPH
                    </span>

                </aside>


                {/* =================================================
                    벽 조명
                ================================================= */}

                <div
                    className="
                        side-lamp
                        lamp-left
                    "
                >

                    <i className="lamp-top" />

                    <i className="lamp-body" />

                    <i className="lamp-bottom" />

                </div>


                <div
                    className="
                        side-lamp
                        lamp-right
                    "
                >

                    <i className="lamp-top" />

                    <i className="lamp-body" />

                    <i className="lamp-bottom" />

                </div>


                {/* =================================================
                    화분
                ================================================= */}

                <div
                    className="
                        css-plant
                        plant-left
                    "
                >

                    <div className="css-leaves">

                        <i />

                        <i />

                        <i />

                        <i />

                        <i />

                    </div>


                    <div className="css-pot" />

                </div>


                <div
                    className="
                        css-plant
                        plant-right
                    "
                >

                    <div className="css-leaves">

                        <i />

                        <i />

                        <i />

                        <i />

                        <i />

                    </div>


                    <div className="css-pot" />

                </div>


                {/* =================================================
                    목재 벽 / 바닥
                ================================================= */}

                <div className="corridor-wood-wall" />

                <div className="corridor-floor" />

            </main>


            {/* =================================================
                하단 메뉴
            ================================================= */}

            <section className="home-feature-bar">

                {/* LEARN */}

                <button
                    type="button"
                    className="feature-card"
                    onClick={() =>
                        enterArea(
                            "/classroom",
                        )
                    }
                >

                    <span className="feature-number">
                        01
                    </span>


                    <BookOutlined />


                    <div>

                        <strong>
                            LEARN
                        </strong>

                        <p>
                            컴퓨터가 있는
                            인터랙티브 RAG 강의실
                        </p>

                    </div>


                    <span className="feature-action">
                        바로가기 →
                    </span>

                </button>


                {/* COMPARE */}

                <div className="feature-card">

                    <span className="feature-number">
                        02
                    </span>


                    <SearchOutlined />


                    <div>

                        <strong>
                            COMPARE
                        </strong>

                        <p>
                            Keyword · Vector · Graph
                            검색 방식 비교
                        </p>

                    </div>

                </div>


                {/* PRACTICE */}

                <button
                    type="button"
                    className="feature-card"
                    onClick={() =>
                        enterArea(
                            "/lab",
                        )
                    }
                >

                    <span className="feature-number">
                        03
                    </span>


                    <ExperimentOutlined />


                    <div>

                        <strong>
                            PRACTICE
                        </strong>

                        <p>
                            실제 RAG 모델에게
                            직접 질문하며 실습
                        </p>

                    </div>


                    <span className="feature-action">
                        {labUnlocked
                            ? "바로가기 →"
                            : "🔒 잠김"}
                    </span>

                </button>

            </section>


            {/* =================================================
                실험실 잠김 안내
            ================================================= */}

            {labLockedNoticeOpen && (

                <div
                    onClick={() =>
                        setLabLockedNoticeOpen(
                            false,
                        )
                    }
                    style={{
                        position:
                            "fixed",

                        inset: 0,

                        zIndex: 7000,

                        display:
                            "flex",

                        alignItems:
                            "center",

                        justifyContent:
                            "center",

                        background:
                            "rgba(25, 34, 35, 0.5)",

                        backdropFilter:
                            "blur(2px)",
                    }}
                >

                    <div
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                        style={{
                            width: 380,

                            padding: 28,

                            boxSizing:
                                "border-box",

                            border:
                                "3px solid #58686a",

                            background:
                                "#f6f0df",

                            boxShadow:
                                "8px 8px 0 rgba(30, 40, 42, 0.22)",

                            textAlign:
                                "center",
                        }}
                    >

                        <LockOutlined
                            style={{
                                marginBottom: 12,

                                color:
                                    "#596b6e",

                                fontSize: 38,
                            }}
                        />


                        <small
                            style={{
                                display:
                                    "block",

                                color:
                                    "#7a898b",

                                fontSize: 9,

                                fontWeight: 900,

                                letterSpacing:
                                    "2px",
                            }}
                        >
                            RAG LAB · LOCKED
                        </small>


                        <h2
                            style={{
                                margin:
                                    "7px 0 10px",

                                color:
                                    "#415457",
                            }}
                        >
                            아직 들어갈 수 없어요!
                        </h2>


                        <p
                            style={{
                                margin: 0,

                                color:
                                    "#68787a",

                                fontSize: 13,

                                lineHeight: 1.7,
                            }}
                        >
                            Classroom의 학습을
                            모두 완료하면

                            <br />

                            실험실의 자물쇠와
                            표지판이 사라집니다.
                        </p>


                        <strong
                            style={{
                                display:
                                    "block",

                                margin:
                                    "14px 0 20px",

                                color:
                                    "#596b6e",
                            }}
                        >
                            학습을 끝내주세요!
                        </strong>


                        <button
                            type="button"
                            onClick={() =>
                                setLabLockedNoticeOpen(
                                    false,
                                )
                            }
                            style={{
                                minWidth: 100,

                                padding:
                                    "9px 22px",

                                border:
                                    "2px solid #586b6e",

                                background:
                                    "#586b6e",

                                color:
                                    "#ffffff",

                                cursor:
                                    "pointer",

                                fontWeight: 900,
                            }}
                        >
                            확인
                        </button>

                    </div>

                </div>

            )}


            {/* =================================================
                로그인 Modal
            ================================================= */}

            <LoginModal
                open={loginOpen}
                onClose={() =>
                    setLoginOpen(false)
                }
                onSignup={openSignup}
                onSuccess={
                    handleLoginSuccess
                }
            />


            {/* =================================================
                회원가입 Modal
            ================================================= */}

            <SignupModal
                open={signupOpen}
                onClose={() =>
                    setSignupOpen(false)
                }
                onLogin={openLogin}
            />

        </div>
    );
}