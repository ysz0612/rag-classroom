import "./rag-example-page.css";

type ExampleType = "keyword" | "vector" | "graph";

interface RagExamplePageProps {
    type: ExampleType;
    number?: string;
}

interface Candidate {
    id: string;
    icon: string;
    name: string;
    evidence: string;
    score: string;
    selected?: boolean;
}

const EXAMPLES: Record<ExampleType, {
    number: string;
    label: string;
    title: string;
    question: string;
    rule: string;
    candidates: Candidate[];
    answer: string;
    reason: string;
}> = {
    keyword: {
        number: "03",
        label: "KEYWORD RAG",
        title: "정확한 단어로 상품을 고르는 과정",
        question: "무선 면도기를 사고 싶어요!",
        rule: "[무선]과 [면도기]가 모두 들어 있는가?",
        candidates: [
            { id: "A", icon: "⚡", name: "무선 전기 면도기", evidence: "무선 ✓  면도기 ✓", score: "일치 2 / 2", selected: true },
            { id: "B", icon: "🔌", name: "유선 전기 면도기", evidence: "무선 ✕  면도기 ✓", score: "일치 1 / 2" },
            { id: "C", icon: "✂️", name: "무선 헤어 트리머", evidence: "무선 ✓  면도기 ✕", score: "일치 1 / 2" },
        ],
        answer: "상품 A 선택",
        reason: "질문의 두 핵심 단어가 모두 포함됨",
    },
    vector: {
        number: "03",
        label: "VECTOR RAG",
        title: "문장의 의미로 상품을 고르는 과정",
        question: "밤에 바르는 촉촉한 크림이 필요해요!",
        rule: "질문의 의미와 가장 가까운 상품은 무엇인가?",
        candidates: [
            { id: "A", icon: "🌙", name: "보습 나이트 크림", evidence: "밤 · 수분 · 크림", score: "유사도 0.91", selected: true },
            { id: "B", icon: "☀️", name: "자외선 차단 선크림", evidence: "낮 · 자외선 · 크림", score: "유사도 0.48" },
            { id: "C", icon: "🫧", name: "딥 클렌징 폼", evidence: "세안 · 거품 · 세정", score: "유사도 0.21" },
        ],
        answer: "상품 A 선택",
        reason: "표현은 달라도 밤·보습이라는 의미가 가장 가까움",
    },
    graph: {
        number: "04",
        label: "GRAPH RAG",
        title: "사용자 관계로 상품을 고르는 과정",
        question: "내가 좋아할 만한 상품을 추천해주세요!",
        rule: "USER1이 높게 평가한 상품과 어떻게 연결되는가?",
        candidates: [
            { id: "A", icon: "🧴", name: "스킨케어 보습 크림", evidence: "좋아한 상품과 같은 카테고리", score: "관계 2단계", selected: true },
            { id: "B", icon: "💄", name: "컬러 립스틱", evidence: "USER1과 연결 관계 없음", score: "관계 없음" },
            { id: "C", icon: "🪮", name: "헤어 스타일링 빗", evidence: "다른 사용자의 리뷰만 존재", score: "간접 관계" },
        ],
        answer: "상품 A 추천",
        reason: "USER1 → 높은 평점 상품 → 같은 카테고리로 연결됨",
    },
};

export default function RagExamplePage({ type, number }: RagExamplePageProps) {
    const example = EXAMPLES[type];

    if (type === "graph") {
        return <GraphExamplePage number={number ?? example.number} />;
    }

    return (
        <section className={`rag-choice-example ${type}`}>
            <header className="rag-choice-heading">
                <span>{number ?? example.number}.</span>
                <div>
                    <small>REAL-LIFE PRODUCT SELECTION</small>
                    <h1>{example.title}</h1>
                </div>
            </header>

            <div className="rag-choice-question">
                <div className="rag-choice-customer">🧑</div>
                <strong>“{example.question}”</strong>
                <span>→</span>
                <div>
                    <small>{example.label}의 판단 기준</small>
                    <b>{example.rule}</b>
                </div>
            </div>

            <div className="rag-choice-candidates">
                {example.candidates.map((candidate) => (
                    <article className={candidate.selected ? "selected" : ""} key={candidate.id}>
                        <span className="candidate-id">상품 {candidate.id}</span>
                        {candidate.selected && <span className="candidate-check">✓ 선택</span>}
                        <div className="candidate-icon">{candidate.icon}</div>
                        <h2>{candidate.name}</h2>
                        <p>{candidate.evidence}</p>
                        <strong>{candidate.score}</strong>
                    </article>
                ))}
            </div>

            <footer className="rag-choice-answer">
                <span>RESULT</span>
                <strong>{example.answer}</strong>
                <i>→</i>
                <p>{example.reason}</p>
            </footer>
        </section>
    );
}

