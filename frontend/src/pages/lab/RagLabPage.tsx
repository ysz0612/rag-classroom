import {
    ExperimentOutlined,
    HomeOutlined,
    PlayCircleOutlined,
    ReloadOutlined,
} from "@ant-design/icons";

import {
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    apiClient,
} from "../../api/client";

import "./rag-lab.css";
import "./rag-lab-results.css";


type MonitorState =
    | "idle"
    | "running"
    | "complete";

type RagMethod = "keyword" | "vector" | "graph";


interface MonitorData {
    state: MonitorState;
    step: number;
}


type RetrievedItem = Record<string, unknown>;


interface CompareMethodResult {
    status: "success" | "error";
    search_type: string;
    count: number;
    keywords: string[];
    path_type: string | null;
    path: string | null;
    retrieved: RetrievedItem[];
    nodes: RetrievedItem[];
    relationships: RetrievedItem[];
    error: string | null;
}


interface RagCompareResponse {
    question: string;
    user_id: string;
    limit: number;
    keyword: CompareMethodResult;
    vector: CompareMethodResult;
    graph: CompareMethodResult;
}


interface LabUserOption {
    alias: string;
    user_id: string;
    review_count: number;
}


const DEMO_USER_ID =
    "AFXF3EGQTQDXMRLDWFU7UBFQZB7Q";


const KEYWORD_STEPS = [
    "질문 분석",
    "핵심 키워드 추출",
    "키워드 검색",
    "관련 문서 선택",
    "Context 구성",
    "답변 생성",
];


const VECTOR_STEPS = [
    "질문 분석",
    "질문 Embedding",
    "Vector 검색",
    "유사도 계산",
    "Top-K 문서 선택",
    "답변 생성",
];


const GRAPH_STEPS = [
    "질문 분석",
    "Entity 추출",
    "시작 Node 탐색",
    "Relationship 탐색",
    "Subgraph 구성",
    "답변 생성",
];


