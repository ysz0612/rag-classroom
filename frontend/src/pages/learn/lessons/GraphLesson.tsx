import "./graph-lesson.css";
import RagExamplePage from "./RagExamplePage";

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
                <RagExamplePage type="graph" number="02" />
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