function GraphExamplePage({ number }: { number: string }) {
    return (
        <section className="rag-choice-example graph graph-path-example">
            <header className="rag-choice-heading">
                <span>{number}.</span>
                <div>
                    <small>REAL-LIFE RELATION SEARCH</small>
                    <h1>관계 경로로 상품을 고르는 과정</h1>
                </div>
            </header>

            <div className="graph-example-question">
                <div className="rag-choice-customer">🧑</div>
                <strong>“내가 좋아할 만한 상품을 추천해주세요!”</strong>
                <span className="graph-question-arrow">→</span>
                <div>
                    <small>GRAPH RAG의 판단 기준</small>
                    <b>USER1에서 각 상품까지 어떤 관계 경로가 이어지는가?</b>
                </div>
            </div>

            <div className="graph-selection-stage">
                <div className="graph-main-path">
                    <GraphNode
                        className="user"
                        eyebrow="START NODE"
                        icon="👤"
                        title="USER1"
                        detail="현재 사용자"
                    />

                    <GraphEdge label="REVIEWED" detail="평점 5점" />

                    <GraphNode
                        className="reviewed"
                        eyebrow="HIGH RATING"
                        icon="🌙"
                        title="보습 나이트 크림"
                        detail="사용자가 높게 평가한 상품"
                    />

                    <GraphEdge label="BELONGS_TO" detail="카테고리" />

                    <GraphNode
                        className="category"
                        eyebrow="CATEGORY"
                        icon="✨"
                        title="스킨케어"
                        detail="취향을 연결하는 공통 관계"
                    />

                    <GraphEdge label="HAS_PRODUCT" detail="같은 카테고리" />

                    <GraphNode
                        className="result selected"
                        eyebrow="RECOMMEND"
                        icon="🧴"
                        title="상품 A · 수분 크림"
                        detail="USER1과 관계 경로가 연결됨"
                        badge="✓ 선택"
                    />
                </div>

                <div className="graph-other-products">
                    <article>
                        <span>상품 B</span>
                        <b>💄 컬러 립스틱</b>
                        <p>USER1에서 이어지는 관계 경로 없음</p>
                        <em>선택 제외</em>
                    </article>

                    <article>
                        <span>상품 C</span>
                        <b>🪮 헤어 스타일링 빗</b>
                        <p>다른 사용자의 리뷰로만 간접 연결</p>
                        <em>선택 제외</em>
                    </article>
                </div>
            </div>

            <footer className="rag-choice-answer graph-path-answer">
                <span>RESULT</span>
                <strong>상품 A 추천</strong>
                <i>→</i>
                <p>USER1과 상품 A 사이에 가장 명확한 관계 경로가 존재합니다.</p>
            </footer>
        </section>
    );
}

function GraphNode({
                       className,
                       eyebrow,
                       icon,
                       title,
                       detail,
                       badge,
                   }: {
    className: string;
    eyebrow: string;
    icon: string;
    title: string;
    detail: string;
    badge?: string;
}) {
    return (
        <article className={`graph-example-node ${className}`}>
            {badge && <span className="graph-example-badge">{badge}</span>}
            <small>{eyebrow}</small>
            <div>{icon}</div>
            <strong>{title}</strong>
            <p>{detail}</p>
        </article>
    );
}

function GraphEdge({ label, detail }: { label: string; detail: string }) {
    return (
        <div className="graph-example-edge" aria-label={`${label}, ${detail}`}>
            <span>{label}</span>
            <b>→</b>
            <small>{detail}</small>
        </div>
    );
}