export default function RagLabPage() {

    const navigate =
        useNavigate();


    const [
        question,
        setQuestion,
    ] =
        useState("");


    const [
        userId,
        setUserId,
    ] =
        useState(DEMO_USER_ID);


    const [
        userOptions,
        setUserOptions,
    ] = useState<LabUserOption[]>([
        {
            alias: "user1",
            user_id: DEMO_USER_ID,
            review_count: 2,
        },
    ]);


    useEffect(() => {
        let active = true;

        apiClient
            .get<LabUserOption[]>(
                "/api/rag/compare/users",
                {
                    params: { limit: 20 },
                },
            )
            .then((response) => {
                if (
                    !active ||
                    response.data.length === 0
                ) {
                    return;
                }

                setUserOptions(response.data);
                setUserId(response.data[0].user_id);
            })
            .catch((error) => {
                console.warn(
                    "Lab users could not be loaded:",
                    error,
                );
            });

        return () => {
            active = false;
        };
    }, []);


    const [
        compareResult,
        setCompareResult,
    ] =
        useState<RagCompareResponse | null>(
            null,
        );


    const [
        requestError,
        setRequestError,
    ] =
        useState("");


    const [
        keyword,
        setKeyword,
    ] =
        useState<MonitorData>({
            state: "idle",
            step: -1,
        });


    const [
        vector,
        setVector,
    ] =
        useState<MonitorData>({
            state: "idle",
            step: -1,
        });


    const [
        graph,
        setGraph,
    ] =
        useState<MonitorData>({
            state: "idle",
            step: -1,
        });


    const [
        running,
        setRunning,
    ] =
        useState(false);

    const [
        expandedMethod,
        setExpandedMethod,
    ] = useState<RagMethod | null>(null);


    /* =====================================================
       MONITOR ANIMATION
    ===================================================== */

    const runMonitor =
        (
            setter:
            React.Dispatch<
                React.SetStateAction<
                    MonitorData
                >
            >,
            steps: string[],
            delay: number,
        ) => {

            setter({
                state: "running",
                step: 0,
            });


            steps.forEach(
                (
                    _,
                    index,
                ) => {

                    window.setTimeout(
                        () => {

                            setter({
                                state:
                                    "running",

                                step:
                                index,
                            });

                        },
                        delay *
                        (index + 1),
                    );

                },
            );
        };


    /* =====================================================
       RUN EXPERIMENT
    ===================================================== */

    const runExperiment =
        async (
            questionOverride?: string,
            userIdOverride?: string,
        ) => {

            const nextQuestion =
                (
                    questionOverride ??
                    question
                ).trim();

            const nextUserId =
                (
                    userIdOverride ??
                    userId
                ).trim();

            if (
                !nextQuestion ||
                !nextUserId ||
                running
            ) {
                return;
            }

            setQuestion(nextQuestion);
            setUserId(nextUserId);

            setRunning(true);
            setCompareResult(null);
            setRequestError("");


            runMonitor(
                setKeyword,
                KEYWORD_STEPS,
                280,
            );


            runMonitor(
                setVector,
                VECTOR_STEPS,
                320,
            );


            runMonitor(
                setGraph,
                GRAPH_STEPS,
                360,
            );

            try {
                const [
                    response,
                ] =
                    await Promise.all([
                        apiClient.post<RagCompareResponse>(
                            "/api/rag/compare",
                            {
                                question:
                                nextQuestion,

                                user_id:
                                nextUserId,

                                min_rating:
                                    4,

                                limit:
                                    5,
                            },
                        ),

                        new Promise<void>(
                            (resolve) => {
                                window.setTimeout(
                                    resolve,
                                    2300,
                                );
                            },
                        ),
                    ]);

                setCompareResult(
                    response.data,
                );

                setKeyword({
                    state: "complete",
                    step:
                        KEYWORD_STEPS.length -
                        1,
                });

                setVector({
                    state: "complete",
                    step:
                        VECTOR_STEPS.length -
                        1,
                });

                setGraph({
                    state: "complete",
                    step:
                        GRAPH_STEPS.length -
                        1,
                });
            }

            catch (error) {
                console.error(
                    "RAG compare failed:",
                    error,
                );

                setRequestError(
                    "비교 API를 호출하지 못했습니다. 로그인 상태와 FastAPI 서버를 확인해주세요.",
                );

                setKeyword({
                    state: "complete",
                    step:
                        KEYWORD_STEPS.length -
                        1,
                });

                setVector({
                    state: "complete",
                    step:
                        VECTOR_STEPS.length -
                        1,
                });

                setGraph({
                    state: "complete",
                    step:
                        GRAPH_STEPS.length -
                        1,
                });
            }

            finally {
                setRunning(false);
            }
        };


    /* =====================================================
       RESET
    ===================================================== */

    const resetExperiment =
        () => {

            setQuestion("");

            setRunning(false);
            setCompareResult(null);
            setRequestError("");


            setKeyword({
                state: "idle",
                step: -1,
            });


            setVector({
                state: "idle",
                step: -1,
            });


            setGraph({
                state: "idle",
                step: -1,
            });
        };


    /* =====================================================
       ENTER
    ===================================================== */

    const handleKeyDown =
        (
            event:
            React.KeyboardEvent<
                HTMLTextAreaElement
            >,
        ) => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                runExperiment();
            }
        };


    /* =====================================================
       LAB VOICE COMMANDS
    ===================================================== */

    useEffect(() => {
        const executeLabVoiceCommand =
            (rawCommand: string) => {
                const command = rawCommand
                    .toLowerCase()
                    .replace(/레그/g, "래그")
                    .replace(/백터/g, "벡터")
                    .replace(/그레프/g, "그래프")
                    .replace(/키\s+워드/g, "키워드")
                    .replace(/보여\s*주세요/g, "보여줘")
                    .replace(/보여\s*줘/g, "보여줘")
                    .replace(/띄워\s*줘/g, "띄워줘")
                    .replace(/열어\s*줘/g, "열어줘")
                    .replace(/꺼\s*주세요/g, "꺼줘")
                    .replace(/꺼\s*줘/g, "꺼줘")
                    .replace(/닫아\s*주세요/g, "닫아줘")
                    .replace(/닫아\s*줘/g, "닫아줘")
                    .replace(/멈춰\s*주세요/g, "멈춰줘")
                    .replace(/멈춰\s*줘/g, "멈춰줘")
                    .replace(/검색해\s*주세요/g, "검색해줘")
                    .replace(/검색해\s*줘/g, "검색해줘")
                    .replace(/찾아\s*주세요/g, "찾아줘")
                    .replace(/찾아\s*줘/g, "찾아줘")
                    .replace(/추천해\s*주세요/g, "추천해줘")
                    .replace(/추천해\s*줘/g, "추천해줘")
                    .replace(/실행해\s*주세요/g, "실행해줘")
                    .replace(/실행해\s*줘/g, "실행해줘")
                    .replace(/[?!.,~]/g, "")
                    .replace(/\s+/g, " ")
                    .trim();

                if (!command || running) {
                    return;
                }

                if (
                    command.includes("상세 과정 닫") ||
                    command.includes("확대 화면 닫") ||
                    command.includes("과정 화면 닫")
                ) {
                    setExpandedMethod(null);
                    return;
                }

                if (
                    command.includes("다음 과정") ||
                    command.includes("다음 상세")
                ) {
                    if (!compareResult) {
                        setRequestError("먼저 질문을 실행해주세요.");
                        return;
                    }

                    setExpandedMethod((current) =>
                        current === "keyword"
                            ? "vector"
                            : current === "vector"
                                ? "graph"
                                : "keyword",
                    );
                    return;
                }

                if (
                    command.includes("상세 과정") ||
                    command.includes("검색 과정") ||
                    command.includes("과정 확대") ||
                    command.includes("작동 방법") ||
                    command.includes("작동방법") ||
                    command.includes("작동 방식") ||
                    command.includes("작동방식") ||
                    command.includes("작동 과정")
                ) {
                    if (!compareResult) {
                        setRequestError("먼저 질문을 실행해주세요.");
                        return;
                    }

                    if (command.includes("벡터")) {
                        setExpandedMethod("vector");
                    } else if (command.includes("그래프")) {
                        setExpandedMethod("graph");
                    } else {
                        setExpandedMethod("keyword");
                    }
                    return;
                }

                if (
                    command.includes("초기화") ||
                    command.includes("리셋") ||
                    command.includes("지워줘")
                ) {
                    resetExperiment();
                    return;
                }

                const userMatch =
                    command.match(/user\s*(\d+)/i);

                if (userMatch) {
                    const alias =
                        `user${Number(userMatch[1])}`;

                    const selected =
                        userOptions.find(
                            (user) =>
                                user.alias.toLowerCase() ===
                                alias,
                        );

                    if (selected) {
                        setUserId(selected.user_id);
                    }

                    return;
                }

                if (
                    command.includes("정확한 단어") ||
                    command.includes("키워드 예시")
                ) {
                    void runExperiment(
                        "무선 면도기",
                    );
                    return;
                }

                if (
                    command.includes("비슷한 의미") ||
                    command.includes("벡터 예시")
                ) {
                    void runExperiment(
                        "충전해서 사용하는 얼굴 털 제거 도구",
                    );
                    return;
                }

                if (
                    command.includes("연결 관계") ||
                    command.includes("그래프 예시")
                ) {
                    void runExperiment(
                        "내가 좋아할 만한 상품을 추천해줘",
                    );
                    return;
                }

                if (
                    command === "실행" ||
                    command.includes("실행해줘") ||
                    command.includes("다시 실행") ||
                    command.includes("검색 시작")
                ) {
                    void runExperiment();
                    return;
                }

                const freeQuestion = command
                    .replace(/^질문\s*/, "")
                    // 음성 명령의 동작어는 실제 RAG 질문에 포함하지 않습니다.
                    .replace(
                        /\s*(?:검색해줘|찾아줘|추천해줘|보여줘|실행해줘|검색)\s*$/,
                        "",
                    )
                    .trim();

                if (freeQuestion) {
                    void runExperiment(
                        freeQuestion,
                    );
                }
            };

        const handleVoiceEvent =
            (event: Event) => {
                const customEvent =
                    event as CustomEvent<{
                        command?: string;
                    }>;

                executeLabVoiceCommand(
                    customEvent.detail?.command ??
                    "",
                );
            };

        const labWindow = window as Window & {
            labVoice?: (command: string) => void;
        };

        window.addEventListener(
            "rag-lab-voice-command",
            handleVoiceEvent,
        );

        labWindow.labVoice =
            executeLabVoiceCommand;

        return () => {
            window.removeEventListener(
                "rag-lab-voice-command",
                handleVoiceEvent,
            );

            delete labWindow.labVoice;
        };
    }, [
        question,
        running,
        userId,
        userOptions,
        compareResult,
        expandedMethod,
    ]);


    return (
        <div className="rag-lab-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="lab-header">

                <div className="lab-header-left">

                    <ExperimentOutlined />

                    <div>

                        <small>
                            RAG LEARNING SYSTEM
                        </small>

                        <strong>
                            AI EXPERIMENT LAB
                        </strong>

                    </div>

                </div>


                <div className="lab-header-status">

                    <span className="status-dot" />

                    AMAZON DATA

                    <b>
                        CONNECTED
                    </b>

                </div>


                <button
                    type="button"
                    className="lab-home-button"
                    onClick={() =>
                        navigate("/")
                    }
                >
                    <HomeOutlined />

                    HOME
                </button>

            </header>


            {/* =================================================
                LAB TITLE
            ================================================= */}

            <section className="lab-intro">

                <span className="lab-intro-number">
                    EXPERIMENT 01
                </span>


                <h1>
                    같은 질문, 3가지 RAG 검색 비교
                </h1>


                <p>
                    하나의 질문을 입력하면
                    Keyword · Vector · Graph RAG가
                    정보를 찾는 과정을 동시에 확인할 수 있습니다.
                </p>

            </section>


            {/* =================================================
                QUESTION CONSOLE
            ================================================= */}

            <section className="lab-question-console">

                <div className="question-console-header">

                    <div>

                        <span className="console-light red" />

                        <span className="console-light yellow" />

                        <span className="console-light green" />

                    </div>


                    <strong>
                        EXPERIMENT INPUT
                    </strong>


                    <span>
                        READY
                    </span>

                </div>


                <div className="question-input-area">

                    <div className="question-number">
                        Q
                    </div>


                    <textarea
                        value={question}

                        onChange={(event) =>
                            setQuestion(
                                event.target.value,
                            )
                        }

                        onKeyDown={
                            handleKeyDown
                        }

                        placeholder="세 가지 RAG에게 같은 질문을 입력해보세요."

                        disabled={running}
                    />


                    <button
                        type="button"

                        className="run-experiment-button"

                        disabled={
                            !question.trim() ||
                            running
                        }

                        onClick={
                            () => {
                                void runExperiment();
                            }
                        }
                    >

                        <PlayCircleOutlined />

                        {running
                            ? "RUNNING"
                            : "RUN"}

                    </button>


                    <button
                        type="button"

                        className="reset-experiment-button"

                        onClick={
                            resetExperiment
                        }
                    >

                        <ReloadOutlined />

                    </button>

                </div>


                <div className="question-hint">

                    <span>
                        ENTER
                    </span>

                    실행

                    <i />

                    <span>
                        SHIFT + ENTER
                    </span>

                    줄바꿈

                </div>


                <div className="lab-user-controls">

                    <label htmlFor="amazon-user-id">
                        실험 사용자
                    </label>

                    <select
                        id="amazon-user-id"
                        value={userId}
                        onChange={(event) =>
                            setUserId(
                                event.target.value,
                            )
                        }
                        disabled={running}
                        aria-label="그래프 검색에 사용할 사용자"
                    >
                        {userOptions.map((user) => (
                            <option
                                key={user.user_id}
                                value={user.user_id}
                            >
                                {user.alias} · 4점 이상 {user.review_count}개
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        onClick={() =>
                            setQuestion(
                                "무선 면도기",
                            )
                        }
                        disabled={running}
                    >
                        정확한 단어
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setQuestion(
                                "충전해서 사용하는 얼굴 털 제거 도구",
                            )
                        }
                        disabled={running}
                    >
                        비슷한 의미
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setQuestion(
                                "내가 좋아할 만한 상품을 추천해줘",
                            )
                        }
                        disabled={running}
                    >
                        연결 관계
                    </button>

                </div>


                {requestError && (
                    <div className="lab-api-error">
                        {requestError}
                    </div>
                )}

            </section>


            {/* =================================================
                THREE MONITORS
            ================================================= */}

            <section className="rag-monitor-grid">

                <RagMonitor
                    number="01"
                    title="KEYWORD RAG"
                    subtitle="단어를 중심으로 찾습니다."
                    type="keyword"
                    data={keyword}
                    steps={KEYWORD_STEPS}
                    result={
                        compareResult?.keyword ??
                        null
                    }
                    onExpand={() => setExpandedMethod("keyword")}
                />


                <RagMonitor
                    number="02"
                    title="VECTOR RAG"
                    subtitle="의미가 가까운 정보를 찾습니다."
                    type="vector"
                    data={vector}
                    steps={VECTOR_STEPS}
                    result={
                        compareResult?.vector ??
                        null
                    }
                    onExpand={() => setExpandedMethod("vector")}
                />


                <RagMonitor
                    number="03"
                    title="GRAPH RAG"
                    subtitle="관계를 따라 정보를 찾습니다."
                    type="graph"
                    data={graph}
                    steps={GRAPH_STEPS}
                    result={
                        compareResult?.graph ??
                        null
                    }
                    onExpand={() => setExpandedMethod("graph")}
                />

            </section>

            {expandedMethod && compareResult && (
                <ExpandedRagProcess
                    type={expandedMethod}
                    question={compareResult.question}
                    result={compareResult[expandedMethod]}
                    userAlias={
                        userOptions.find(
                            (user) => user.user_id === compareResult.user_id,
                        )?.alias ?? "선택 사용자"
                    }
                    onClose={() => setExpandedMethod(null)}
                />
            )}


            {/* =================================================
                BOTTOM INFO
            ================================================= */}

            <footer className="lab-footer">

                <span>
                    RAG LAB
                </span>

                <p>
                    질문은 하나지만
                    정보를 찾는 방법은 다릅니다.
                </p>

                <div>
                    KEYWORD
                    <i />
                    VECTOR
                    <i />
                    GRAPH
                </div>

            </footer>

        </div>
    );
}


