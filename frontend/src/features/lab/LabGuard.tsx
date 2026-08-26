import {
    useNavigate,
} from "react-router-dom";

import {
    LockOutlined,
    HomeOutlined,
} from "@ant-design/icons";

import {
    useAuth,
} from "../auth/AuthContext";

import {
    isLabUnlocked,
} from "./labAccess";


interface LabGuardProps {
    children: React.ReactNode;
}


export default function LabGuard({
                                     children,
                                 }: LabGuardProps) {

    const navigate =
        useNavigate();


    const {
        user,
        loading,
    } = useAuth();


    if (loading) {
        return null;
    }


    if (!user) {

        navigate(
            "/",
            {
                replace: true,
            },
        );

        return null;
    }


    const unlocked =
        isLabUnlocked(
            user.id,
        );


    /*
     * 주소창으로 /lab을 직접 입력했을 때
     *
     * Classroom으로 보내지 않고
     * 잠겨 있다는 화면만 보여줍니다.
     */
    if (!unlocked) {

        return (
            <div
                style={{
                    minHeight: "100vh",

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    background:
                        "#e9e3d6",

                    fontFamily:
                        "inherit",
                }}
            >

                <div
                    style={{
                        width: 420,

                        padding:
                            "36px 30px",

                        boxSizing:
                            "border-box",

                        textAlign:
                            "center",

                        border:
                            "3px solid #4f6265",

                        background:
                            "#f6f0df",

                        boxShadow:
                            "10px 10px 0 rgba(45, 57, 59, 0.18)",
                    }}
                >

                    <LockOutlined
                        style={{
                            marginBottom: 18,

                            color:
                                "#596c70",

                            fontSize: 48,
                        }}
                    />


                    <small
                        style={{
                            display:
                                "block",

                            marginBottom: 8,

                            color:
                                "#77878a",

                            fontSize: 10,

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
                                "0 0 12px",

                            color:
                                "#3f5255",

                            fontSize: 23,
                        }}
                    >
                        실험실이 잠겨있습니다
                    </h2>


                    <p
                        style={{
                            margin:
                                "0 0 22px",

                            color:
                                "#68787a",

                            fontSize: 13,

                            lineHeight: 1.7,
                        }}
                    >
                        AI 실험실은 Classroom의
                        모든 학습을 완료한 후
                        이용할 수 있습니다.
                        <br />

                        <strong>
                            학습을 끝내주세요!
                        </strong>
                    </p>


                    <button
                        type="button"
                        onClick={() =>
                            navigate("/")
                        }
                        style={{
                            padding:
                                "10px 18px",

                            border:
                                "2px solid #506467",

                            background:
                                "#506467",

                            color:
                                "#ffffff",

                            cursor:
                                "pointer",

                            fontWeight: 900,
                        }}
                    >
                        <HomeOutlined />

                        {" "}

                        홈으로 돌아가기
                    </button>

                </div>

            </div>
        );
    }


    return children;
}