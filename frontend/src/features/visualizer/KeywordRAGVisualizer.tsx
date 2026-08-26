import {
    useEffect,
    useMemo,
    useState,
} from "react";

import "./keyword-rag-visualizer.css";


/* =========================================================
   TYPES
========================================================= */

export type KeywordDemoStep =
    | "idle"
    | "question"
    | "extract"
    | "scan"
    | "match"
    | "select"
    | "context"
    | "generating"
    | "answer";


interface KeywordRAGVisualizerProps {
    autoPlay?: boolean;
    paused?: boolean;
    restartKey?: number;
    startStep?: number | null;
    onClose?: () => void;
}


interface KeywordDocument {
    id: number;
    title: string;
    content: string;
}


interface MatchResult extends KeywordDocument {
    matchedKeywords: string[];
    matchCount: number;
    selected: boolean;
}


/* =========================================================
   DEMO DATA

   Classroom 개념 시연용 데이터입니다.
   실제 Amazon 데이터는 실습실에서 별도 사용합니다.
========================================================= */

const QUESTION =
    "Vector RAG에서 cosine similarity는 왜 사용하는 거야?";


const KEYWORDS = [
    "Vector RAG",
    "cosine similarity",
];


const DOCUMENTS: KeywordDocument[] = [
    {
        id: 1,
        title: "Vector RAG",
        content:
            "Vector RAG는 질문과 문서를 임베딩으로 변환하고 cosine similarity를 이용해 의미적으로 가까운 문서를 찾습니다.",
    },
    {
        id: 2,
        title: "Cosine Similarity",
        content:
            "cosine similarity는 두 벡터 사이의 방향을 비교해 유사도를 계산하는 방법입니다.",
    },
    {
        id: 3,
        title: "Keyword RAG",
        content:
            "Keyword RAG는 질문에 포함된 문자열이나 핵심 단어와 문서의 단어가 정확히 일치하는지 확인합니다.",
    },
    {
        id: 4,
        title: "Graph RAG",
        content:
            "Graph RAG는 노드와 관계를 따라가며 연결된 정보를 탐색합니다.",
    },
    {
        id: 5,
        title: "Embedding",
        content:
            "Embedding은 문장이나 단어의 의미적 특징을 숫자 벡터로 표현합니다.",
    },
];


/* =========================================================
   STEP ORDER
========================================================= */

const STEP_ORDER: KeywordDemoStep[] = [
    "question",
    "extract",
    "scan",
    "match",
    "select",
    "context",
    "generating",
    "answer",
];


/* =========================================================
   HELPERS
========================================================= */

function stepReached(
    current: KeywordDemoStep,
    target: KeywordDemoStep,
) {
    if (current === "idle") {
        return false;
    }

    return (
        STEP_ORDER.indexOf(current) >=
        STEP_ORDER.indexOf(target)
    );
}


function normalize(
    value: string,
) {
    return value.toLowerCase();
}


function analyzeDocuments():
    MatchResult[] {

    const results =
        DOCUMENTS.map(
            (document) => {

                const normalized =
                    normalize(
                        `${document.title} ${document.content}`,
                    );

                const matchedKeywords =
                    KEYWORDS.filter(
                        (keyword) =>
                            normalized.includes(
                                normalize(keyword),
                            ),
                    );

                return {
                    ...document,
                    matchedKeywords,
                    matchCount:
                    matchedKeywords.length,
                    selected: false,
                };
            },
        )
            .sort(
                (a, b) =>
                    b.matchCount -
                    a.matchCount,
            );


    return results.map(
        (document, index) => ({
            ...document,
            selected:
                document.matchCount > 0 &&
                index < 3,
        }),
    );
}


function highlightText(
    text: string,
    keywords: string[],
) {
    if (
        !keywords.length
    ) {
        return text;
    }

    const escaped =
        keywords
            .map(
                (keyword) =>
                    keyword.replace(
                        /[.*+?^${}()|[\]\\]/g,
                        "\\$&",
                    ),
            )
            .sort(
                (a, b) =>
                    b.length - a.length,
            );

    const regex =
        new RegExp(
            `(${escaped.join("|")})`,
            "gi",
        );

    return text
        .split(regex)
        .map(
            (piece, index) => {

                const matched =
                    keywords.some(
                        (keyword) =>
                            piece.toLowerCase() ===
                            keyword.toLowerCase(),
                    );

                if (!matched) {
                    return piece;
                }

                return (
                    <mark
                        key={
                            `${piece}-${index}`
                        }
                        className="keyword-highlight"
                    >
                        {piece}
                    </mark>
                );
            },
        );
}


