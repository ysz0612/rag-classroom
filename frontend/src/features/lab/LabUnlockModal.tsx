import {
    CheckCircleOutlined,
} from "@ant-design/icons";


interface LabUnlockModalProps {
    open: boolean;
    onClose: () => void;
}


export default function LabUnlockModal({
                                           open,
                                           onClose,
                                       }: LabUnlockModalProps) {

    if (!open) {
        return null;
    }


    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 6000,

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                background:
                    "rgba(20, 30, 35, 0.58)",

                backdropFilter:
                    "blur(3px)",
            }}
        >

            <div
                style={{
                    width: 430,

                    padding: 32,

                    boxSizing: "border-box",

                    border:
                        "3px solid #526b70",

                    background:
                        "#f5f1e7",

                    boxShadow:
                        "10px 10px 0 rgba(20, 30, 35, 0.25)",

                    textAlign: "center",
                }}
            >

                <CheckCircleOutlined
                    style={{
                        marginBottom: 14,

                        color: "#58756e",

                        fontSize: 48,
                    }}
                />


                <small
                    style={{
                        display: "block",

                        color: "#71878a",

                        fontSize: 9,

                        fontWeight: 900,

                        letterSpacing: "2px",
                    }}
                >
                    CLASSROOM COMPLETE
                </small>


                <h2
                    style={{
                        margin: "8px 0 12px",

                        color: "#354f55",

                        fontSize: 24,
                    }}
                >
                    학습 완료!
                </h2>


                {/* ★ 원하는 문구가 바로 여기 ★ */}

                <p
                    style={{
                        margin: "0 0 22px",

                        color: "#667b7e",

                        fontSize: 14,

                        lineHeight: 1.8,
                    }}
                >
                    모든 학습을 완료했습니다!

                    <br />

                    이제
                    <strong>
                        {" "}AI 실험실을 이용할 수 있습니다.
                    </strong>
                </p>


                <button
                    type="button"
                    onClick={onClose}
                    style={{
                        minWidth: 110,

                        padding: "10px 20px",

                        border:
                            "2px solid #526b70",

                        background:
                            "#526b70",

                        color: "#ffffff",

                        cursor: "pointer",

                        fontWeight: 900,
                    }}
                >
                    확인
                </button>

            </div>

        </div>
    );
}