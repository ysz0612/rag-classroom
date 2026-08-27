import "./graph-lesson.css";

interface GraphLessonProps {
    pageIndex: number;
    totalPages: number;
}


export default function GraphLesson({
                                        pageIndex,
                                        totalPages,
                                    }: GraphLessonProps) {

    return (
        <div className="lesson-screen graph-lesson-screen">

            <div className="lesson-screen-header">
                <span>05. GRAPH RAG</span>

                <span>
                    {pageIndex + 1}
                    {" / "}
                    {totalPages}
                </span>
            </div>


            {pageIndex === 0 && (
                <section className="graph-lesson-page">

                    <div className="graph-lesson-kicker">
                        WHY RELATION RETRIEVAL? · 01
                    </div>

                    <h1>
                        질문에 적혀 있지 않은 정보는 어디에서 찾을까?
                    </h1>

                    <p className="graph-lesson-lead">
                        개인의 취향이나 구매 이력은 질문 문장 자체가 아니라
                        <strong>
                            데이터에 저장된 연결 관계
                        </strong>
                        에 존재합니다. Graph RAG는 이 관계를 따라가며 근거를 찾습니다.
                    </p>


                    <div className="graph-intro-layout">

                        <div className="graph-network">

                            <div className="graph-node node-korea">
                                사용자
                            </div>

                            <div className="graph-relation relation-hq">
                                작성
                            </div>

                            <div className="graph-line line-korea" />


                            <div className="graph-node node-samsung">
                                리뷰
                            </div>

                            <div className="graph-relation relation-left">
                                평가
                            </div>

                            <div className="graph-relation relation-right">
                                분류
                            </div>

                            <div className="graph-line line-left" />
                            <div className="graph-line line-right" />


                            <div className="graph-node node-galaxy-s">
                                상품
                            </div>

                            <div className="graph-node node-galaxy-z">
                                카테고리
                            </div>

                            <div className="graph-node node-phone">
                                후보 상품
                            </div>

                        </div>


                        <div className="graph-term-list">

                            <div className="graph-term-card">
                                <span>NODE</span>

                                <div>
                                    <strong>정보</strong>

                                    <p>
                                        사람, 회사, 제품처럼
                                        하나의 대상을 의미합니다.
                                    </p>
                                </div>
                            </div>


                            <div className="graph-term-card">
                                <span>RELATIONSHIP</span>

                                <div>
                                    <strong>
                                        정보 사이의 관계
                                    </strong>

                                    <p>
                                        제조, 소속, 구매처럼
                                        Node 사이의 연결을 나타냅니다.
                                    </p>
                                </div>
                            </div>


                            <div className="graph-term-card">
                                <span>PROPERTY</span>

                                <div>
                                    <strong>세부 속성</strong>

                                    <p>
                                        이름, 가격, 출시일처럼
                                        Node가 가진 값을 의미합니다.
                                    </p>
                                </div>
                            </div>

                        </div>

                    </div>


                    <div className="graph-lesson-summary">
                        사용자 확인 → 연결된 기록 탐색 → 관계 경로 비교 → 근거가 있는 결과 선택
                        <strong>
                            다음 페이지에서는 이 경로로 상품 A·B·C 중 하나를 선택합니다.
                        </strong>
                    </div>

                </section>
            )}


            {pageIndex === 2 && (
                <section className="graph-lesson-page">

                    <div className="graph-lesson-kicker">
                        GRAPH RAG · 03
                    </div>

                    <h1>
                        Graph RAG는 어디에 가장 좋은가?
                    </h1>

                    <p className="graph-lesson-lead">
                        Graph RAG는 단순히 비슷한 정보를 찾는 것보다
                        <strong>
                            정보 사이의 연결 관계가 중요한 질문
                        </strong>
                        에 강합니다.
                    </p>


                    <div className="graph-use-grid">

                        <UseCard
                            number="01"
                            title="금융 · 이상거래 탐지"
                            text="고객 → 계좌 → 송금 → 사업체 경로를 따라 의심스러운 거래 연결을 탐색"
                        />

                        <UseCard
                            number="02"
                            title="개인화 추천"
                            text="사용자 → 높은 평점 상품 → 브랜드 → 다른 상품 관계를 따라 추천"
                        />

                        <UseCard
                            number="03"
                            title="공급망 · 보안 분석"
                            text="기업 → 공급업체 → 부품 또는 사용자 → 기기 → 접속 경로의 위험 연결을 추적"
                        />

                    </div>


                    <div className="rag-method-summary">

                        <div>
                            <span>Keyword RAG</span>
                            <strong>
                                같은 단어를 찾는다
                            </strong>
                        </div>

                        <div>
                            <span>Vector RAG</span>
                            <strong>
                                비슷한 의미를 찾는다
                            </strong>
                        </div>

                        <div className="active">
                            <span>Graph RAG</span>
                            <strong>
                                연결된 관계를 찾는다
                            </strong>
                        </div>

                    </div>


                    <div className="graph-lesson-summary">
                        관계가 많고 여러 단계를 따라가야 할수록
                        <strong> Graph RAG </strong>
                        가 강점을 가집니다.
                    </div>

                </section>
            )}

            {pageIndex === 1 && (
                <section className="graph-lesson-page graph-example-page">

                    <div className="graph-lesson-kicker">
                        MULTI-HOP RELATION · 02
                    </div>

                    <h1>
                        Graph RAG는 연결된 관계를 따라 답을 찾습니다
                    </h1>

                    <div className="graph-example-question">
                        <span>QUESTION</span>

                        <strong>
                            user1이 높게 평가한 상품과 같은 브랜드의
                            다른 상품을 추천해줘.
                        </strong>
                    </div>

                    <div
                        className="graph-example-path"
                        aria-label="사용자에서 리뷰 상품과 브랜드를 거쳐 다른 상품을 찾는 관계 경로"
                    >
                        <GraphPathNode
                            step="START"
                            kind="USER"
                            title="user1"
                            description="질문의 시작점"
                        />

                        <GraphPathEdge
                            relation="REVIEWED"
                            detail="평점 5"
                        />

                        <GraphPathNode
                            step="1"
                            kind="PRODUCT"
                            title="무선 이어폰"
                            description="높게 평가한 상품"
                        />

                        <GraphPathEdge
                            relation="MADE_BY"
                            detail="제조 브랜드"
                        />

                        <GraphPathNode
                            step="2"
                            kind="BRAND"
                            title="Samsung"
                            description="상품의 브랜드"
                            active
                        />

                        <GraphPathEdge
                            relation="MADE_BY"
                            detail="역방향 탐색"
                            reverse
                        />

                        <GraphPathNode
                            step="RESULT"
                            kind="PRODUCT"
                            title="무선 헤드폰"
                            description="같은 브랜드의 다른 상품"
                            result
                        />
                    </div>

                    <div className="graph-example-bottom">
                        <div className="graph-example-steps">
                            <strong>관계 탐색 순서</strong>

                            <ol>
                                <li><span>1</span> user1이 높게 평가한 상품 확인</li>
                                <li><span>2</span> 상품과 연결된 브랜드 확인</li>
                                <li><span>3</span> 같은 브랜드의 다른 상품 탐색</li>
                            </ol>
                        </div>

                        <div className="graph-example-answer">
                            <span>GROUNDED ANSWER</span>

                            <p>
                                user1은 <strong>무선 이어폰</strong>을 높게 평가했습니다.
                                이 상품과 같은 <strong>Samsung</strong> 브랜드에 연결된
                                <strong> 무선 헤드폰</strong>을 추천합니다.
                            </p>

                            <small>
                                근거 경로: user1 → 무선 이어폰 → Samsung → 무선 헤드폰
                            </small>
                        </div>
                    </div>

                    <div className="graph-lesson-summary graph-example-summary">
                        비슷한 문장을 찾은 것이 아니라
                        <strong> 사용자 → 상품 → 브랜드 → 다른 상품 </strong>
                        관계를 여러 단계 따라간 결과입니다.
                    </div>

                    <style>{GRAPH_EXAMPLE_STYLES}</style>
                </section>
            )}

        </div>
    );
}


