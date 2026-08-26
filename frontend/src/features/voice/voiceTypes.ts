/* =========================================================
   VOICE COMMAND TYPE
========================================================= */

export type VoiceCommandType =

// 페이지 이동
    | "NEXT"
    | "PREV"

    // 강의 이동
    | "SHOW_LLM"
    | "SHOW_RAG"
    | "SHOW_KEYWORD"
    | "SHOW_VECTOR"
    | "SHOW_GRAPH"

    // 시각화
    | "SHOW_PCA"
    | "SHOW_RELATIONSHIP"
    | "SHOW_PROCESS"
    | "SHOW_LAST_PROCESS"

    // 사이트 이동
    | "GO_HOME"
    | "GO_LAB"

    // 알 수 없음
    | "UNKNOWN";


/* =========================================================
   VOICE COMMAND
========================================================= */

export interface VoiceCommand {

    type:
        VoiceCommandType;

    rawText:
        string;

    normalizedText:
        string;

}


/* =========================================================
   VOICE STATUS
========================================================= */

export type VoiceStatusType =

    | "idle"
    | "listening"
    | "processing"
    | "success"
    | "error";


/* =========================================================
   VOICE STATUS STATE
========================================================= */

export interface VoiceStatusState {

    status:
        VoiceStatusType;

    message:
        string;

    transcript?:
        string;

}