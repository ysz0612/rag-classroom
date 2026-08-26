import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    FileSearchOutlined,
    SearchOutlined,
} from "@ant-design/icons";

import "./keyword-lesson.css";
import RagExamplePage from "./RagExamplePage";


interface KeywordLessonProps {
    pageIndex: number;
    totalPages: number;
}


export default function KeywordLesson({
                                          pageIndex,
                                          totalPages,
                                      }: KeywordLessonProps) {

    return (
        <div className="lesson-screen keyword-screen">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="lesson-screen-header">

                <span>
                    03. KEYWORD RAG
                </span>

                <span>
                    {pageIndex + 1} / {totalPages}
                </span>

            </div>


            {/* =====================================================
                PAGE 01
            ===================================================== */}

            {pageIndex === 0 && (
                <section className="keyword-page keyword-page-one">

                    {/* =========================
                        TITLE
                    ========================= */}

                    <header className="keyword-page-title">

                        <span className="keyword-page-number">
                            01.
                        </span>

                        <div>

                            <small>
                                WHY KEYWORD RETRIEVAL?
                            </small>

                            <h1>
                                정확한 명칭을 알고 있다면,
                                <em>
                                    의미 추론이 필요할까?
                                </em>
                            </h1>

                        </div>

                    </header>


                    {/* =========================
                        DESCRIPTION
                    ========================= */}

                    <div className="keyword-summary">

                        <SearchOutlined />

                        <div>

                            <strong>
                                제품명·문서 번호·오류 코드처럼 정확한 표현이 있다면
                                같은 문자열을 직접 찾는 것이 가장 빠릅니다.
                            </strong>

                            <p>
                                Keyword RAG는 문장의 전체 의미를 해석하기보다
                                질문에서 검색에 필요한 단어를 뽑고,
                                그 단어가 포함된 정보에 높은 점수를 줍니다.
                            </p>

                        </div>

                    </div>


                    {/* =========================
                        MAIN FLOW
                    ========================= */}

                    <div className="keyword-flow">

                        {/* QUESTION */}

                        <article className="keyword-flow-step question">

                            <div className="keyword-step-label">
                                01 · QUESTION
                            </div>

                            <div className="keyword-step-content">

                                <span className="keyword-step-icon">
                                    ?
                                </span>

                                <small>
                                    입력
                                </small>

                                <strong>
                                    사용자가 입력한
                                    질문 문장
                                </strong>

                            </div>

                        </article>


                        <div className="keyword-flow-arrow">
                            →
                        </div>


                        {/* KEYWORD */}

                        <article className="keyword-flow-step extraction">

                            <div className="keyword-step-label">
                                02 · KEYWORD
                            </div>

                            <div className="keyword-step-content">

                                <span className="keyword-key-symbol">
                                    Aa
                                </span>

                                <small>
                                    불필요한 표현 제거
                                </small>

                                <strong>
                                    핵심 단어만 추출
                                </strong>

                            </div>

                        </article>


                        <div className="keyword-flow-arrow">
                            →
                        </div>


                        {/* RESULTS */}

                        <article className="keyword-search-panel">

                            <div className="keyword-search-header">

                                <div>
                                    <FileSearchOutlined />

                                    <strong>
                                        문서 검색 결과
                                    </strong>
                                </div>

                                <span>
                                    EXACT MATCH
                                </span>

                            </div>


                            <div className="keyword-search-results">

                                {/* RESULT 01 */}

                                <div className="keyword-search-item matched">

                                    <CheckCircleOutlined />

                                    <div className="keyword-search-text">

                                    <strong>
                                        문서 A
                                    </strong>

                                    <p>
                                            핵심 단어가 제목과 설명에
                                            모두 포함되어 있습니다.
                                        </p>

                                    </div>

                                    <span className="keyword-match-badge">
                                        정확 일치
                                    </span>

                                </div>


                                {/* RESULT 02 */}

                                <div className="keyword-search-item matched">

                                    <CheckCircleOutlined />

                                    <div className="keyword-search-text">

                                    <strong>
                                        문서 B
                                    </strong>

                                    <p>
                                            핵심 단어 일부가 포함되어 있어
                                            다음 후보로 선택됩니다.
                                        </p>

                                    </div>

                                    <span className="keyword-match-badge">
                                        일부 일치
                                    </span>

                                </div>


                                {/* RESULT 03 */}

                                <div className="keyword-search-item missed">

                                    <CloseCircleOutlined />

                                    <div className="keyword-search-text">

                                    <strong>
                                        문서 C
                                    </strong>

                                    <p>
                                            핵심 단어가 포함되어 있지 않아
                                            검색 후보에서 제외됩니다.
                                        </p>

                                    </div>

                                    <span className="keyword-match-badge">
                                        불일치
                                    </span>

                                </div>

                            </div>

                        </article>

                    </div>


                    {/* =========================
                        CONCLUSION
                    ========================= */}

                    <div className="keyword-conclusion">

                        <span>
                            KEY POINT
                        </span>

                        <strong>
                            질문 정리 → 핵심 단어 추출 → 문자열 비교 → 일치 점수 정렬
                        </strong>

                        <p>
                            다음 페이지에서는 이 원리가 상품 A·B·C 중
                            하나를 고르는 과정에 어떻게 적용되는지 확인합니다.
                        </p>

                    </div>

                </section>
            )}


            {/* =====================================================
                PAGE 02
            ===================================================== */}

            {pageIndex === 2 && (
                <section className="keyword-page keyword-page-two">

                    {/* =========================
                        TITLE
                    ========================= */}

                    <header className="keyword-page-title">

                        <span className="keyword-page-number">
                            03.
                        </span>

                        <div>

                            <small>
                                WHEN IS KEYWORD RAG BEST?
                            </small>

                            <h1>
                                Keyword RAG가
                                <em>
                                    가장 효율적인 상황
                                </em>
                            </h1>

                        </div>

                    </header>


                    {/* =========================
                        DECISION
                    ========================= */}

                    <div className="keyword-decision">

                        <div className="keyword-decision-question">

                            <small>
                                DECISION POINT
                            </small>

                            <strong>
                                “내가 찾으려는 단어나 명칭을
                                정확히 알고 있는가?”
                            </strong>

                        </div>


                        <div className="keyword-decision-arrow">
                            →
                        </div>


                        <div className="keyword-decision-answer">

                            <span>
                                YES
                            </span>

                            <div>
                                <small>
                                    BEST CHOICE
                                </small>

                                <strong>
                                    Keyword RAG
                                </strong>
                            </div>

                        </div>

                    </div>


                    {/* =========================
                        USE CASES
                    ========================= */}

                    <div className="keyword-page-two-grid">

                        <section className="keyword-use-panel">

                            <div className="keyword-panel-heading">

                                <small>
                                    BEST USE CASE
                                </small>

                                <h2>
                                    효율적인 분야와 실제 사례
                                </h2>

                            </div>


                            <div className="keyword-use-items">

                                <div>
                                    <span>01</span>

                                    <section>
                                        <strong>
                                            전자상거래
                                        </strong>

                                        <p>
                                            “WH-1000XM5”처럼 정확한
                                            상품 모델명을 검색할 때
                                        </p>
                                    </section>
                                </div>


                                <div>
                                    <span>02</span>

                                    <section>
                                        <strong>
                                            고객센터
                                        </strong>

                                        <p>
                                            세탁기 “E-102” 오류가 적힌
                                            서비스 매뉴얼을 찾을 때
                                        </p>
                                    </section>
                                </div>


                                <div>
                                    <span>03</span>

                                    <section>
                                        <strong>
                                            문서 관리
                                        </strong>

                                        <p>
                                            “SEC-2026-04”처럼 특정
                                            규정·공문 번호를 찾을 때
                                        </p>
                                    </section>
                                </div>


                                <div>
                                    <span>04</span>

                                    <section>
                                        <strong>
                                            개발 로그
                                        </strong>

                                        <p>
                                            “ImportError”처럼 정확한
                                            오류 메시지의 기록을 찾을 때
                                        </p>
                                    </section>
                                </div>

                            </div>

                        </section>


                        {/* =========================
                            STRENGTH / LIMIT
                        ========================= */}

                        <section className="keyword-evaluation">

                            <article className="keyword-evaluation-card strength">

                                <div className="keyword-evaluation-title">

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
                                        정확한 문자열 검색에 강합니다.
                                    </li>

                                    <li>
                                        검색 구조가 단순해 빠르게
                                        결과를 찾을 수 있습니다.
                                    </li>

                                    <li>
                                        어떤 단어 때문에 검색됐는지
                                        결과를 설명하기 쉽습니다.
                                    </li>
                                </ul>

                            </article>


                            <article className="keyword-evaluation-card limitation">

                                <div className="keyword-evaluation-title">

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
                                        같은 의미라도 표현이 다르면
                                        검색에서 놓칠 수 있습니다.
                                    </li>

                                    <li>
                                        사용자가 정확한 검색어를
                                        모르는 상황에는 불리합니다.
                                    </li>

                                    <li>
                                        문장의 의미 자체를 이해해서
                                        찾는 방식은 아닙니다.
                                    </li>
                                </ul>

                            </article>

                        </section>

                    </div>


                    {/* =========================
                        NEXT
                    ========================= */}

                    <div className="keyword-next">

                        <div>

                            <small>
                                NEXT QUESTION
                            </small>

                            <strong>
                                그렇다면 정확한 단어를 모를 때는?
                            </strong>

                        </div>

                        <p>
                            표현은 달라도
                            <b>의미가 비슷한 정보</b>를 찾아야 합니다.
                        </p>

                        <span>
                            VECTOR RAG →
                        </span>

                    </div>

                </section>
            )}

            {pageIndex === 1 && (
                <RagExamplePage type="keyword" number="02" />
            )}

        </div>
    );
}
