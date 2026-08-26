import {
    Canvas,
    useFrame,
} from "@react-three/fiber";

import {
    Line,
    OrbitControls,
    Text,
} from "@react-three/drei";

import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import * as THREE from "three";

import "./vector-rag-visualizer.css";


/* =========================================================
   TYPES
========================================================= */

export type VectorDemoStep =
    | "idle"
    | "question"
    | "embedding"
    | "projecting"
    | "similarity"
    | "topk"
    | "context"
    | "generating"
    | "answer";


interface VectorRAGVisualizerProps {
    autoPlay?: boolean;
    paused?: boolean;
    restartKey?: number;
    onClose?: () => void;
}


interface DocumentPoint {
    id: number;
    title: string;
    content: string;

    embedding: number[];

    position: [
        number,
        number,
        number
    ];
}


interface RankedDocument extends DocumentPoint {
    similarity: number;
    rank: number;
}


/* =========================================================
   DEMO DATA

   현재는 프론트 동작 테스트용.
   이후 FastAPI에서 실제 pgvector 데이터를 받아
   그대로 교체할 수 있습니다.
========================================================= */

const QUESTION =
    "두 데이터가 얼마나 비슷한지 계산하는 방법은?";


const QUESTION_EMBEDDING = [
    0.82,
    0.31,
    0.61,
    0.17,
    0.44,
    0.73,
];


const QUESTION_POSITION: [
    number,
    number,
    number
] = [
    0.15,
    0.1,
    0.25,
];


const DOCUMENTS: DocumentPoint[] = [

    {
        id: 1,

        title:
            "Cosine Similarity",

        content:
            "두 벡터 사이의 각도를 이용하여 방향의 유사성을 계산합니다.",

        embedding: [
            0.79,
            0.34,
            0.64,
            0.21,
            0.42,
            0.69,
        ],

        position: [
            0.72,
            0.42,
            0.58,
        ],
    },


    {
        id: 2,

        title:
            "Vector Similarity",

        content:
            "벡터 사이의 유사도를 계산하여 관련된 데이터를 검색합니다.",

        embedding: [
            0.72,
            0.29,
            0.58,
            0.28,
            0.49,
            0.62,
        ],

        position: [
            0.95,
            -0.12,
            0.37,
        ],
    },


    {
        id: 3,

        title:
            "Semantic Search",

        content:
            "문장의 표현보다 의미적 유사성을 기준으로 관련 문서를 찾습니다.",

        embedding: [
            0.67,
            0.38,
            0.53,
            0.36,
            0.55,
            0.59,
        ],

        position: [
            0.55,
            -0.72,
            0.72,
        ],
    },


    {
        id: 4,

        title:
            "Database Index",

        content:
            "데이터베이스에서 검색 성능을 높이기 위한 인덱스 구조입니다.",

        embedding: [
            -0.31,
            0.62,
            0.13,
            0.75,
            -0.22,
            0.18,
        ],

        position: [
            -1.05,
            0.92,
            -0.48,
        ],
    },


    {
        id: 5,

        title:
            "Keyword Matching",

        content:
            "질문의 단어와 문서에 포함된 문자열을 기준으로 검색합니다.",

        embedding: [
            0.11,
            -0.53,
            0.32,
            -0.21,
            0.64,
            -0.42,
        ],

        position: [
            -1.28,
            -0.78,
            0.88,
        ],
    },


    {
        id: 6,

        title:
            "Graph Traversal",

        content:
            "노드와 관계를 따라가며 연결된 정보를 탐색합니다.",

        embedding: [
            -0.45,
            0.17,
            -0.52,
            0.48,
            0.21,
            -0.63,
        ],

        position: [
            1.42,
            1.18,
            -1.05,
        ],
    },

];


/* =========================================================
   COSINE SIMILARITY
========================================================= */

