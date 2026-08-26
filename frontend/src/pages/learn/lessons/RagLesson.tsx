import {
    DatabaseOutlined,
    MessageOutlined,
    RobotOutlined,
    SearchOutlined,
} from "@ant-design/icons";

import "./rag-lesson.css";


interface RagLessonProps {
    pageIndex: number;
    totalPages: number;
}


export default function RagLesson({
                                      pageIndex,
                                      totalPages,
                                  }: RagLessonProps) {

    return (
        <div className="lesson-screen rag-screen">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="lesson-screen-header">

                <span>
                    02. RAG
                </span>

                <span>
                    {pageIndex + 1}
                    {" / "}
                    {totalPages}
                </span>

            </div>


            {/* =====================================================
                PAGE 01
                RAG란?
            ===================================================== */}

            {pageIndex === 0 && (
                <section className="rag-slide rag-intro-slide">

                    {/* =========================
                        TITLE
                    ========================= */}

                    <div className="rag-slide-title-row">

                        <div className="rag-section-number">
                            01.
                        </div>

                        <div>

                            <div className="rag-small-title">
                                RETRIEVAL AUGMENTED GENERATION
                            </div>

                            <h1>
                                RAG
                                <span>
                                    (검색 증강 생성)
                                </span>
                                이란?
                            </h1>

                        </div>

                    </div>


                    {/* =========================
                        DEFINITION
                    ========================= */}

                    <div className="rag-definition">

                        <strong>
                            필요한 정보를 먼저 찾고,
                            그 정보를 바탕으로 답변을 생성하는 방식
                        </strong>

                        <p>
                            LLM이 자신의 학습 지식만 사용하는 것이 아니라,
                            질문과 관련된 외부 정보를 검색한 뒤
                            그 내용을 참고해 답변합니다.
                        </p>

                    </div>


                    {/* =========================
                        MAIN FLOW
                    ========================= */}

                    <div className="rag-main-flow">

                        {/* QUESTION */}

                        <div className="rag-flow-card question">

                            <div className="rag-flow-icon">
                                <MessageOutlined />
                            </div>

                            <small>
                                QUESTION
                            </small>

                            <strong>
                                사용자 질문
                            </strong>

                            <span>
                                "내 질문과 관련된
                                정보를 찾아줘"
                            </span>

                        </div>


                        <div className="rag-flow-arrow">
                            →
                        </div>


                        {/* SEARCH */}

                        <div className="rag-flow-card search">

                            <div className="rag-flow-icon">
                                <SearchOutlined />
                            </div>

                            <small>
                                RETRIEVAL
                            </small>

                            <strong>
                                관련 정보 검색
                            </strong>

                            <span>
                                질문에 필요한
                                정보를 먼저 찾음
                            </span>

                        </div>


                        <div className="rag-flow-arrow">
                            →
                        </div>


                        {/* CONTEXT */}

                        <div className="rag-flow-card context">

                            <div className="rag-flow-icon">
                                <DatabaseOutlined />
                            </div>

                            <small>
                                CONTEXT
                            </small>

                            <strong>
                                검색 결과 전달
                            </strong>

                            <span>
                                찾은 정보를
                                LLM에게 제공
                            </span>

                        </div>


                        <div className="rag-flow-arrow">
                            →
                        </div>


                        {/* LLM */}

                        <div className="rag-flow-card llm">

                            <div className="rag-flow-icon">
                                <RobotOutlined />
                            </div>

                            <small>
                                GENERATION
                            </small>

                            <strong>
                                LLM
                            </strong>

                            <span>
                                검색된 정보를
                                참고해 답변 생성
                            </span>

                        </div>

                    </div>


                    {/* =========================
                        3 STEPS
                    ========================= */}

                    <div className="rag-three-points">

                        <div className="rag-point">

                            <span className="rag-point-number">
                                01
                            </span>

                            <div>

                                <strong>
                                    검색
                                </strong>

                                <p>
                                    필요한 정보를
                                    먼저 찾습니다.
                                </p>

                            </div>

                        </div>


                        <div className="rag-point">

                            <span className="rag-point-number">
                                02
                            </span>

                            <div>

                                <strong>
                                    보강
                                </strong>

                                <p>
                                    검색 결과를
                                    LLM의 정보로 전달합니다.
                                </p>

                            </div>

                        </div>


                        <div className="rag-point">

                            <span className="rag-point-number">
                                03
                            </span>

                            <div>

                                <strong>
                                    생성
                                </strong>

                                <p>
                                    LLM이 검색 정보를 참고해
                                    답변을 만듭니다.
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* =========================
                        KEY MESSAGE
                    ========================= */}

                    <div className="rag-key-message">

                        <span>
                            ✦
                        </span>

                        <div>

                            <small>
                                핵심
                            </small>

                            <strong>
                                RAG의 중요한 차이는
                                결국 "어떤 정보를 어떻게 찾아오느냐"에서 시작됩니다.
                            </strong>

                        </div>

                    </div>

                </section>
            )}


            {/* =====================================================
                PAGE 02
                3가지 RAG 비교로 연결
            ===================================================== */}

            {pageIndex === 1 && (
                <section className="rag-slide rag-compare-slide">

                    {/* =========================
                        TITLE
                    ========================= */}

                    <div className="rag-slide-title-row">

                        <div className="rag-section-number">
                            02.
                        </div>

                        <div>

                            <div className="rag-small-title">
                                SAME RAG · DIFFERENT RETRIEVAL
                            </div>

                            <h1>
                                같은 RAG,
                                <span>
                                    다른 검색 기준
                                </span>
                            </h1>

                        </div>

                    </div>


                    {/* =========================
                        QUESTION
                    ========================= */}

                    <div className="rag-compare-question">

                        <MessageOutlined />

                        <div>

                            <small>
                                SAME QUESTION
                            </small>

                            <strong>
                                "이 질문과 관련된 정보를 찾아줘"
                            </strong>

                        </div>

                    </div>


                    {/* =========================
                        BRANCH
                    ========================= */}

                    <div className="rag-branch-line">

                        <div className="rag-branch-main" />

                        <div className="rag-branch-horizontal" />

                        <div className="rag-branch-down left" />
                        <div className="rag-branch-down center" />
                        <div className="rag-branch-down right" />

                    </div>


                    {/* =========================
                        THREE TYPES
                    ========================= */}

                    <div className="rag-type-grid">

                        {/* KEYWORD */}

                        <article className="rag-type-card keyword">

                            <div className="rag-type-number">
                                01
                            </div>

                            <div className="rag-type-icon">
                                Aa
                            </div>

                            <small>
                                KEYWORD RAG
                            </small>

                            <h2>
                                단어
                            </h2>

                            <div className="rag-type-line" />

                            <strong>
                                문자열 일치
                            </strong>

                            <p>
                                정확한 단어, 제품명,
                                코드처럼 일치 여부가
                                중요한 검색에 유리
                            </p>

                            <div className="rag-best-for">
                                정확성 중심
                            </div>

                        </article>


                        {/* VECTOR */}

                        <article className="rag-type-card vector">

                            <div className="rag-type-number">
                                02
                            </div>

                            <div className="rag-type-icon">
                                [ ]
                            </div>

                            <small>
                                VECTOR RAG
                            </small>

                            <h2>
                                의미
                            </h2>

                            <div className="rag-type-line" />

                            <strong>
                                벡터 유사도
                            </strong>

                            <p>
                                표현이 서로 달라도
                                의미가 비슷한 정보를
                                찾는 검색에 유리
                            </p>

                            <div className="rag-best-for">
                                의미 중심
                            </div>

                        </article>


                        {/* GRAPH */}

                        <article className="rag-type-card graph">

                            <div className="rag-type-number">
                                03
                            </div>

                            <div className="rag-type-icon graph-icon">

                                <i />
                                <i />
                                <i />

                            </div>

                            <small>
                                GRAPH RAG
                            </small>

                            <h2>
                                관계
                            </h2>

                            <div className="rag-type-line" />

                            <strong>
                                연결 구조 탐색
                            </strong>

                            <p>
                                데이터 사이의 관계나
                                여러 단계의 연결 경로를
                                찾는 검색에 유리
                            </p>

                            <div className="rag-best-for">
                                관계 중심
                            </div>

                        </article>

                    </div>


                    {/* =========================
                        CONCLUSION
                    ========================= */}

                    <div className="rag-compare-conclusion">

                        <span>
                            WHY THREE?
                        </span>

                        <strong>
                            검색 기준이 다르면,
                            가장 효율적으로 사용할 수 있는 상황도 달라집니다.
                        </strong>

                    </div>

                </section>
            )}

        </div>
    );
}