/* =========================================================
   MONITOR
========================================================= */

interface RagMonitorProps {
    number: string;
    title: string;
    subtitle: string;

    type:
        | "keyword"
        | "vector"
        | "graph";

    data: MonitorData;

    steps: string[];
    result:
        CompareMethodResult |
        null;
    onExpand: () => void;
}


function RagMonitor({
                        number,
                        title,
                        subtitle,
                        type,
                        data,
                        steps,
                        result,
                        onExpand,
                    }: RagMonitorProps) {

    return (
        <article
            className={
                `rag-monitor ${type}`
            }
        >

            {/* 모니터 외부 */}

            <div className="monitor-case">

                <div className="monitor-top">

                    <div>

                        <span>
                            MONITOR {number}
                        </span>

                        <strong>
                            {title}
                        </strong>

                    </div>


                    <div className="monitor-top-actions">
                        {result && (
                            <button
                                type="button"
                                className="monitor-expand-button"
                                onClick={onExpand}
                                aria-label={`${title} 검색 과정 확대`}
                            >
                                ⛶ 과정 확대
                            </button>
                        )}

                        <span
                            className={
                                `monitor-state ${data.state}`
                            }
                        >

                        {data.state === "idle"
                            ? "STANDBY"

                            : data.state ===
                            "running"
                                ? "PROCESSING"

                                : "COMPLETE"}

                        </span>
                    </div>

                </div>


                {/* 화면 */}

                <div className="monitor-screen">

                    <div className="screen-scanline" />


                    {data.state ===
                    "idle"
                        ? (
                            <MonitorIdle
                                title={title}
                                subtitle={subtitle}
                            />
                        )
                        : data.state ===
                        "complete" &&
                        result
                            ? (
                                <MonitorResult
                                    type={type}
                                    result={result}
                                />
                            )
                            : (
                                <MonitorProcess
                                    steps={steps}
                                    currentStep={
                                        data.step
                                    }
                                    complete={
                                        data.state ===
                                        "complete"
                                    }
                                />
                            )}

                </div>


                {/* 하단 컨트롤 */}

                <div className="monitor-controls">

                    <span />

                    <span />

                    <span />

                    <div className="monitor-power">

                        <i
                            className={
                                data.state !==
                                "idle"
                                    ? "on"
                                    : ""
                            }
                        />

                        POWER

                    </div>

                </div>

            </div>


            {/* 모니터 목 */}

            <div className="monitor-neck" />

            <div className="monitor-base" />

        </article>
    );
}