function cosineSimilarity(
    a: number[],
    b: number[],
) {

    const length =
        Math.min(
            a.length,
            b.length,
        );


    let dot = 0;

    let magnitudeA = 0;

    let magnitudeB = 0;


    for (
        let index = 0;
        index < length;
        index += 1
    ) {

        dot +=
            a[index] *
            b[index];

        magnitudeA +=
            a[index] *
            a[index];

        magnitudeB +=
            b[index] *
            b[index];
    }


    if (
        magnitudeA === 0 ||
        magnitudeB === 0
    ) {
        return 0;
    }


    return (
        dot /
        (
            Math.sqrt(magnitudeA) *
            Math.sqrt(magnitudeB)
        )
    );
}


/* =========================================================
   RANK DOCUMENTS
========================================================= */

function rankDocuments():
    RankedDocument[] {

    return DOCUMENTS
        .map(
            (document) => ({

                ...document,

                similarity:
                    cosineSimilarity(
                        QUESTION_EMBEDDING,
                        document.embedding,
                    ),

                rank: 0,

            }),
        )
        .sort(
            (a, b) =>
                b.similarity -
                a.similarity,
        )
        .map(
            (document, index) => ({

                ...document,

                rank:
                    index + 1,

            }),
        );
}


/* =========================================================
   STEP ORDER
========================================================= */

const STEP_ORDER:
    VectorDemoStep[] = [

    "question",
    "embedding",
    "projecting",
    "similarity",
    "topk",
    "context",
    "generating",
    "answer",

];


/* =========================================================
   STEP INDEX
========================================================= */

function stepReached(
    current: VectorDemoStep,
    target: VectorDemoStep,
) {

    if (current === "idle") {
        return false;
    }


    return (
        STEP_ORDER.indexOf(current) >=
        STEP_ORDER.indexOf(target)
    );
}


/* =========================================================
   QUESTION POINT
========================================================= */

function QuestionPoint({
                           visible,
                       }: {
    visible: boolean;
}) {

    const ref =
        useRef<THREE.Group>(null);


    useFrame(
        (_, delta) => {

            if (!ref.current) {
                return;
            }


            const targetScale =
                visible
                    ? 1
                    : 0;


            const current =
                ref.current.scale.x;


            const next =
                THREE.MathUtils.lerp(
                    current,
                    targetScale,
                    delta * 5,
                );


            ref.current.scale.set(
                next,
                next,
                next,
            );

        },
    );


    return (
        <group
            ref={ref}
            position={
                QUESTION_POSITION
            }
            scale={[
                0,
                0,
                0,
            ]}
        >

            <mesh>

                <sphereGeometry
                    args={[
                        0.15,
                        32,
                        32,
                    ]}
                />

                <meshStandardMaterial
                    color="#d79a3e"
                    emissive="#805b24"
                    emissiveIntensity={0.18}
                />

            </mesh>


            <Text
                position={[
                    0,
                    0.25,
                    0,
                ]}
                fontSize={0.11}
                color="#273f4e"
                anchorX="center"
            >
                QUERY
            </Text>

        </group>
    );
}


/* =========================================================
   DOCUMENT POINT
========================================================= */

function DocumentNode({
                          document,
                          showSimilarity,
                          topK,
                      }: {
    document: RankedDocument;
    showSimilarity: boolean;
    topK: boolean;
}) {

    const selected =
        document.rank <= 3;


    const opacity =
        topK && !selected
            ? 0.13
            : 1;


    const pointColor =
        selected
            ? "#5f8e6a"
            : "#69859a";


    return (
        <group
            position={
                document.position
            }
        >

            <mesh>

                <sphereGeometry
                    args={[
                        selected
                            ? 0.105
                            : 0.085,
                        24,
                        24,
                    ]}
                />

                <meshStandardMaterial
                    color={pointColor}
                    transparent
                    opacity={opacity}
                />

            </mesh>


            <Text
                position={[
                    0,
                    0.19,
                    0,
                ]}
                fontSize={0.075}
                color={
                    topK && !selected
                        ? "#a7adb0"
                        : "#3b5361"
                }
                anchorX="center"
            >
                {`D${document.id}`}
            </Text>


            {showSimilarity && (

                <Text
                    position={[
                        0,
                        -0.18,
                        0,
                    ]}
                    fontSize={0.07}
                    color={
                        selected
                            ? "#527c58"
                            : "#77848b"
                    }
                    anchorX="center"
                >
                    {
                        document.similarity
                            .toFixed(3)
                    }
                </Text>

            )}

        </group>
    );
}


