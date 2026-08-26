/* =========================================================
   VOICE COMMAND TYPES
========================================================= */

export type VoiceCommandType =
    | "NEXT"
    | "PREV"

    | "SHOW_LLM"
    | "SHOW_RAG"
    | "SHOW_KEYWORD"
    | "SHOW_VECTOR"
    | "SHOW_GRAPH"

    | "SHOW_PCA"
    | "PCA_ROTATE"
    | "PCA_STOP"
    | "PCA_2D"
    | "PCA_3D"
    | "PCA_PC1"
    | "CLOSE_VISUALIZER"

    // 새로 추가
    | "RUN_VECTOR_DEMO"
    | "PAUSE_VECTOR_DEMO"
    | "RESUME_VECTOR_DEMO"
    | "RESTART_VECTOR_DEMO"

    | "SHOW_RELATIONSHIP"
    | "SHOW_PROCESS"
    | "SHOW_LAST_PROCESS"

    | "GO_HOME"
    | "GO_LAB"

    | "UNKNOWN";

export interface VoiceCommand {
    type: VoiceCommandType;
    originalText: string;
}


/* =========================================================
   NORMALIZE
========================================================= */

function normalize(text: string) {
    return text
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
        .replace(/[?!.,~]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}


/* =========================================================
   HELPER
========================================================= */

function includesAny(
    text: string,
    words: string[],
) {
    return words.some(
        (word) => text.includes(word),
    );
}


/* =========================================================
   PARSER
========================================================= */

export function parseVoiceCommand(
    originalText: string,
): VoiceCommand {

    const text = normalize(originalText);
    /* =========================================================
   VECTOR RAG LIVE DEMO
========================================================= */

    /*
        다시 재생
    */

    if (
        includesAny(text, [
            "벡터 다시 보여줘",
            "벡터 다시 재생",
            "벡터 과정 다시",
            "벡터 처음부터",
            "벡터 다시 시작",
            "vector 다시",
        ])
    ) {
        return {
            type: "RESTART_VECTOR_DEMO",
            originalText,
        };
    }


    /*
        일시정지
    */

    if (
        includesAny(text, [
            "벡터 멈춰",
            "벡터 잠깐 멈춰",
            "벡터 일시정지",
            "벡터 과정 멈춰",
            "시연 멈춰",
            "설명 멈춰",
        ])
    ) {
        return {
            type: "PAUSE_VECTOR_DEMO",
            originalText,
        };
    }


    /*
        Vector RAG 동작 시연

        꼭 정확하게
        "Vector RAG 작동 과정 보여줘"
        라고 말할 필요 없음
    */

    if (
        (
            includesAny(text, [
                "벡터",
                "vector",
                "벡터 rag",
                "벡터 레그",
            ])
            &&
            includesAny(text, [
                "작동",
                "동작",
                "과정",
                "원리",
                "어떻게",
                "검색",
                "시연",
                "예시",
                "보여줘",
                "설명해줘",
            ])
        )
        ||
        includesAny(text, [
            "벡터 검색 과정",
            "벡터 검색 원리",
            "벡터 래그 예시",
            "벡터 레그 예시",
            "벡터 rag 예시",
            "vector rag 예시",
            "벡터가 어떻게 검색",
            "벡터가 어떻게 작동",
            "벡터 레그가 어떻게",
            "vector rag가 어떻게",
        ])
    ) {
        return {
            type: "RUN_VECTOR_DEMO",
            originalText,
        };
    }

    /* =====================================================
       PCA CONTROL
       구체적인 명령을 SHOW_PCA보다 먼저 검사해야 함
    ===================================================== */

    if (
        includesAny(text, [
            "2차원",
            "이차원",
            "2d",
        ])
    ) {
        return {
            type: "PCA_2D",
            originalText,
        };
    }


    if (
        includesAny(text, [
            "3차원",
            "삼차원",
            "3d",
        ])
    ) {
        return {
            type: "PCA_3D",
            originalText,
        };
    }


    if (
        includesAny(text, [
            "pc1",
            "피씨원",
            "피시원",
            "첫 번째 주성분",
            "첫번째 주성분",
            "첫 번째 축",
            "첫번째 축",
            "1주성분",
        ])
    ) {
        return {
            type: "PCA_PC1",
            originalText,
        };
    }


    if (
        includesAny(text, [
            "회전 멈춰",
            "회전 멈춰줘",
            "돌리지 마",
            "돌리지마",
            "회전 정지",
            "회전 중지",
        ])
        ||
        (
            includesAny(text, [
                "멈춰",
                "정지",
            ])
            &&
            includesAny(text, [
                "pca",
                "피씨에이",
                "그래프",
                "시각화",
                "회전",
            ])
        )
    ) {
        return {
            type: "PCA_STOP",
            originalText,
        };
    }


    if (
        includesAny(text, [
            "돌려줘",
            "회전해줘",
            "회전시켜줘",
            "돌아가게 해줘",
            "빙글빙글",
        ])
    ) {
        return {
            type: "PCA_ROTATE",
            originalText,
        };
    }


    if (
        includesAny(text, [
            "pca 닫아",
            "pca 꺼",
            "피씨에이 닫아",
            "피씨에이 꺼",
            "시각화 닫아",
            "시각화 꺼",
            "그래프 닫아",
            "그래프 꺼",
            "원래 화면",
            "강의 화면으로",
        ])
    ) {
        return {
            type: "CLOSE_VISUALIZER",
            originalText,
        };
    }


    /* =====================================================
       SHOW PCA

       정확히 "PCA 보여줘"가 아니어도
       PCA / 차원축소 / 주성분 등의 의미가 들어오면 호출
    ===================================================== */

    if (
        includesAny(text, [
            "pca",
            "피씨에이",
            "주성분 분석",
            "주성분분석",
            "차원 축소",
            "차원축소",
        ])
    ) {
        return {
            type: "SHOW_PCA",
            originalText,
        };
    }


    /* =====================================================
       PAGE MOVEMENT
    ===================================================== */

    if (
        includesAny(text, [
            "다음",
            "다음 페이지",
            "다음으로",
            "넘어가",
            "넘겨줘",
            "다음 보여줘",
            "계속해",
        ])
    ) {
        return {
            type: "NEXT",
            originalText,
        };
    }


    if (
        includesAny(text, [
            "이전",
            "이전 페이지",
            "뒤로",
            "전으로",
            "전 페이지",
            "돌아가",
        ])
    ) {
        return {
            type: "PREV",
            originalText,
        };
    }


    /* =====================================================
       LESSON
    ===================================================== */

    if (
        includesAny(text, [
            "키워드",
            "keyword",
            "단어 검색",
            "정확한 단어",
        ])
    ) {
        return {
            type: "SHOW_KEYWORD",
            originalText,
        };
    }


    if (
        includesAny(text, [
            "벡터",
            "vector",
            "임베딩",
            "embedding",
            "의미 검색",
            "유사도 검색",
        ])
    ) {
        return {
            type: "SHOW_VECTOR",
            originalText,
        };
    }


    if (
        includesAny(text, [
            "그래프 rag",
            "그래프 레그",
            "graph rag",
            "graphrag",
        ])
    ) {
        return {
            type: "SHOW_GRAPH",
            originalText,
        };
    }


    if (
        includesAny(text, [
            "llm",
            "엘엘엠",
            "대규모 언어 모델",
            "언어 모델",
        ])
    ) {
        return {
            type: "SHOW_LLM",
            originalText,
        };
    }


    if (
        includesAny(text, [
            "rag",
            "레그",
            "검색 증강 생성",
        ])
    ) {
        return {
            type: "SHOW_RAG",
            originalText,
        };
    }


    /* =====================================================
       GRAPH VISUALIZATION
    ===================================================== */

    if (
        includesAny(text, [
            "관계 보여줘",
            "관계망 보여줘",
            "연결 관계",
            "노드 관계",
            "그래프 관계",
        ])
    ) {
        return {
            type: "SHOW_RELATIONSHIP",
            originalText,
        };
    }


    /* =====================================================
       PROCESS
    ===================================================== */

    if (
        includesAny(text, [
            "과정 보여줘",
            "검색 과정",
            "rag 과정",
            "레그 과정",
        ])
    ) {
        return {
            type: "SHOW_PROCESS",
            originalText,
        };
    }


    if (
        includesAny(text, [
            "방금 과정",
            "아까 과정",
            "직전 과정",
            "방금 답변 과정",
        ])
    ) {
        return {
            type: "SHOW_LAST_PROCESS",
            originalText,
        };
    }


    /* =====================================================
       ROUTE
    ===================================================== */

    if (
        includesAny(text, [
            "홈으로",
            "메인으로",
            "처음 화면",
        ])
    ) {
        return {
            type: "GO_HOME",
            originalText,
        };
    }


    if (
        includesAny(text, [
            "실습실",
            "실습 화면",
            "랩으로",
        ])
    ) {
        return {
            type: "GO_LAB",
            originalText,
        };
    }


    return {
        type: "UNKNOWN",
        originalText,
    };
}