function UseCard({
                     number,
                     title,
                     text,
                 }: {
    number: string;
    title: string;
    text: string;
}) {
    return (
        <div className="graph-use-card">

            <span>
                {number}
            </span>

            <strong>
                {title}
            </strong>

            <p>
                {text}
            </p>

        </div>
    );
}


function GraphPathNode({
                           step,
                           kind,
                           title,
                           description,
                           active = false,
                           result = false,
                       }: {
    step: string;
    kind: string;
    title: string;
    description: string;
    active?: boolean;
    result?: boolean;
}) {
    return (
        <div
            className={`graph-path-node${active ? " active" : ""}${result ? " result" : ""}`}
        >
            <span className="graph-path-step">{step}</span>
            <span className="graph-path-kind">{kind}</span>
            <strong>{title}</strong>
            <p>{description}</p>
        </div>
    );
}


function GraphPathEdge({
                           relation,
                           detail,
                           reverse = false,
                       }: {
    relation: string;
    detail: string;
    reverse?: boolean;
}) {
    return (
        <div className={`graph-path-edge${reverse ? " reverse" : ""}`}>
            <span>{relation}</span>
            <div className="graph-path-edge-line" />
            <small>{detail}</small>
        </div>
    );
}


const GRAPH_EXAMPLE_STYLES = `
    .graph-example-page {
        gap: 12px;
    }

    .graph-example-page h1 {
        margin-bottom: 2px;
    }

    .graph-example-question {
        display: flex;
        align-items: center;
        gap: 18px;
        padding: 13px 18px;
        border: 1px solid #b9d7d2;
        border-radius: 12px;
        background: #f3fbf9;
    }

    .graph-example-question span,
    .graph-example-answer > span {
        flex: 0 0 auto;
        color: #287d73;
        font: 700 11px/1.2 monospace;
        letter-spacing: .08em;
    }

    .graph-example-question strong {
        color: #193c3a;
        font-size: 18px;
        line-height: 1.35;
    }

    .graph-example-path {
        display: grid;
        grid-template-columns: minmax(115px, 1fr) 82px minmax(125px, 1fr) 82px minmax(115px, 1fr) 82px minmax(135px, 1.1fr);
        align-items: center;
        gap: 8px;
        padding: 16px;
        border: 1px solid #d8e2e0;
        border-radius: 14px;
        background: #fbfdfd;
    }

    .graph-path-node {
        position: relative;
        min-height: 112px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 14px 9px 11px;
        border: 2px solid #9db6b2;
        border-radius: 16px;
        background: #ffffff;
        text-align: center;
        box-shadow: 0 5px 14px rgba(32, 68, 64, .08);
    }

    .graph-path-node.active {
        border-color: #4e8f87;
        background: #edf8f6;
    }

    .graph-path-node.result {
        border-color: #e0a55b;
        background: #fff8ed;
        box-shadow: 0 7px 18px rgba(191, 123, 38, .14);
    }

    .graph-path-step {
        position: absolute;
        top: -9px;
        padding: 3px 8px;
        border-radius: 999px;
        background: #344d4b;
        color: #ffffff;
        font: 700 10px/1 monospace;
    }

    .graph-path-node.result .graph-path-step {
        background: #c47924;
    }

    .graph-path-kind {
        margin-bottom: 7px;
        color: #63807d;
        font: 700 10px/1 monospace;
        letter-spacing: .08em;
    }

    .graph-path-node strong {
        color: #203c39;
        font-size: 16px;
    }

    .graph-path-node p {
        margin: 6px 0 0;
        color: #637573;
        font-size: 11px;
        line-height: 1.35;
    }

    .graph-path-edge {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        color: #53716e;
        text-align: center;
    }

    .graph-path-edge > span {
        font: 700 10px/1 monospace;
    }

    .graph-path-edge small {
        color: #7c8e8c;
        font-size: 10px;
    }

    .graph-path-edge-line {
        position: relative;
        width: 100%;
        height: 2px;
        background: #7fa09c;
    }

    .graph-path-edge-line::after {
        content: "";
        position: absolute;
        right: -1px;
        top: 50%;
        width: 7px;
        height: 7px;
        border-top: 2px solid #7fa09c;
        border-right: 2px solid #7fa09c;
        transform: translateY(-50%) rotate(45deg);
    }

    .graph-path-edge.reverse .graph-path-edge-line::after {
        right: auto;
        left: -1px;
        border: 0;
        border-bottom: 2px solid #7fa09c;
        border-left: 2px solid #7fa09c;
    }

    .graph-example-bottom {
        display: grid;
        grid-template-columns: .9fr 1.1fr;
        gap: 12px;
    }

    .graph-example-steps,
    .graph-example-answer {
        padding: 14px 16px;
        border: 1px solid #d9e2e1;
        border-radius: 12px;
        background: #ffffff;
    }

    .graph-example-steps > strong {
        color: #294a47;
        font-size: 13px;
    }

    .graph-example-steps ol {
        display: grid;
        gap: 7px;
        margin: 10px 0 0;
        padding: 0;
        list-style: none;
    }

    .graph-example-steps li {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #536866;
        font-size: 12px;
    }

    .graph-example-steps li span {
        display: grid;
        width: 20px;
        height: 20px;
        place-items: center;
        border-radius: 50%;
        background: #e6f3f1;
        color: #287d73;
        font-size: 11px;
        font-weight: 800;
    }

    .graph-example-answer {
        background: #f9fcfb;
    }

    .graph-example-answer p {
        margin: 8px 0;
        color: #3e5552;
        font-size: 13px;
        line-height: 1.55;
    }

    .graph-example-answer p strong {
        color: #1f6f66;
    }

    .graph-example-answer small {
        color: #7a8e8b;
        font-size: 10px;
    }

    .graph-example-summary {
        margin-top: 0;
    }

    @media (max-width: 1050px) {
        .graph-example-path {
            grid-template-columns: 1fr 55px 1fr 55px 1fr 55px 1fr;
        }

        .graph-path-node {
            min-height: 104px;
        }
    }
`;