/* =========================================================
   CONNECTION
========================================================= */

function SimilarityConnection({
                                  document,
                                  visible,
                                  topK,
                              }: {
    document: RankedDocument;
    visible: boolean;
    topK: boolean;
}) {

    if (!visible) {
        return null;
    }


    const selected =
        document.rank <= 3;


    if (
        topK &&
        !selected
    ) {
        return null;
    }


    return (
        <Line
            points={[
                QUESTION_POSITION,
                document.position,
            ]}
            color={
                selected
                    ? "#6d9270"
                    : "#a7b0b5"
            }
            lineWidth={
                selected
                    ? 2
                    : 1
            }
            transparent
            opacity={
                selected
                    ? 0.9
                    : 0.35
            }
            dashed={!selected}
        />
    );
}


/* =========================================================
   AXES
========================================================= */

function Axes() {

    return (
        <group>

            <Line
                points={[
                    [-2, -1.5, 0],
                    [2, -1.5, 0],
                ]}
                color="#788c98"
                lineWidth={1}
            />


            <Line
                points={[
                    [-1.8, -1.6, 0],
                    [-1.8, 1.6, 0],
                ]}
                color="#788c98"
                lineWidth={1}
            />


            <Line
                points={[
                    [-1.8, -1.5, -1.5],
                    [-1.8, -1.5, 1.5],
                ]}
                color="#788c98"
                lineWidth={1}
            />


            <Text
                position={[
                    2.15,
                    -1.5,
                    0,
                ]}
                fontSize={0.1}
                color="#5c707d"
            >
                PC1
            </Text>


            <Text
                position={[
                    -1.8,
                    1.78,
                    0,
                ]}
                fontSize={0.1}
                color="#5c707d"
            >
                PC2
            </Text>


            <Text
                position={[
                    -1.8,
                    -1.5,
                    1.7,
                ]}
                fontSize={0.1}
                color="#5c707d"
            >
                PC3
            </Text>

        </group>
    );
}


/* =========================================================
   THREE SCENE
========================================================= */

function VectorScene({
                         step,
                         documents,
                     }: {
    step: VectorDemoStep;
    documents: RankedDocument[];
}) {

    const group =
        useRef<THREE.Group>(null);


    const questionVisible =
        stepReached(
            step,
            "projecting",
        );


    const showSimilarity =
        stepReached(
            step,
            "similarity",
        );


    const topK =
        stepReached(
            step,
            "topk",
        );


    useFrame(
        (_, delta) => {

            if (
                !group.current ||
                !stepReached(
                    step,
                    "projecting",
                )
            ) {
                return;
            }


            group.current.rotation.y +=
                delta * 0.025;

        },
    );


    return (
        <>

            <ambientLight
                intensity={1.8}
            />


            <directionalLight
                position={[
                    4,
                    5,
                    5,
                ]}
                intensity={2}
            />


            <group ref={group}>

                <Axes />


                {documents.map(
                    (document) => (

                        <SimilarityConnection
                            key={
                                `line-${document.id}`
                            }
                            document={document}
                            visible={
                                showSimilarity
                            }
                            topK={topK}
                        />

                    ),
                )}


                {documents.map(
                    (document) => (

                        <DocumentNode
                            key={
                                document.id
                            }
                            document={document}
                            showSimilarity={
                                showSimilarity
                            }
                            topK={topK}
                        />

                    ),
                )}


                <QuestionPoint
                    visible={
                        questionVisible
                    }
                />

            </group>


            <OrbitControls
                enablePan
                enableZoom
                enableRotate
            />

        </>
    );
}


/* =========================================================
   STEP LABEL
========================================================= */

function getStepLabel(
    step: VectorDemoStep,
) {

    switch (step) {

        case "question":
            return "01 · QUESTION";

        case "embedding":
            return "02 · EMBEDDING";

        case "projecting":
            return "03 · PCA PROJECTION";

        case "similarity":
            return "04 · COSINE SIMILARITY";

        case "topk":
            return "05 · TOP-K RETRIEVAL";

        case "context":
            return "06 · RETRIEVED CONTEXT";

        case "generating":
            return "07 · LLM GENERATION";

        case "answer":
            return "08 · ANSWER";

        default:
            return "READY";
    }
}


