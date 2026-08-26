import {
    useEffect,
    useMemo,
    useState,
} from "react";

import "./graph-rag-visualizer.css";


export type GraphDemoStep =
    | "idle"
    | "question"
    | "entity"
    | "start"
    | "traversal1"
    | "traversal2"
    | "subgraph"
    | "context"
    | "generating"
    | "answer";


interface GraphRAGVisualizerProps {
    autoPlay?: boolean;
    paused?: boolean;
    restartKey?: number;
    startStep?: number | null;
    onClose?: () => void;
}


interface GraphNode {
    id: string;
    label: string;
    type: "company" | "product" | "category" | "country";
    x: number;
    y: number;
}


interface GraphEdge {
    id: string;
    from: string;
    to: string;
    label: string;
}


const QUESTION =
    "삼성이 만든 스마트폰은 무엇이야?";


const ENTITIES = [
    "삼성",
    "스마트폰",
];


const NODES: GraphNode[] = [
    {
        id: "samsung",
        label: "삼성",
        type: "company",
        x: 50,
        y: 18,
    },
    {
        id: "galaxy-s",
        label: "Galaxy S",
        type: "product",
        x: 50,
        y: 46,
    },
    {
        id: "smartphone",
        label: "스마트폰",
        type: "category",
        x: 50,
        y: 75,
    },
    {
        id: "korea",
        label: "한국",
        type: "country",
        x: 18,
        y: 18,
    },
    {
        id: "galaxy-z",
        label: "Galaxy Z",
        type: "product",
        x: 82,
        y: 46,
    },
];


const EDGES: GraphEdge[] = [
    {
        id: "e1",
        from: "samsung",
        to: "galaxy-s",
        label: "제조",
    },
    {
        id: "e2",
        from: "galaxy-s",
        to: "smartphone",
        label: "종류",
    },
    {
        id: "e3",
        from: "korea",
        to: "samsung",
        label: "본사 위치",
    },
    {
        id: "e4",
        from: "samsung",
        to: "galaxy-z",
        label: "제조",
    },
];


const STEP_ORDER: GraphDemoStep[] = [
    "question",
    "entity",
    "start",
    "traversal1",
    "traversal2",
    "subgraph",
    "context",
    "generating",
    "answer",
];


function stepReached(
    current: GraphDemoStep,
    target: GraphDemoStep,
) {
    if (current === "idle") {
        return false;
    }

    return (
        STEP_ORDER.indexOf(current) >=
        STEP_ORDER.indexOf(target)
    );
}


function getStepTitle(
    step: GraphDemoStep,
) {
    switch (step) {
        case "question":
            return "01 · 질문 입력";

        case "entity":
            return "02 · Entity 추출";

        case "start":
            return "03 · 시작 Node 찾기";

        case "traversal1":
            return "04 · 첫 번째 관계 탐색";

        case "traversal2":
            return "05 · 두 번째 관계 탐색";

        case "subgraph":
            return "06 · Subgraph 선택";

        case "context":
            return "07 · Context 구성";

        case "generating":
            return "08 · LLM 전달";

        case "answer":
            return "09 · 최종 답변";

        default:
            return "GRAPH RAG · READY";
    }
}


function getStepText(
    step: GraphDemoStep,
) {
    switch (step) {
        case "question":
            return "사용자 질문을 확인합니다. Graph RAG는 질문 속 대상과 관계를 찾아 그래프에서 탐색할 준비를 합니다.";

        case "entity":
            return "질문에서 핵심 Entity를 추출합니다. 이 예시에서는 '삼성'과 '스마트폰'이 주요 Entity입니다.";

        case "start":
            return "질문과 직접 연결되는 시작 Node를 찾습니다. 여기서는 '삼성' Node가 탐색의 출발점이 됩니다.";

        case "traversal1":
            return "삼성 Node에서 '제조' Relationship을 따라 Galaxy S Node로 이동합니다.";

        case "traversal2":
            return "Galaxy S Node에서 '종류' Relationship을 따라 스마트폰 Node까지 탐색합니다.";

        case "subgraph":
            return "질문과 관련된 Node와 Relationship만 남겨 작은 Subgraph를 만듭니다.";

        case "context":
            return "선택된 Subgraph의 관계를 텍스트 형태로 변환해 LLM이 사용할 Context를 구성합니다.";

        case "generating":
            return "사용자 질문과 Graph RAG가 찾은 관계 Context를 함께 LLM에 전달합니다.";

        case "answer":
            return "Graph RAG는 연결된 관계를 따라 정보를 찾기 때문에 여러 단계의 관계 질문에 강합니다.";

        default:
            return "시작하면 Graph RAG의 탐색 과정을 단계별로 보여드립니다.";
    }
}


