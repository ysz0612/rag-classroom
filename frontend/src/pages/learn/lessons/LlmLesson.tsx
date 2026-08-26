import { MessageOutlined } from "@ant-design/icons";

interface LlmLessonProps {
    pageIndex: number;
    totalPages: number;
}

export default function LlmLesson({ pageIndex, totalPages }: LlmLessonProps) {
    return (
            <div className="lesson-screen llm-screen">

                {/* ================= HEADER ================= */}

                <div className="lesson-screen-header">
                    <span>01. LLM</span>

                    <span>
                        {pageIndex + 1}
                        {" / "}
                        {totalPages}
                    </span>
                </div>


                {/* =================================================
                   PAGE 01
                   LLM이란?
                ================================================= */}

                {pageIndex === 0 && (
                    <div className="llm-slide llm-intro-slide">

                        <div className="llm-slide-top">

                            <div className="llm-section-number">
                                01.
                            </div>

                            <div>
                                <div className="llm-small-title">
                                    LARGE LANGUAGE MODEL
                                </div>

                                <h1>
                                    LLM
                                    <span>
                                        (대규모 언어 모델)
                                    </span>
                                    이란?
                                </h1>
                            </div>

                        </div>


                        <div className="llm-definition">

                            <strong>
                                많은 양의 데이터로
                                사전 학습된 딥러닝 모델
                            </strong>

                            <p>
                                학습한 패턴과 지식을 토대로
                                다음에 올 내용을 예측해
                                답변을 생성합니다.
                            </p>

                        </div>


                        <div className="llm-prediction-area">

                            {/* 사용자 입력 */}

                            <div className="llm-input-card">

                                <div className="llm-card-label">
                                    INPUT
                                </div>

                                <MessageOutlined />

                                <strong>
                                    "오늘 날씨가 정말"
                                </strong>

                                <span>
                                    사용자 입력
                                </span>

                            </div>


                            <div className="llm-flow-arrow">
                                →
                            </div>


                            {/* LLM */}

                            <div className="llm-model-box">

                                <div className="llm-model-grid">

                                    <span />
                                    <span />
                                    <span />

                                    <span />
                                    <strong>
                                        LLM
                                    </strong>
                                    <span />

                                    <span />
                                    <span />
                                    <span />

                                </div>

                                <small>
                                    학습된 패턴
                                </small>

                            </div>


                            <div className="llm-flow-arrow">
                                →
                            </div>


                            {/* 다음 토큰 예측 */}

                            <div className="llm-output-card">

                                <div className="llm-card-label">
                                    PREDICTION
                                </div>

                                <div className="prediction-options">

                                    <div className="prediction-row best">
                                        <span>좋네요</span>

                                        <div>
                                            <i
                                                style={{
                                                    width: "82%",
                                                }}
                                            />
                                        </div>

                                        <strong>
                                            82%
                                        </strong>
                                    </div>


                                    <div className="prediction-row">

                                        <span>춥네요</span>

                                        <div>
                                            <i
                                                style={{
                                                    width: "12%",
                                                }}
                                            />
                                        </div>

                                        <strong>
                                            12%
                                        </strong>
                                    </div>


                                    <div className="prediction-row">

                                        <span>멀어요</span>

                                        <div>
                                            <i
                                                style={{
                                                    width: "6%",
                                                }}
                                            />
                                        </div>

                                        <strong>
                                            6%
                                        </strong>
                                    </div>

                                </div>

                            </div>

                        </div>


                        <div className="llm-key-message">

                            <span className="llm-key-icon">
                                ✦
                            </span>

                            <div>
                                <small>
                                    핵심
                                </small>

                                <strong>
                                    LLM은 문장을 외워서
                                    꺼내는 것이 아니라,
                                    다음에 올 가능성이 높은
                                    내용을 예측합니다.
                                </strong>
                            </div>

                        </div>

                    </div>
                )}


                {/* =================================================
                   PAGE 02
                   LLM의 한계
                ================================================= */}

                {pageIndex === 1 && (
                    <div className="llm-slide llm-limit-slide">

                        <div className="llm-slide-top">

                            <div className="llm-section-number">
                                02.
                            </div>

                            <div>
                                <div className="llm-small-title">
                                    WHY RAG?
                                </div>

                                <h1>
                                    LLM의 한계
                                </h1>
                            </div>

                        </div>


                        <div className="limit-layout">

                            {/* 왼쪽 LLM */}

                            <div className="limit-model-side">

                                <div className="limit-model">

                                    <div className="limit-model-head">
                                        LLM
                                    </div>

                                    <div className="limit-brain">

                                        <span>?</span>

                                    </div>

                                    <p>
                                        학습된 지식만으로
                                        답변 생성
                                    </p>

                                </div>

                            </div>


                            {/* 오른쪽 문제 */}

                            <div className="limit-problems">

                                <div className="limit-card">

                                    <div className="limit-number">
                                        01
                                    </div>

                                    <div>
                                        <strong>
                                            최신 정보
                                        </strong>

                                        <span>
                                            학습하지 않은
                                            새로운 정보는 모를 수 있음
                                        </span>
                                    </div>

                                </div>


                                <div className="limit-card">

                                    <div className="limit-number">
                                        02
                                    </div>

                                    <div>
                                        <strong>
                                            내부 데이터
                                        </strong>

                                        <span>
                                            우리 회사나 서비스만의
                                            데이터를 자동으로 알지 못함
                                        </span>
                                    </div>

                                </div>


                                <div className="limit-card danger">

                                    <div className="limit-number">
                                        03
                                    </div>

                                    <div>
                                        <strong>
                                            Hallucination
                                        </strong>

                                        <span>
                                            사실처럼 보이지만
                                            잘못된 정보를 생성할 수 있음
                                        </span>
                                    </div>

                                </div>


                                <div className="limit-card">

                                    <div className="limit-number">
                                        04
                                    </div>

                                    <div>
                                        <strong>
                                            근거 확인
                                        </strong>

                                        <span>
                                            답변이 어떤 정보를
                                            근거로 했는지 불분명할 수 있음
                                        </span>
                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* 다음 장 RAG 연결 */}

                        <div className="rag-preview">

                            <div className="rag-preview-question">
                                그렇다면...
                            </div>

                            <strong>
                                필요한 정보를 먼저 찾아서
                                LLM에게 전달하면 어떨까?
                            </strong>

                            <div className="rag-preview-flow">

                                <span>
                                    질문
                                </span>

                                <b>→</b>

                                <span className="highlight">
                                    검색
                                </span>

                                <b>→</b>

                                <span>
                                    관련 정보
                                </span>

                                <b>→</b>

                                <span>
                                    LLM
                                </span>

                                <b>→</b>

                                <span>
                                    답변
                                </span>

                            </div>

                        </div>

                    </div>
                )}

            </div>
    );
}