/* =========================================================
   EXPANDED SEARCH PROCESS
========================================================= */

const METHOD_LABELS: Record<RagMethod, string> = {
    keyword: "KEYWORD RAG",
    vector: "VECTOR RAG",
    graph: "GRAPH RAG",
};

function ExpandedRagProcess({
                                type,
                                question,
                                result,
                                userAlias,
                                onClose,
                            }: {
    type: RagMethod;
    question: string;
    result: CompareMethodResult;
    userAlias: string;
    onClose: () => void;
}) {
    const stages = type === "keyword"
        ? [
            ["01 · 질문 분석", "질문에서 검색에 사용할 핵심 단어를 분리합니다."],
            ["02 · 정확 일치 검사", "상품명과 설명에 핵심 단어가 포함되는지 검사합니다."],
            ["03 · 점수순 정렬", "더 많은 위치에서 일치한 상품을 위에 배치합니다."],
        ]
        : type === "vector"
            ? [
                ["01 · 질문 임베딩", "질문의 의미를 임베딩 모델로 숫자 벡터로 변환합니다."],
                ["02 · 의미 거리 계산", "저장된 상품 벡터와 코사인 유사도를 계산합니다."],
                ["03 · 기준 통과", "유사도 0.34 이상인 후보를 높은 순서로 선택합니다."],
            ]
            : [
                ["01 · 사용자 선택", `${userAlias}의 리뷰 관계를 시작점으로 삼습니다.`],
                ["02 · 관계 경로 탐색", result.path ?? "User → REVIEWED → Product 관계를 탐색합니다."],
                ["03 · 연결 후보 정렬", "높게 평가한 상품과 연결된 후보를 관계 근거로 정렬합니다."],
            ];

    return (
        <div className="rag-process-overlay" role="dialog" aria-modal="true">
            <button
                type="button"
                className="rag-process-backdrop"
                onClick={onClose}
                aria-label="확대 화면 닫기"
            />

            <section className={`rag-process-panel ${type}`}>
                <header className="rag-process-header">
                    <div>
                        <small>SEARCH PROCESS DETAIL</small>
                        <h2>{METHOD_LABELS[type]}가 결과를 찾은 과정</h2>
                    </div>
                    <button type="button" onClick={onClose}>× 닫기</button>
                </header>

                <div className="rag-process-question">
                    <span>입력 질문</span>
                    <strong>“{question}”</strong>
                </div>

                <div className="rag-process-stages">
                    {stages.map(([title, description], index) => (
                        <article key={title}>
                            <strong>{title}</strong>
                            <p>{description}</p>
                            {index < stages.length - 1 && <b aria-hidden="true">→</b>}
                        </article>
                    ))}
                </div>

                <div className="rag-process-evidence">
                    <div className="rag-process-rule">
                        <small>실제 검색 근거</small>
                        {type === "keyword" && (
                            <>
                                <strong>추출 키워드</strong>
                                <div className="rag-process-keywords">
                                    {result.keywords.map((keyword) => (
                                        <span key={keyword}>{keyword}</span>
                                    ))}
                                </div>
                                <p>일치 점수가 높을수록 질문의 단어를 더 정확히 포함한 상품입니다.</p>
                            </>
                        )}
                        {type === "vector" && (
                            <>
                                <strong>코사인 유사도 = 1 − 코사인 거리</strong>
                                <p>표현이 달라도 의미의 방향이 가까우면 점수가 높아집니다. 현재 통과 기준은 0.34입니다.</p>
                            </>
                        )}
                        {type === "graph" && (
                            <>
                                <strong>{result.path ?? "관계 경로 없음"}</strong>
                                <p>노드 {result.nodes.length}개와 관계 {result.relationships.length}개를 실제로 탐색했습니다.</p>
                            </>
                        )}
                    </div>

                    <div className="rag-process-candidates">
                        <div className="rag-process-result-heading">
                            <small>후보 비교</small>
                            <strong>{result.count}건 발견</strong>
                        </div>

                        {result.retrieved.length === 0 ? (
                            <p className="rag-process-empty">이 방식의 검색 조건을 통과한 결과가 없습니다.</p>
                        ) : (
                            result.retrieved.slice(0, 5).map((item, index) => (
                                <article key={`${getResultTitle(item)}-${index}`}>
                                    <span>{String(index + 1).padStart(2, "0")}</span>
                                    <div>
                                        <strong>{getResultTitle(item)}</strong>
                                        <small>{getResultMeta(item, type)}</small>
                                    </div>
                                    <b>{index === 0 ? "최종 선택" : "후보"}</b>
                                </article>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}


/* =========================================================
   API RESULT
========================================================= */

function getResultTitle(
    item: RetrievedItem,
) {
    return String(
        item.related_product ??
        item.product_name ??
        item.product_id ??
        "이름 없는 결과",
    );
}


function getResultMeta(
    item: RetrievedItem,
    type:
        | "keyword"
        | "vector"
        | "graph",
) {
    if (
        type === "graph" &&
        item.related_product != null
    ) {
        const score =
            item.recommendation_score != null
                ? ` · 추천 평점 ${Number(
                    item.recommendation_score,
                ).toFixed(2)}`
                : "";

        return `같은 ${String(
            item.category ?? "카테고리",
        )}${score}`;
    }

    if (
        type === "vector" &&
        item.similarity != null
    ) {
        return `유사도 ${Number(
            item.similarity,
        ).toFixed(4)}`;
    }

    if (
        type === "graph" &&
        item.rating != null
    ) {
        return `평점 ${String(
            item.rating,
        )}`;
    }

    if (
        type === "keyword" &&
        item.score != null
    ) {
        return `일치 점수 ${String(
            item.score,
        )}`;
    }

    return String(
        item.category ??
        item.brand ??
        item.product_id ??
        "검색 결과",
    );
}


function MonitorResult({
                           type,
                           result,
                       }: {
    type:
        | "keyword"
        | "vector"
        | "graph";

    result:
        CompareMethodResult;
}) {
    return (
        <div className="monitor-api-result">

            <div className="api-result-summary">
                <span>
                    {result.status === "success"
                        ? "RESULT"
                        : "ERROR"}
                </span>

                <strong>
                    {result.count}건
                </strong>
            </div>


            {result.keywords.length > 0 && (
                <div className="api-result-tags">
                    {result.keywords.map(
                        (keyword) => (
                            <span key={keyword}>
                                {keyword}
                            </span>
                        ),
                    )}
                </div>
            )}


            {result.path && (
                <div className="api-result-path">
                    {result.path}
                </div>
            )}


            {result.error ? (
                <div className="api-method-error">
                    {result.error}
                </div>
            ) : result.retrieved.length === 0 ? (
                <div className="api-empty-result">
                    이 검색 방식에서는 결과를 찾지 못했습니다.
                </div>
            ) : (
                <div className="api-result-list">
                    {result.retrieved
                        .slice(0, 5)
                        .map(
                            (
                                item,
                                index,
                            ) => (
                                <article
                                    key={
                                        `${getResultTitle(item)}-${index}`
                                    }
                                >
                                    <span>
                                        {String(
                                            index + 1,
                                        ).padStart(
                                            2,
                                            "0",
                                        )}
                                    </span>

                                    <div>
                                        <strong>
                                            {getResultTitle(
                                                item,
                                            )}
                                        </strong>

                                        <small>
                                            {getResultMeta(
                                                item,
                                                type,
                                            )}
                                        </small>
                                    </div>
                                </article>
                            ),
                        )}
                </div>
            )}


            {type === "graph" &&
                result.nodes.length > 0 && (
                    <small className="api-graph-count">
                        NODE {result.nodes.length}
                        {" · "}
                        RELATION {result.relationships.length}
                    </small>
                )}

        </div>
    );
}


/* =========================================================
   IDLE
========================================================= */

interface MonitorIdleProps {
    title: string;
    subtitle: string;
}


function MonitorIdle({
                         title,
                         subtitle,
                     }: MonitorIdleProps) {

    return (
        <div className="monitor-idle">

            <span className="idle-symbol">
                &gt;_
            </span>


            <strong>
                {title}
            </strong>


            <p>
                {subtitle}
            </p>


            <small>
                WAITING FOR QUESTION...
            </small>

        </div>
    );
}


/* =========================================================
   PROCESS
========================================================= */

interface MonitorProcessProps {
    steps: string[];
    currentStep: number;
    complete: boolean;
}


function MonitorProcess({
                            steps,
                            currentStep,
                            complete,
                        }: MonitorProcessProps) {

    return (
        <div className="monitor-process">

            <div className="process-title">

                {complete
                    ? "PROCESS COMPLETE"
                    : "RETRIEVAL PROCESS"}

            </div>


            <div className="process-steps">

                {steps.map(
                    (
                        step,
                        index,
                    ) => {

                        const done =
                            index <
                            currentStep;

                        const active =
                            index ===
                            currentStep;

                        return (
                            <div
                                key={step}

                                className={
                                    [
                                        "process-step",

                                        done
                                            ? "done"
                                            : "",

                                        active
                                            ? "active"
                                            : "",
                                    ]
                                        .filter(Boolean)
                                        .join(" ")
                                }
                            >

                                <span className="step-number">

                                    {String(
                                        index + 1,
                                    ).padStart(
                                        2,
                                        "0",
                                    )}

                                </span>


                                <i />


                                <strong>
                                    {step}
                                </strong>


                                <b>

                                    {done
                                        ? "✓"

                                        : active
                                            ? "●"

                                            : "·"}

                                </b>

                            </div>
                        );
                    },
                )}

            </div>


            {complete && (

                <div className="monitor-result-ready">

                    RESULT READY

                </div>

            )}

        </div>
    );
}