function getStepLabel(
    step: KeywordDemoStep,
) {
    switch (step) {
        case "question":
            return "01 · QUESTION";

        case "extract":
            return "02 · KEYWORD EXTRACT";

        case "scan":
            return "03 · DOCUMENT SCAN";

        case "match":
            return "04 · STRING MATCH";

        case "select":
            return "05 · TOP DOCUMENTS";

        case "context":
            return "06 · CONTEXT";

        case "generating":
            return "07 · LLM";

        case "answer":
            return "08 · ANSWER";

        default:
            return "READY";
    }
}


function getStepSubtitle(
    step: KeywordDemoStep,
) {
    switch (step) {

        case "question":
            return {
                title: "01 · 질문 입력",
                text:
                    "사용자의 질문을 확인합니다. Keyword RAG는 문장 전체의 의미보다 검색에 사용할 단어나 표현을 먼저 찾습니다.",
            };

        case "extract":
            return {
                title: "02 · 키워드 추출",
                text:
                    "질문에서 검색에 중요한 핵심 표현을 추출합니다. 이 시연에서는 'Vector RAG'와 'cosine similarity'를 검색어로 사용합니다.",
            };

        case "scan":
            return {
                title: "03 · 문서 스캔",
                text:
                    "각 문서의 제목과 본문을 순서대로 확인합니다. 질문에서 추출한 키워드가 문서 안에 존재하는지 검사합니다.",
            };

        case "match":
            return {
                title: "04 · 문자열 일치",
                text:
                    "문서 안에서 키워드와 정확히 일치하는 문자열을 찾습니다. 일치한 단어는 형광펜처럼 강조됩니다.",
            };

        case "select":
            return {
                title: "05 · 관련 문서 선택",
                text:
                    "일치한 키워드 수를 기준으로 관련 문서를 추립니다. 정확히 일치하는 표현이 많을수록 우선순위가 높아집니다.",
            };

        case "context":
            return {
                title: "06 · Context 구성",
                text:
                    "선택한 문서의 내용을 모아 LLM에게 전달할 검색 Context를 구성합니다.",
            };

        case "generating":
            return {
                title: "07 · LLM 답변 생성",
                text:
                    "사용자 질문과 Keyword RAG가 찾은 Context를 함께 LLM에 전달해 답변을 생성합니다.",
            };

        case "answer":
            return {
                title: "08 · 최종 답변",
                text:
                    "Keyword RAG는 질문의 핵심 문자열을 문서에서 직접 찾아 관련 정보를 검색하는 방식입니다.",
            };

        default:
            return {
                title: "KEYWORD RAG · READY",
                text:
                    "시작하면 Keyword RAG 검색 과정을 단계별로 보여드립니다.",
            };
    }
}


/* =========================================================
   MAIN
========================================================= */