/* =========================================================
   LIVE SUBTITLE
========================================================= */

function getStepSubtitle(step: VectorDemoStep) {
    switch (step) {
        case "question":
            return { title: "01 · 질문 입력", text: "사용자의 질문을 확인합니다. 다음 단계에서 질문의 의미를 숫자 벡터로 변환합니다." };
        case "embedding":
            return { title: "02 · 임베딩 생성", text: "질문의 의미적 특징을 숫자 배열로 표현합니다. 이것이 질문 임베딩입니다." };
        case "projecting":
            return { title: "03 · 벡터 공간 배치", text: "질문과 문서를 공간에 배치합니다. 화면은 이해를 위한 3D 투영이며 실제 검색 계산은 원본 임베딩을 사용합니다." };
        case "similarity":
            return { title: "04 · 코사인 유사도", text: "질문 벡터와 각 문서 벡터의 방향을 비교합니다. 값이 높을수록 의미가 더 가깝습니다." };
        case "topk":
            return { title: "05 · TOP-K 검색", text: "유사도 순으로 정렬한 뒤 가장 관련성이 높은 상위 3개 문서를 선택합니다." };
        case "context":
            return { title: "06 · Context 구성", text: "선택된 문서 내용을 모아 LLM이 참고할 검색 Context를 구성합니다." };
        case "generating":
            return { title: "07 · LLM 생성", text: "사용자 질문과 검색된 Context를 함께 LLM에 전달하여 근거 기반 답변을 생성합니다." };
        case "answer":
            return { title: "08 · 최종 답변", text: "답변이 완성되었습니다. 질문 → 임베딩 → 유사도 → TOP-K → Context → LLM이 Vector RAG의 전체 흐름입니다." };
        default:
            return { title: "VECTOR RAG · READY", text: "시작하면 Vector RAG 검색 과정을 단계별로 보여드립니다." };
    }
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function VectorRAGVisualizer({
                                                autoPlay = true,
                                                paused = false,
                                                restartKey = 0,
                                                onClose,
                                            }: VectorRAGVisualizerProps) {

    const documents =
        useMemo(
            () => rankDocuments(),
            [],
        );


    const topDocuments =
        useMemo(
            () =>
                documents.slice(
                    0,
                    3,
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
        VectorDemoStep =
        stepIndex < 0
            ? "idle"
            : STEP_ORDER[
                Math.min(
                    stepIndex,
                    STEP_ORDER.length - 1,
                )
                ];

    const subtitle = getStepSubtitle(step);


    /* =====================================================
       RESTART
    ===================================================== */

    useEffect(
        () => {

            setStepIndex(
                autoPlay
                    ? 0
                    : -1,
            );

        },
        [
            restartKey,
            autoPlay,
        ],
    );


    /* =====================================================
       AUTO PLAY
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

                    : step === "embedding"
                        ? 3000

                        : step === "projecting"
                            ? 3200

                            : step === "similarity"
                                ? 3800

                                : step === "topk"
                                    ? 3300

                                    : step === "context"
                                        ? 3800

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


    return (
        <div className="vector-demo">
            <style>
                {`
                    @keyframes vectorCaptionFade {
                        from { opacity: 0; transform: translateY(4px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}
            </style>

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="vector-demo-header">

                <div>

                    <small>
                        LIVE VECTOR RAG
                    </small>

                    <h2>
                        Vector RAG · Retrieval Process
                    </h2>

                </div>


                <div className="vector-demo-header-right">

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

            <div className="vector-demo-pipeline">

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
                                    "vector-pipeline-step",

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
                className="vector-demo-body"
                style={{
                    gridTemplateColumns: "170px minmax(0, 1.45fr) minmax(270px, 0.78fr)",
                    alignItems: "stretch",
                }}
            >

                {/* 현재 단계 설명 - 고정 위치 */}
                <aside
                    className="vector-stage-caption"
                    style={{
                        minWidth: 0,
                        padding: "14px 12px",
                        boxSizing: "border-box",
                        border: "1px solid #b9c4c9",
                        borderTop: "5px solid #365b7a",
                        background: "#f7f4ee",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        gap: 10,
                        overflow: "hidden",
                    }}
                >
                    <small
                        style={{
                            color: "#6b8190",
                            fontFamily: "Consolas, monospace",
                            fontSize: 8,
                            fontWeight: 900,
                            letterSpacing: "1px",
                        }}
                    >
                        CURRENT STEP
                    </small>

                    <strong
                        style={{
                            color: "#b66f36",
                            fontSize: 22,
                            lineHeight: 1,
                        }}
                    >
                        {String(
                            Math.max(1, stepIndex + 1),
                        ).padStart(2, "0")}
                    </strong>

                    <h3
                        style={{
                            margin: 0,
                            color: "#294454",
                            fontSize: 14,
                            lineHeight: 1.35,
                        }}
                    >
                        {subtitle.title.replace(/^\d+\s*·\s*/, "")}
                    </h3>

                    <div
                        style={{
                            width: "100%",
                            height: 1,
                            background: "#d5dcdf",
                        }}
                    />

                    <p
                        key={step}
                        style={{
                            margin: 0,
                            color: "#536873",
                            fontSize: 11,
                            lineHeight: 1.65,
                            wordBreak: "keep-all",
                            animation: "vectorCaptionFade 240ms ease-out",
                        }}
                    >
                        {subtitle.text}
                    </p>

                    {step === "similarity" && (
                        <div
                            style={{
                                width: "100%",
                                marginTop: "auto",
                                padding: "9px 7px",
                                boxSizing: "border-box",
                                border: "1px solid #d5dcdf",
                                background: "#eef2f4",
                                color: "#36576c",
                                fontSize: 10,
                                lineHeight: 1.55,
                            }}
                        >
                            <b>cos(θ) = A · B / |A||B|</b>
                            <br />
                            1에 가까울수록 의미가 유사
                        </div>
                    )}
                </aside>

                {/* =============================================
                    LEFT
                ============================================= */}

                <section className="vector-demo-stage">

                    {/* QUESTION */}

                    {stepReached(
                        step,
                        "question",
                    ) && (

                        <div className="vector-live-question">

                            <small>
                                USER QUESTION
                            </small>

                            <strong>
                                {QUESTION}
                            </strong>

                        </div>

                    )}


                    {/* EMBEDDING */}

                    {stepReached(
                        step,
                        "embedding",
                    ) && (

                        <div className="vector-live-embedding">

                            <span>
                                EMBEDDING
                            </span>

                            <strong>
                                [
                                {
                                    QUESTION_EMBEDDING
                                        .map(
                                            (value) =>
                                                value
                                                    .toFixed(
                                                        2,
                                                    ),
                                        )
                                        .join(
                                            ", ",
                                        )
                                }
                                ]
                            </strong>

                        </div>

                    )}


                    {/* 3D */}

                    <div className="vector-demo-canvas">

                        <Canvas
                            camera={{
                                position: [
                                    5.2,
                                    3.6,
                                    6.2,
                                ],

                                fov: 40,
                            }}
                        >

                            <VectorScene
                                step={step}
                                documents={
                                    documents
                                }
                            />

                        </Canvas>


                        {!stepReached(
                            step,
                            "projecting",
                        ) && (

                            <div className="vector-canvas-waiting">

                                <span>
                                    VECTOR SPACE
                                </span>

                                <strong>
                                    질문 벡터를
                                    생성하고 있습니다.
                                </strong>

                            </div>

                        )}

                    </div>

                </section>


                {/* =============================================
                    RIGHT
                ============================================= */}

                <aside
                    className="vector-demo-inspector"
                    style={{
                        minHeight: 0,
                        overflow: "hidden",
                    }}
                >

                    {/* SIMILARITY */}

                    <section className="vector-inspector-section">

                        <small>
                            COSINE SIMILARITY
                        </small>

                        <h3>
                            문서 유사도
                        </h3>


                        <div className="vector-similarity-list">

                            {documents.map(
                                (document) => (

                                    <div
                                        key={
                                            document.id
                                        }
                                        className={[
                                            "vector-similarity-item",

                                            stepReached(
                                                step,
                                                "topk",
                                            )
                                            &&
                                            document.rank <= 3

                                                ? "selected"

                                                : "",

                                            stepReached(
                                                step,
                                                "topk",
                                            )
                                            &&
                                            document.rank > 3

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

                                            <div className="similarity-bar">

                                                <i
                                                    style={{
                                                        width:
                                                            stepReached(
                                                                step,
                                                                "similarity",
                                                            )
                                                                ? `${Math.max(
                                                                    0,
                                                                    document.similarity,
                                                                ) * 100}%`
                                                                : "0%",
                                                    }}
                                                />

                                            </div>

                                        </div>


                                        <b>
                                            {
                                                stepReached(
                                                    step,
                                                    "similarity",
                                                )
                                                    ? document
                                                        .similarity
                                                        .toFixed(
                                                            3,
                                                        )
                                                    : "---"
                                            }
                                        </b>

                                    </div>

                                ),
                            )}

                        </div>

                    </section>


                    {/* CONTEXT */}

                    {stepReached(
                        step,
                        "context",
                    ) && (

                        <section
                            className="vector-context-panel"
                            style={{
                                flexShrink: 0,
                                padding: "9px 10px",
                                boxSizing: "border-box",
                                overflow: "hidden",
                            }}
                        >

                            <small>
                                RETRIEVED CONTEXT
                            </small>

                            <h3
                                style={{
                                    margin: "3px 0 6px",
                                }}
                            >
                                TOP 3 문서
                            </h3>


                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 4,
                                }}
                            >
                                {topDocuments.map(
                                    (document, index) => (

                                        <div
                                            key={
                                                document.id
                                            }
                                            style={{
                                                minHeight: 34,
                                                padding: "4px 6px",
                                                boxSizing: "border-box",
                                                display: "grid",
                                                gridTemplateColumns:
                                                    "22px minmax(0, 1fr) 40px",
                                                alignItems: "center",
                                                gap: 6,
                                                border:
                                                    "1px solid #d6dcda",
                                                background:
                                                    index === 0
                                                        ? "#eef4ea"
                                                        : "#f8f7f2",
                                            }}
                                        >

                                            <span
                                                style={{
                                                    width: 18,
                                                    height: 18,
                                                    borderRadius: "50%",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    background: "#71966f",
                                                    color: "#ffffff",
                                                    fontSize: 8,
                                                    fontWeight: 900,
                                                }}
                                            >
                                                {
                                                    document.rank
                                                }
                                            </span>


                                            <div
                                                style={{
                                                    minWidth: 0,
                                                }}
                                            >

                                                <strong
                                                    style={{
                                                        display: "block",
                                                        overflow: "hidden",
                                                        whiteSpace: "nowrap",
                                                        textOverflow: "ellipsis",
                                                        color: "#294554",
                                                        fontSize: 8,
                                                        lineHeight: 1.2,
                                                    }}
                                                >
                                                    {
                                                        document.title
                                                    }
                                                </strong>

                                                <p
                                                    title={
                                                        document.content
                                                    }
                                                    style={{
                                                        margin: "2px 0 0",
                                                        overflow: "hidden",
                                                        whiteSpace: "nowrap",
                                                        textOverflow: "ellipsis",
                                                        color: "#718088",
                                                        fontSize: 7,
                                                        lineHeight: 1.15,
                                                    }}
                                                >
                                                    {
                                                        document.content
                                                    }
                                                </p>

                                            </div>


                                            <b
                                                style={{
                                                    textAlign: "right",
                                                    fontFamily:
                                                        "Consolas, monospace",
                                                    color: "#426c58",
                                                    fontSize: 8,
                                                }}
                                            >
                                                {
                                                    document.similarity
                                                        .toFixed(3)
                                                }
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
                LLM
            ================================================= */}

            {stepReached(
                step,
                "generating",
            ) && (

                <div className="vector-llm-flow">

                    <div>
                        QUESTION
                    </div>

                    <span>
                        +
                    </span>

                    <div>
                        TOP-K CONTEXT
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
                            두 벡터의 방향이
                            얼마나 유사한지 비교할 때
                            코사인 유사도를 사용할 수 있습니다.
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