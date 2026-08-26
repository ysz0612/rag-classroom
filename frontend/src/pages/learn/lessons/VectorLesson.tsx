import {
    NodeIndexOutlined,
    SearchOutlined,
} from "@ant-design/icons";

import "./vector-lesson.css";
import RagExamplePage from "./RagExamplePage";


interface VectorLessonProps {
    pageIndex: number;
    totalPages: number;
}


export default function VectorLesson({
                                         pageIndex,
                                         totalPages,
                                     }: VectorLessonProps) {

    return (
        <div className="lesson-screen vector-screen">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="lesson-screen-header">

                <span>
                    04. VECTOR RAG
                </span>

                <span>
                    {pageIndex + 1} / {totalPages}
                </span>

            </div>


            {/* =====================================================
                PAGE 01
            ===================================================== */}

            {pageIndex === 0 && (
                <section className="vector-page vector-page-one">

                    {/* TITLE */}

                    <header className="vector-page-title">

                        <span className="vector-page-number">
                            01.
                        </span>

                        <div>

                            <small>
                                WHY SEMANTIC RETRIEVAL?
                            </small>

                            <h1>
                                같은 뜻을 다르게 표현하면,
                                <em>
                                    단어 검색만으로 충분할까?
                                </em>
                            </h1>

                        </div>

                    </header>


                    {/* SUMMARY */}

                    <div className="vector-summary">

                        <SearchOutlined />

                        <div>

                            <strong>
                                사용자는 데이터에 적힌 단어를 그대로 사용하지 않습니다.
                                그래서 표현이 달라도 의미가 가까운 정보를 찾을 방법이 필요합니다.
                            </strong>

                            <p>
                                Vector RAG는 질문과 문서를 같은 임베딩 공간의
                                숫자 벡터로 변환하고, 두 벡터의 가까운 정도를 비교합니다.
                            </p>

                        </div>

                    </div>


                    {/* MAIN PROCESS */}

                    <div className="vector-process">

                        {/* QUESTION */}

                        <article className="vector-question-card">

                            <span className="vector-card-index">
                                01 · QUESTION
                            </span>

                            <small>
                                서로 다른 표현
                            </small>

                            <strong>
                                단어는 달라도
                                뜻이 비슷한 질문
                            </strong>

                        </article>


                        <div className="vector-process-arrow">
                            →
                        </div>


                        {/* EMBEDDING */}

                        <article className="vector-embedding-card">

                            <span className="vector-card-index">
                                02 · EMBEDDING
                            </span>

                            <div className="vector-embedding-icon">
                                [ ]
                            </div>

                            <small>
                                의미를 숫자로 변환
                            </small>

                            <strong>
                                [ 0.21, -0.43,
                                <br />
                                0.82, 0.17, ... ]
                            </strong>

                        </article>


                        <div className="vector-process-arrow">
                            →
                        </div>


                        {/* VECTOR SPACE */}

                        <article className="vector-space-panel">

                            <div className="vector-space-header">

                                <div>
                                    <NodeIndexOutlined />

                                    <strong>
                                        VECTOR SPACE
                                    </strong>
                                </div>

                                <span>
                                    SIMILARITY SEARCH
                                </span>

                            </div>


                            <div className="vector-space-body">

                                <div className="vector-map">

                                    <div className="vector-line line-a" />
                                    <div className="vector-line line-b" />
                                    <div className="vector-line line-c" />

                                    <div className="vector-point query-point">
                                        Q
                                        <span>질문</span>
                                    </div>

                                    <div className="vector-point document-a">
                                        A
                                        <span>0.92</span>
                                    </div>

                                    <div className="vector-point document-b">
                                        B
                                        <span>0.81</span>
                                    </div>

                                    <div className="vector-point document-c">
                                        C
                                        <span>0.24</span>
                                    </div>

                                </div>


                                <div className="vector-ranking">

                                    <div className="vector-ranking-title">
                                        검색 결과
                                    </div>


                                    <div className="vector-rank-item best">

                                        <span>
                                            01
                                        </span>

                                        <div>
                                            <strong>
                                                문서 A
                                            </strong>

                                            <small>
                                                의미가 가장 가까운 문서
                                            </small>
                                        </div>

                                        <b>
                                            0.92
                                        </b>

                                    </div>


                                    <div className="vector-rank-item">

                                        <span>
                                            02
                                        </span>

                                        <div>
                                            <strong>
                                                문서 B
                                            </strong>

                                            <small>
                                                관련 의미를 포함한 문서
                                            </small>
                                        </div>

                                        <b>
                                            0.81
                                        </b>

                                    </div>


                                    <div className="vector-rank-item weak">

                                        <span>
                                            03
                                        </span>

                                        <div>
                                            <strong>
                                                문서 C
                                            </strong>

                                            <small>
                                                의미적 관련성이 낮음
                                            </small>
                                        </div>

                                        <b>
                                            0.24
                                        </b>

                                    </div>

                                </div>

                            </div>

                        </article>

                    </div>


                    {/* BOTTOM MESSAGE */}

                    <div className="vector-key-message">

                        <span>
                            KEY POINT
                        </span>

                        <strong>
                            질문 임베딩 → 벡터 비교 → 코사인 유사도 정렬 → 임계값 통과
                        </strong>

                        <p>
                            다음 페이지에서는 이 원리가 상품 A·B·C 중
                            의미가 가장 가까운 상품을 고르는 과정에 적용됩니다.
                        </p>

                    </div>

                </section>
            )}


            {/* =====================================================
                PAGE 02
            ===================================================== */}

            {pageIndex === 2 && (
                <section className="vector-page vector-page-two">

                    {/* TITLE */}

                    <header className="vector-page-title">

                        <span className="vector-page-number">
                            03.
                        </span>

                        <div>

                            <small>
                                WHEN IS VECTOR RAG BEST?
                            </small>

                            <h1>
                                Vector RAG가
                                <em>
                                    가장 효율적인 상황
                                </em>
                            </h1>

                        </div>

                    </header>


                    {/* DECISION */}

                    <div className="vector-decision">

                        <div className="vector-decision-question">

                            <small>
                                DECISION POINT
                            </small>

                            <strong>
                                “정확한 검색어는 모르지만,
                                비슷한 의미의 정보를 찾고 싶은가?”
                            </strong>

                        </div>


                        <div className="vector-decision-arrow">
                            →
                        </div>


                        <div className="vector-decision-answer">

                            <span>
                                YES
                            </span>

                            <div>
                                <small>
                                    BEST CHOICE
                                </small>

                                <strong>
                                    Vector RAG
                                </strong>
                            </div>

                        </div>

                    </div>


                    {/* MAIN GRID */}

                    <div className="vector-page-two-grid">

                        {/* USE CASE */}

                        <section className="vector-use-panel">

                            <div className="vector-panel-heading">

                                <small>
                                    BEST USE CASE
                                </small>

                                <h2>
                                    효율적인 분야와 실제 사례
                                </h2>

                            </div>


                            <div className="vector-use-items">

                                <div>

                                    <span>
                                        01
                                    </span>

                                    <section>

                                        <strong>
                                            고객 상담
                                        </strong>

                                        <p>
                                            “찬바람이 안 나와요”로
                                            “냉방 성능 저하” 문서를 검색
                                        </p>

                                    </section>

                                </div>


                                <div>

                                    <span>
                                        02
                                    </span>

                                    <section>

                                        <strong>
                                            교육 자료
                                        </strong>

                                        <p>
                                            학생의 일상적인 질문과 의미가
                                            가까운 강의 내용을 검색
                                        </p>

                                    </section>

                                </div>


                                <div>

                                    <span>
                                        03
                                    </span>

                                    <section>

                                        <strong>
                                            사내 지식 검색
                                        </strong>

                                        <p>
                                            직원의 자연어 질문과 관련된
                                            업무 문서·FAQ를 검색
                                        </p>

                                    </section>

                                </div>


                                <div>

                                    <span>
                                        04
                                    </span>

                                    <section>

                                        <strong>
                                            유사 상품 검색
                                        </strong>

                                        <p>
                                            “충전해서 쓰는 얼굴 털 제거 도구”로
                                            “무선 면도기”를 검색
                                        </p>

                                    </section>

                                </div>

                            </div>

                        </section>


                        {/* STRENGTH + LIMITATION */}

                        <section className="vector-evaluation">

                            <article className="vector-evaluation-card strength">

                                <div className="vector-evaluation-title">

                                    <span>
                                        +
                                    </span>

                                    <div>

                                        <small>
                                            STRENGTH
                                        </small>

                                        <h2>
                                            장점
                                        </h2>

                                    </div>

                                </div>


                                <ul>

                                    <li>
                                        표현이 달라도 의미가 비슷한
                                        정보를 검색할 수 있습니다.
                                    </li>

                                    <li>
                                        자연어 형태의 질문을 처리하기에
                                        유리합니다.
                                    </li>

                                    <li>
                                        많은 문서에서 관련도가 높은
                                        자료를 순위화할 수 있습니다.
                                    </li>

                                </ul>

                            </article>


                            <article className="vector-evaluation-card limitation">

                                <div className="vector-evaluation-title">

                                    <span>
                                        !
                                    </span>

                                    <div>

                                        <small>
                                            LIMITATION
                                        </small>

                                        <h2>
                                            한계
                                        </h2>

                                    </div>

                                </div>


                                <ul>

                                    <li>
                                        임베딩 모델의 품질에 따라
                                        검색 결과가 달라질 수 있습니다.
                                    </li>

                                    <li>
                                        정확한 코드나 ID 검색에서는
                                        Keyword 방식이 더 유리할 수 있습니다.
                                    </li>

                                    <li>
                                        데이터 사이의 복잡한 관계를
                                        직접 탐색하는 방식은 아닙니다.
                                    </li>

                                </ul>

                            </article>

                        </section>

                    </div>


                    {/* NEXT GRAPH */}

                    <div className="vector-next">

                        <div>

                            <small>
                                NEXT QUESTION
                            </small>

                            <strong>
                                의미가 비슷한 것만으로 부족하다면?
                            </strong>

                        </div>


                        <p>
                            사람 · 상품 · 기업처럼 데이터 사이의
                            <b>연결 관계</b>까지 따라가야 합니다.
                        </p>


                        <span>
                            GRAPH RAG →
                        </span>

                    </div>

                </section>
            )}

            {pageIndex === 1 && (
                <RagExamplePage type="vector" number="02" />
            )}

        </div>
    );
}