export default function KeywordRAGVisualizer({
                                                 autoPlay = true,
                                                 paused = false,
                                                 restartKey = 0,
                                                 startStep = null,
                                                 onClose,
                                             }: KeywordRAGVisualizerProps) {

    const documents =
        useMemo(
            () =>
                analyzeDocuments(),
            [],
        );


    const selectedDocuments =
        useMemo(
            () =>
                documents.filter(
                    (document) =>
                        document.selected,
                ),
            [documents],
        );


    const [
        stepIndex,
        setStepIndex,
    ] =
        useState(
            autoPlay
                ? 0
                : -1,
        );


    const step:
        KeywordDemoStep =
        stepIndex < 0
            ? "idle"
            : STEP_ORDER[
                Math.min(
                    stepIndex,
                    STEP_ORDER.length - 1,
                )
                ];


    const subtitle =
        getStepSubtitle(
            step,
        );


    /* =====================================================
       RESTART
    ===================================================== */

    useEffect(
        () => {

            if (
                startStep !== null &&
                Number.isFinite(
                    startStep,
                )
            ) {

                const safeIndex =
                    Math.max(
                        0,
                        Math.min(
                            STEP_ORDER.length - 1,
                            Math.floor(
                                startStep,
                            ),
                        ),
                    );

                setStepIndex(
                    safeIndex,
                );

                return;
            }


            setStepIndex(
                autoPlay
                    ? 0
                    : -1,
            );

        },
        [
            restartKey,
            autoPlay,
            startStep,
        ],
    );


    /* =====================================================
       AUTO PLAY
       자막이 너무 빨리 지나가지 않도록
       일반 단계 약 3초,
       설명이 많은 단계는 더 길게 유지
    ===================================================== */

    useEffect(
        () => {

            if (
                paused ||
                stepIndex < 0 ||
                stepIndex >=
                STEP_ORDER.length - 1
            ) {
                return;
            }


            const delay =

                step === "question"
                    ? 3000

                    : step === "extract"
                        ? 3200

                        : step === "scan"
                            ? 3500

                            : step === "match"
                                ? 3800

                                : step === "select"
                                    ? 3300

                                    : step === "context"
                                        ? 3600

                                        : step === "generating"
                                            ? 4000

                                            : 3500;


            const timer =
                window.setTimeout(
                    () => {

                        setStepIndex(
                            (current) =>
                                Math.min(
                                    current + 1,
                                    STEP_ORDER.length - 1,
                                ),
                        );

                    },
                    delay,
                );


            return () =>
                window.clearTimeout(
                    timer,
                );

        },
        [
            paused,
            step,
            stepIndex,
        ],
    );


    /* =====================================================
       SCAN INDEX
       문서 스캔 단계에서 하나씩 검사되는 느낌
    ===================================================== */

    const scanIndex =
        step === "scan"
            ? Math.min(
                DOCUMENTS.length - 1,
                Math.floor(
                    (
                        Date.now() /
                        700
                    ) %
                    DOCUMENTS.length,
                ),
            )
            : -1;


    return (
        <div className="keyword-demo">

            <style>
                {`
                    @keyframes keywordCaptionFade {
                        from {
                            opacity: 0;
                            transform: translateY(4px);
                        }

                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes keywordScanPulse {
                        0% {
                            transform: translateX(-6px);
                            opacity: 0.35;
                        }

                        50% {
                            transform: translateX(0);
                            opacity: 1;
                        }

                        100% {
                            transform: translateX(6px);
                            opacity: 0.35;
                        }
                    }
                `}
            </style>


            {/* =================================================
                HEADER
            ================================================= */}

            <header className="keyword-demo-header">

                <div>

                    <small>
                        LIVE KEYWORD RAG
                    </small>

                    <h2>
                        Keyword RAG · Retrieval Process
                    </h2>

                </div>


                <div className="keyword-demo-header-right">

                    <span>
                        {getStepLabel(step)}
                    </span>


                    {paused && (
                        <span className="paused">
                            PAUSED
                        </span>
                    )}


                    {onClose && (

                        <button
                            type="button"
                            onClick={onClose}
                        >
                            ×
                        </button>

                    )}

                </div>

            </header>


            {/* =================================================
                PIPELINE
            ================================================= */}

            <div className="keyword-demo-pipeline">

                {STEP_ORDER.map(
                    (
                        pipelineStep,
                        index,
                    ) => {

                        const active =
                            index ===
                            stepIndex;

                        const completed =
                            stepIndex >
                            index;


                        return (
                            <div
                                key={
                                    pipelineStep
                                }
                                className={[
                                    "keyword-pipeline-step",

                                    active
                                        ? "active"
                                        : "",

                                    completed
                                        ? "completed"
                                        : "",

                                ].join(" ")}
                            >

                                <span>
                                    {
                                        String(
                                            index + 1,
                                        ).padStart(
                                            2,
                                            "0",
                                        )
                                    }
                                </span>

                                <b>
                                    {
                                        pipelineStep
                                            .toUpperCase()
                                    }
                                </b>

                            </div>
                        );
                    },
                )}

            </div>


            {/* =================================================
                BODY
            ================================================= */}

            <div
                className="keyword-demo-body"
                style={{
                    gridTemplateColumns:
                        "180px minmax(0, 1.5fr) minmax(250px, 0.72fr)",
                    alignItems:
                        "stretch",
                }}
            >

                {/* ================= LEFT CAPTION ================= */}

                <aside
                    className="keyword-stage-caption"
                    style={{
                        minWidth: 0,
                        padding:
                            "14px 12px",
                        boxSizing:
                            "border-box",
                        border:
                            "1px solid #b9c4c9",
                        borderTop:
                            "5px solid #7b6a3e",
                        background:
                            "#f7f4ee",
                        display:
                            "flex",
                        flexDirection:
                            "column",
                        alignItems:
                            "center",
                        textAlign:
                            "center",
                        gap: 10,
                        overflow:
                            "hidden",
                    }}
                >

                    <small
                        style={{
                            color:
                                "#7c806f",
                            fontFamily:
                                "Consolas, monospace",
                            fontSize: 8,
                            fontWeight: 900,
                            letterSpacing:
                                "1px",
                        }}
                    >
                        CURRENT STEP
                    </small>


                    <strong
                        style={{
                            color:
                                "#b66f36",
                            fontSize: 22,
                            lineHeight: 1,
                        }}
                    >
                        {String(
                            Math.max(
                                1,
                                stepIndex + 1,
                            ),
                        ).padStart(
                            2,
                            "0",
                        )}
                    </strong>


                    <h3
                        style={{
                            margin: 0,
                            color:
                                "#344b50",
                            fontSize: 14,
                            lineHeight: 1.35,
                        }}
                    >
                        {
                            subtitle.title
                                .replace(
                                    /^\d+\s*·\s*/,
                                    "",
                                )
                        }
                    </h3>


                    <div
                        style={{
                            width: "100%",
                            height: 1,
                            background:
                                "#d8d9d2",
                        }}
                    />


                    <p
                        key={step}
                        style={{
                            margin: 0,
                            color:
                                "#5f6f70",
                            fontSize: 11,
                            lineHeight: 1.65,
                            wordBreak:
                                "keep-all",
                            animation:
                                "keywordCaptionFade 240ms ease-out",
                        }}
                    >
                        {subtitle.text}
                    </p>


                    {stepReached(
                        step,
                        "extract",
                    ) && (

                        <div
                            style={{
                                width:
                                    "100%",
                                marginTop:
                                    "auto",
                                display:
                                    "flex",
                                flexWrap:
                                    "wrap",
                                justifyContent:
                                    "center",
                                gap: 5,
                            }}
                        >

                            {KEYWORDS.map(
                                (
                                    keyword,
                                ) => (
                                    <span
                                        key={
                                            keyword
                                        }
                                        style={{
                                            padding:
                                                "4px 6px",
                                            border:
                                                "1px solid #d7c98e",
                                            background:
                                                "#fff4b9",
                                            color:
                                                "#5f5738",
                                            fontSize: 8,
                                            fontWeight:
                                                900,
                                        }}
                                    >
                                        {
                                            keyword
                                        }
                                    </span>
                                ),
                            )}

                        </div>

                    )}

                </aside>


                {/* ================= CENTER ================= */}

                <section className="keyword-demo-stage">

                    {stepReached(
                        step,
                        "question",
                    ) && (

                        <div className="keyword-live-question">

                            <small>
                                USER QUESTION
                            </small>

                            <strong>
                                {QUESTION}
                            </strong>

                        </div>

                    )}


                    {stepReached(
                        step,
                        "extract",
                    ) && (

                        <div className="keyword-extracted-row">

                            <span>
                                EXTRACTED
                            </span>

                            {KEYWORDS.map(
                                (
                                    keyword,
                                ) => (
                                    <b
                                        key={
                                            keyword
                                        }
                                    >
                                        {
                                            keyword
                                        }
                                    </b>
                                ),
                            )}

                        </div>

                    )}


                    <div className="keyword-document-board">

                        <div className="keyword-board-header">

                            <span>
                                DOCUMENT SCANNER
                            </span>

                            <small>
                                exact string matching
                            </small>

                        </div>


                        <div className="keyword-document-list">

                            {documents.map(
                                (
                                    document,
                                    index,
                                ) => {

                                    const showMatched =
                                        stepReached(
                                            step,
                                            "match",
                                        );

                                    const showSelected =
                                        stepReached(
                                            step,
                                            "select",
                                        );

                                    const scanning =
                                        step ===
                                        "scan" &&
                                        index ===
                                        scanIndex;


                                    return (
                                        <article
                                            key={
                                                document.id
                                            }
                                            className={[
                                                "keyword-document-card",

                                                scanning
                                                    ? "scanning"
                                                    : "",

                                                showSelected &&
                                                document.selected
                                                    ? "selected"
                                                    : "",

                                                showSelected &&
                                                !document.selected
                                                    ? "rejected"
                                                    : "",

                                            ].join(
                                                " ",
                                            )}
                                            style={{
                                                animation:
                                                    scanning
                                                        ? "keywordScanPulse 700ms ease-in-out infinite"
                                                        : undefined,
                                            }}
                                        >

                                            <div className="keyword-doc-number">
                                                D{
                                                document.id
                                            }
                                            </div>


                                            <div className="keyword-doc-main">

                                                <strong>
                                                    {
                                                        showMatched
                                                            ? highlightText(
                                                                document.title,
                                                                document.matchedKeywords,
                                                            )
                                                            : document.title
                                                    }
                                                </strong>


                                                <p>
                                                    {
                                                        showMatched
                                                            ? highlightText(
                                                                document.content,
                                                                document.matchedKeywords,
                                                            )
                                                            : document.content
                                                    }
                                                </p>

                                            </div>


                                            <div className="keyword-doc-result">

                                                {!showMatched ? (
                                                    <span>
                                                        {
                                                            scanning
                                                                ? "SCAN"
                                                                : "WAIT"
                                                        }
                                                    </span>
                                                ) : (
                                                    <>

                                                        <b>
                                                            {
                                                                document.matchCount
                                                            }
                                                        </b>

                                                        <small>
                                                            MATCH
                                                        </small>

                                                    </>
                                                )}

                                            </div>

                                        </article>
                                    );
                                },
                            )}

                        </div>

                    </div>

                </section>


                {/* ================= RIGHT ================= */}

                <aside
                    className="keyword-demo-inspector"
                    style={{
                        minHeight: 0,
                        overflow:
                            "hidden",
                    }}
                >

                    <section className="keyword-inspector-section">

                        <small>
                            MATCH STATUS
                        </small>

                        <h3>
                            키워드 일치 결과
                        </h3>


                        <div className="keyword-match-list">

                            {documents.map(
                                (
                                    document,
                                ) => (

                                    <div
                                        key={
                                            document.id
                                        }
                                        className={[
                                            "keyword-match-item",

                                            stepReached(
                                                step,
                                                "select",
                                            ) &&
                                            document.selected
                                                ? "selected"
                                                : "",

                                            stepReached(
                                                step,
                                                "select",
                                            ) &&
                                            !document.selected
                                                ? "rejected"
                                                : "",

                                        ].join(
                                            " ",
                                        )}
                                    >

                                        <span>
                                            D{
                                            document.id
                                        }
                                        </span>


                                        <div>

                                            <strong>
                                                {
                                                    document.title
                                                }
                                            </strong>

                                            <div className="keyword-match-bar">

                                                <i
                                                    style={{
                                                        width:
                                                            stepReached(
                                                                step,
                                                                "match",
                                                            )
                                                                ? `${Math.min(
                                                                    100,
                                                                    document.matchCount /
                                                                    Math.max(
                                                                        1,
                                                                        KEYWORDS.length,
                                                                    ) *
                                                                    100,
                                                                )}%`
                                                                : "0%",
                                                    }}
                                                />

                                            </div>

                                        </div>


                                        <b>
                                            {
                                                stepReached(
                                                    step,
                                                    "match",
                                                )
                                                    ? document.matchCount
                                                    : "-"
                                            }
                                        </b>

                                    </div>

                                ),
                            )}

                        </div>

                    </section>


                    {stepReached(
                        step,
                        "context",
                    ) && (

                        <section
                            className="keyword-context-panel"
                            style={{
                                flexShrink: 0,
                                padding:
                                    "9px 10px",
                                boxSizing:
                                    "border-box",
                                overflow:
                                    "hidden",
                            }}
                        >

                            <small>
                                RETRIEVED CONTEXT
                            </small>

                            <h3
                                style={{
                                    margin:
                                        "3px 0 6px",
                                }}
                            >
                                선택된 문서
                            </h3>


                            <div
                                style={{
                                    display:
                                        "flex",
                                    flexDirection:
                                        "column",
                                    gap: 4,
                                }}
                            >

                                {selectedDocuments.map(
                                    (
                                        document,
                                        index,
                                    ) => (

                                        <div
                                            key={
                                                document.id
                                            }
                                            style={{
                                                minHeight:
                                                    34,
                                                padding:
                                                    "4px 6px",
                                                boxSizing:
                                                    "border-box",
                                                display:
                                                    "grid",
                                                gridTemplateColumns:
                                                    "22px minmax(0, 1fr) 36px",
                                                alignItems:
                                                    "center",
                                                gap: 6,
                                                border:
                                                    "1px solid #d8d7c8",
                                                background:
                                                    index === 0
                                                        ? "#fff8dc"
                                                        : "#f8f7f2",
                                            }}
                                        >

                                            <span
                                                style={{
                                                    width:
                                                        18,
                                                    height:
                                                        18,
                                                    borderRadius:
                                                        "50%",
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    justifyContent:
                                                        "center",
                                                    background:
                                                        "#8a7b47",
                                                    color:
                                                        "#ffffff",
                                                    fontSize:
                                                        8,
                                                    fontWeight:
                                                        900,
                                                }}
                                            >
                                                {
                                                    index + 1
                                                }
                                            </span>


                                            <div
                                                style={{
                                                    minWidth:
                                                        0,
                                                }}
                                            >

                                                <strong
                                                    style={{
                                                        display:
                                                            "block",
                                                        overflow:
                                                            "hidden",
                                                        whiteSpace:
                                                            "nowrap",
                                                        textOverflow:
                                                            "ellipsis",
                                                        color:
                                                            "#374b4e",
                                                        fontSize:
                                                            8,
                                                        lineHeight:
                                                            1.2,
                                                    }}
                                                >
                                                    {
                                                        document.title
                                                    }
                                                </strong>

                                                <p
                                                    style={{
                                                        margin:
                                                            "2px 0 0",
                                                        overflow:
                                                            "hidden",
                                                        whiteSpace:
                                                            "nowrap",
                                                        textOverflow:
                                                            "ellipsis",
                                                        color:
                                                            "#75766e",
                                                        fontSize:
                                                            7,
                                                        lineHeight:
                                                            1.15,
                                                    }}
                                                >
                                                    {
                                                        document.content
                                                    }
                                                </p>

                                            </div>


                                            <b
                                                style={{
                                                    textAlign:
                                                        "right",
                                                    color:
                                                        "#786a39",
                                                    fontSize:
                                                        8,
                                                }}
                                            >
                                                {
                                                    document.matchCount
                                                }
                                                ×
                                            </b>

                                        </div>

                                    ),
                                )}

                            </div>

                        </section>

                    )}

                </aside>

            </div>


            {/* =================================================
                LLM FLOW
            ================================================= */}

            {stepReached(
                step,
                "generating",
            ) && (

                <div className="keyword-llm-flow">

                    <div>
                        QUESTION
                    </div>

                    <span>
                        +
                    </span>

                    <div>
                        KEYWORD CONTEXT
                    </div>

                    <span>
                        →
                    </span>

                    <div className="llm-node">
                        LLM
                    </div>

                    <span>
                        →
                    </span>


                    {stepReached(
                        step,
                        "answer",
                    ) ? (

                        <strong>
                            Keyword RAG는 질문에서
                            핵심 문자열을 찾고,
                            그 표현이 포함된 문서를
                            우선적으로 검색합니다.
                        </strong>

                    ) : (

                        <strong className="generating">
                            답변 생성 중...
                        </strong>

                    )}

                </div>

            )}

        </div>
    );
}