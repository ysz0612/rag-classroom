type SummaryLessonProps = {
    pageIndex: number;
    totalPages: number;
};

const ragCards = [
    {
        key: "KEYWORD",
        title: "Keyword RAG",
        question: "정확히 어떤 단어가 있나요?",
        description: "모델명·오류 코드·문서번호처럼 정확한 문자열을 찾을 때",
        fields: "전자상거래 · 고객센터 · 문서 관리",
        example: "세탁기 E-102 오류의 해결 절차를 매뉴얼에서 검색",
        color: "#d69b43",
        background: "#fff7e8",
    },
    {
        key: "VECTOR",
        title: "Vector RAG",
        question: "의미가 비슷한 내용은 무엇인가요?",
        description: "표현이 달라도 의미와 의도가 비슷한 정보를 찾을 때",
        fields: "고객 상담 · 교육 · 사내 지식 검색",
        example: "‘찬바람이 안 나와요’로 ‘냉방 성능 저하’ 문서를 검색",
        color: "#4b78a8",
        background: "#eef6ff",
    },
    {
        key: "GRAPH",
        title: "Graph RAG",
        question: "무엇과 연결되어 있나요?",
        description: "사용자·상품·브랜드의 여러 단계 관계를 찾을 때",
        fields: "금융 · 보안 · 추천 · 공급망",
        example: "고객 → 계좌 → 송금 → 사업체 경로로 이상거래 탐지",
        color: "#5b8d70",
        background: "#edf8f1",
    },
];

export default function SummaryLesson({
                                          pageIndex,
                                          totalPages,
                                      }: SummaryLessonProps) {
    return (
        <div
            className="lesson-screen summary-lesson"
            style={{
                height: "100%",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                overflow: "auto",
                background:
                    "linear-gradient(180deg, #fbfcfa 0%, #eef4f1 100%)",
                color: "#26363b",
            }}
        >
            <div className="lesson-screen-header">
                <span>RAG CLASSROOM · COMPLETE</span>
                <span>{pageIndex + 1} / {totalPages}</span>
            </div>

            <div
                style={{
                    padding: "18px 22px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                }}
            >
                <header style={{ textAlign: "center" }}>
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 7,
                            padding: "5px 11px",
                            borderRadius: 999,
                            background: "#dfeee6",
                            color: "#35604a",
                            fontSize: 12,
                            fontWeight: 900,
                            letterSpacing: "0.04em",
                        }}
                    >
                        ✓ 수업 완료 · 100%
                    </div>

                    <h1
                        style={{
                            margin: "8px 0 3px",
                            fontSize: "clamp(22px, 2.6vw, 34px)",
                            lineHeight: 1.1,
                        }}
                    >
                        오늘의 RAG 수업 요약
                    </h1>

                    <p
                        style={{
                            margin: 0,
                            color: "#65747a",
                            fontSize: 13,
                        }}
                    >
                        질문과 데이터에 맞는 검색 방식을 선택하세요.
                    </p>
                </header>

                <section
                    aria-label="RAG 검색 방식 비교"
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(3, minmax(0, 1fr))",
                        gap: 10,
                    }}
                >
                    {ragCards.map((card) => (
                        <article
                            key={card.key}
                            style={{
                                minWidth: 0,
                                padding: "12px 11px",
                                border: `2px solid ${card.color}`,
                                borderRadius: 12,
                                background: card.background,
                                boxShadow:
                                    "0 5px 0 rgba(45, 60, 64, 0.09)",
                            }}
                        >
                            <div
                                style={{
                                    color: card.color,
                                    fontSize: 10,
                                    fontWeight: 900,
                                    letterSpacing: "0.12em",
                                }}
                            >
                                {card.key}
                            </div>
                            <h2
                                style={{
                                    margin: "4px 0 7px",
                                    fontSize: 17,
                                }}
                            >
                                {card.title}
                            </h2>
                            <strong
                                style={{
                                    display: "block",
                                    minHeight: 34,
                                    fontSize: 12,
                                    lineHeight: 1.4,
                                }}
                            >
                                {card.question}
                            </strong>
                            <p
                                style={{
                                    margin: "7px 0 0",
                                    color: "#5f6d72",
                                    fontSize: 11,
                                    lineHeight: 1.45,
                                }}
                            >
                                {card.description}
                            </p>

                            <div
                                style={{
                                    marginTop: 9,
                                    paddingTop: 8,
                                    borderTop: `1px solid ${card.color}55`,
                                }}
                            >
                                <strong
                                    style={{
                                        display: "block",
                                        color: card.color,
                                        fontSize: 11,
                                        lineHeight: 1.35,
                                    }}
                                >
                                    효율적인 분야
                                </strong>
                                <p
                                    style={{
                                        margin: "3px 0 7px",
                                        color: "#405158",
                                        fontSize: 11,
                                        fontWeight: 800,
                                        lineHeight: 1.4,
                                    }}
                                >
                                    {card.fields}
                                </p>
                                <strong
                                    style={{
                                        display: "block",
                                        color: card.color,
                                        fontSize: 11,
                                    }}
                                >
                                    실제 상황
                                </strong>
                                <p
                                    style={{
                                        margin: "3px 0 0",
                                        color: "#5f6d72",
                                        fontSize: 10.5,
                                        lineHeight: 1.45,
                                    }}
                                >
                                    {card.example}
                                </p>
                            </div>
                        </article>
                    ))}
                </section>

                <section
                    aria-label="프로젝트 작동 과정"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexWrap: "wrap",
                        gap: 7,
                        padding: "10px 12px",
                        border: "1px solid #9eb3ad",
                        borderRadius: 10,
                        background: "rgba(255, 255, 255, 0.78)",
                        fontSize: 12,
                        fontWeight: 800,
                    }}
                >
                    <span>음성 질문</span>
                    <span aria-hidden="true">→</span>
                    <span>Whisper 텍스트 변환</span>
                    <span aria-hidden="true">→</span>
                    <span>RAG 검색</span>
                    <span aria-hidden="true">→</span>
                    <span>GPT 답변 생성</span>
                </section>

                <footer
                    style={{
                        padding: "12px 16px",
                        borderRadius: 11,
                        background: "#314c55",
                        color: "#ffffff",
                        textAlign: "center",
                        boxShadow:
                            "inset 0 0 0 2px rgba(255,255,255,0.12)",
                    }}
                >
                    <strong
                        style={{
                            display: "block",
                            fontSize: 15,
                            lineHeight: 1.45,
                        }}
                    >
                        정확한 단어는 Keyword, 비슷한 의미는 Vector,
                        연결 관계는 Graph RAG가 적합합니다.
                    </strong>
                    <span
                        style={{
                            display: "block",
                            marginTop: 5,
                            color: "#cfe0dc",
                            fontSize: 11,
                        }}
                    >
                        같은 분야라도 질문의 검색 기준에 따라 달라지며,
                        실제 서비스에서는 세 방식을 함께 사용하기도 합니다.
                    </span>
                </footer>
            </div>
        </div>
    );
}