function getNode(
    id: string,
) {
    return NODES.find(
        (node) =>
            node.id === id,
    )!;
}


function edgeStyle(
    edge: GraphEdge,
) {
    const from =
        getNode(edge.from);

    const to =
        getNode(edge.to);

    const dx =
        to.x - from.x;

    const dy =
        to.y - from.y;

    const length =
        Math.sqrt(
            dx * dx +
            dy * dy,
        );

    const angle =
        Math.atan2(
            dy,
            dx,
        ) *
        180 /
        Math.PI;

    return {
        left: `${from.x}%`,
        top: `${from.y}%`,
        width: `${length}%`,
        transform:
            `rotate(${angle}deg)`,
    };
}


export default function GraphRAGVisualizer({
                                               autoPlay = true,
                                               paused = false,
                                               restartKey = 0,
                                               startStep = null,
                                               onClose,
                                           }: GraphRAGVisualizerProps) {

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
        GraphDemoStep =
        stepIndex < 0
            ? "idle"
            : STEP_ORDER[
                Math.min(
                    stepIndex,
                    STEP_ORDER.length - 1,
                )
                ];


    const activeNodeIds =
        useMemo(
            () => {

                if (
                    stepReached(
                        step,
                        "subgraph",
                    )
                ) {
                    return [
                        "samsung",
                        "galaxy-s",
                        "smartphone",
                    ];
                }

                if (
                    stepReached(
                        step,
                        "traversal2",
                    )
                ) {
                    return [
                        "samsung",
                        "galaxy-s",
                        "smartphone",
                    ];
                }

                if (
                    stepReached(
                        step,
                        "traversal1",
                    )
                ) {
                    return [
                        "samsung",
                        "galaxy-s",
                    ];
                }

                if (
                    stepReached(
                        step,
                        "start",
                    )
                ) {
                    return [
                        "samsung",
                    ];
                }

                return [];
            },
            [step],
        );


    const activeEdgeIds =
        useMemo(
            () => {

                if (
                    stepReached(
                        step,
                        "traversal2",
                    )
                ) {
                    return [
                        "e1",
                        "e2",
                    ];
                }

                if (
                    stepReached(
                        step,
                        "traversal1",
                    )
                ) {
                    return [
                        "e1",
                    ];
                }

                return [];
            },
            [step],
        );


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

                    : step === "entity"
                        ? 3200

                        : step === "start"
                            ? 3200

                            : step === "traversal1"
                                ? 3500

                                : step === "traversal2"
                                    ? 3500

                                    : step === "subgraph"
                                        ? 3400

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
        <div className="graph-rag-visualizer">

            <header className="graph-rag-header">

                <div>
                    <small>
                        LIVE GRAPH RAG
                    </small>

                    <h2>
                        Graph RAG · Traversal Process
                    </h2>
                </div>


                <div className="graph-rag-header-actions">

                    <span>
                        {
                            String(
                                Math.max(
                                    1,
                                    stepIndex + 1,
                                ),
                            ).padStart(
                                2,
                                "0",
                            )
                        }
                        {" / "}
                        {STEP_ORDER.length}
                    </span>

                    {paused && (
                        <b>
                            PAUSED
                        </b>
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


            <div className="graph-rag-pipeline">

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
                                    "graph-rag-pipeline-step",
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


            <div className="graph-rag-body">

                <aside className="graph-rag-caption">

                    <small>
                        CURRENT STEP
                    </small>

                    <strong>
                        {
                            String(
                                Math.max(
                                    1,
                                    stepIndex + 1,
                                ),
                            ).padStart(
                                2,
                                "0",
                            )
                        }
                    </strong>

                    <h3>
                        {
                            getStepTitle(
                                step,
                            )
                                .replace(
                                    /^\d+\s*·\s*/,
                                    "",
                                )
                        }
                    </h3>

                    <div />

                    <p>
                        {
                            getStepText(
                                step,
                            )
                        }
                    </p>


                    {stepReached(
                        step,
                        "entity",
                    ) && (

                        <section className="graph-rag-entity-box">

                            <span>
                                ENTITY
                            </span>

                            <div>
                                {ENTITIES.map(
                                    (
                                        entity,
                                    ) => (
                                        <b
                                            key={
                                                entity
                                            }
                                        >
                                            {
                                                entity
                                            }
                                        </b>
                                    ),
                                )}
                            </div>

                        </section>

                    )}

                </aside>


                <main className="graph-rag-stage">

                    {stepReached(
                        step,
                        "question",
                    ) && (

                        <div className="graph-rag-question">

                            <small>
                                USER QUESTION
                            </small>

                            <strong>
                                {QUESTION}
                            </strong>

                        </div>

                    )}


                    <div className="graph-rag-network">

                        {EDGES.map(
                            (
                                edge,
                            ) => {

                                const active =
                                    activeEdgeIds.includes(
                                        edge.id,
                                    );

                                const faded =
                                    stepReached(
                                        step,
                                        "subgraph",
                                    ) &&
                                    !active;


                                return (
                                    <div
                                        key={
                                            edge.id
                                        }
                                        className={[
                                            "graph-rag-edge",
                                            active
                                                ? "active"
                                                : "",
                                            faded
                                                ? "faded"
                                                : "",
                                        ].join(
                                            " ",
                                        )}
                                        style={
                                            edgeStyle(
                                                edge,
                                            )
                                        }
                                    >

                                        <span>
                                            {
                                                edge.label
                                            }
                                        </span>

                                    </div>
                                );
                            },
                        )}


                        {NODES.map(
                            (
                                node,
                            ) => {

                                const active =
                                    activeNodeIds.includes(
                                        node.id,
                                    );

                                const faded =
                                    stepReached(
                                        step,
                                        "subgraph",
                                    ) &&
                                    !active;


                                return (
                                    <div
                                        key={
                                            node.id
                                        }
                                        className={[
                                            "graph-rag-node",
                                            `type-${node.type}`,
                                            active
                                                ? "active"
                                                : "",
                                            faded
                                                ? "faded"
                                                : "",
                                        ].join(
                                            " ",
                                        )}
                                        style={{
                                            left:
                                                `${node.x}%`,
                                            top:
                                                `${node.y}%`,
                                        }}
                                    >

                                        <small>
                                            {
                                                node.type
                                                    .toUpperCase()
                                            }
                                        </small>

                                        <strong>
                                            {
                                                node.label
                                            }
                                        </strong>

                                    </div>
                                );
                            },
                        )}


                        {stepReached(
                            step,
                            "traversal1",
                        ) && (

                            <div className="graph-rag-traversal-status">

                                TRAVERSAL
                                <b>
                                    삼성
                                </b>
                                →
                                <b>
                                    Galaxy S
                                </b>

                                {stepReached(
                                    step,
                                    "traversal2",
                                ) && (
                                    <>
                                        →
                                        <b>
                                            스마트폰
                                        </b>
                                    </>
                                )}

                            </div>

                        )}

                    </div>

                </main>


                <aside className="graph-rag-inspector">

                    <section>

                        <small>
                            GRAPH STATE
                        </small>

                        <h3>
                            현재 탐색 상태
                        </h3>


                        <div className="graph-rag-state-list">

                            <StateRow
                                label="Entity 추출"
                                active={
                                    stepReached(
                                        step,
                                        "entity",
                                    )
                                }
                            />

                            <StateRow
                                label="시작 Node"
                                active={
                                    stepReached(
                                        step,
                                        "start",
                                    )
                                }
                            />

                            <StateRow
                                label="1-Hop 탐색"
                                active={
                                    stepReached(
                                        step,
                                        "traversal1",
                                    )
                                }
                            />

                            <StateRow
                                label="2-Hop 탐색"
                                active={
                                    stepReached(
                                        step,
                                        "traversal2",
                                    )
                                }
                            />

                            <StateRow
                                label="Subgraph"
                                active={
                                    stepReached(
                                        step,
                                        "subgraph",
                                    )
                                }
                            />

                        </div>

                    </section>


                    {stepReached(
                        step,
                        "context",
                    ) && (

                        <section className="graph-rag-context">

                            <small>
                                RETRIEVED CONTEXT
                            </small>

                            <h3>
                                관계 Context
                            </h3>

                            <code>
                                삼성
                                {" -[제조]-> "}
                                Galaxy S
                            </code>

                            <code>
                                Galaxy S
                                {" -[종류]-> "}
                                스마트폰
                            </code>

                        </section>

                    )}

                </aside>

            </div>


            {stepReached(
                step,
                "generating",
            ) && (

                <div className="graph-rag-llm-flow">

                    <div>
                        QUESTION
                    </div>

                    <span>
                        +
                    </span>

                    <div>
                        GRAPH CONTEXT
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
                            삼성과 스마트폰의 관계를 따라 탐색한 결과,
                            Galaxy S가 관련 제품으로 연결됩니다.
                        </strong>

                    ) : (

                        <strong>
                            관계 정보를 바탕으로 답변 생성 중...
                        </strong>

                    )}

                </div>

            )}

        </div>
    );
}


function StateRow({
                      label,
                      active,
                  }: {
    label: string;
    active: boolean;
}) {
    return (
        <div
            className={[
                "graph-rag-state-row",
                active
                    ? "active"
                    : "",
            ].join(" ")}
        >

            <span>
                {
                    active
                        ? "●"
                        : "○"
                }
            </span>

            <strong>
                {label}
            </strong>

        </div>
    );
}