export const FAIRY_NAME =
    "아리";


export type GlobalVoiceCommand =
    | "GO_HOME"
    | "GO_CLASSROOM"
    | "GO_LAB"
    | "UNKNOWN";


/*
 * 아리를 부르지 않고 실행하는 화면 이동 명령입니다.
 * 발표 문장 속 단어에 반응하지 않도록 문장 전체가
 * 등록된 명령과 일치할 때만 이동합니다.
 */
export function parseDirectGlobalVoiceCommand(
    originalText: string,
): GlobalVoiceCommand {
    const text = normalizeVoiceText(originalText);
    const compactText = text.replace(/\s+/g, "");

    const commands: Record<
        Exclude<GlobalVoiceCommand, "UNKNOWN">,
        string[]
    > = {
        GO_HOME: [
            "홈으로",
            "홈 가줘",
            "홈으로 가줘",
            "홈으로 이동해줘",
            "홈으로 이동해 주세요",
            "메인으로",
            "메인으로 가줘",
            "메인 화면",
            "처음으로",
            "처음 화면",
        ],
        GO_CLASSROOM: [
            "학습하기",
            "학습하기로",
            "학습하기로 가줘",
            "학습하기로 이동해줘",
            "학습하기로 이동해 주세요",
            "학습하기로 보내줘",
            "학습실로",
            "학습실 가줘",
            "학습실로 가줘",
            "학습실 이동해줘",
            "학습실로 이동해줘",
            "학습실로 이동해 주세요",
            "학습실로 보내줘",
            "강의실로",
            "강의실 가줘",
            "강의실로 가줘",
            "강의실 이동해줘",
            "강의실로 이동해 주세요",
            "클래스룸으로",
            "클래스룸 가줘",
        ],
        GO_LAB: [
            "실험실로",
            "실험실 가줘",
            "실험실로 가줘",
            "실험실 이동해줘",
            "실험실로 이동해줘",
            "실험실로 이동해 주세요",
            "실험실로 보내줘",
            "실습실로",
            "실습실 가줘",
            "실습실로 가줘",
            "랩으로",
            "랩으로 가줘",
        ],
    };

    for (const [command, phrases] of Object.entries(commands)) {
        const matched = phrases.some(
            (phrase) =>
                normalizeVoiceText(phrase)
                    .replace(/\s+/g, "") === compactText,
        );

        if (matched) {
            return command as GlobalVoiceCommand;
        }
    }

    return "UNKNOWN";
}


export function normalizeVoiceText(
    value: string,
) {
    return value
        .toLowerCase()
        // 한국어 STT에서 자주 달라지는 발음과 띄어쓰기를 통일합니다.
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
        .replace(/검색해\s*주세요/g, "검색해줘")
        .replace(/검색해\s*줘/g, "검색해줘")
        .replace(/찾아\s*주세요/g, "찾아줘")
        .replace(/찾아\s*줘/g, "찾아줘")
        .replace(/추천해\s*주세요/g, "추천해줘")
        .replace(/추천해\s*줘/g, "추천해줘")
        .replace(/실행해\s*주세요/g, "실행해줘")
        .replace(/실행해\s*줘/g, "실행해줘")
        .replace(/이동해\s*주세요/g, "이동해줘")
        .replace(/이동해\s*줘/g, "이동해줘")
        .replace(/[?!.,~]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}


function includesAny(
    text: string,
    words: string[],
) {
    return words.some(
        (word) =>
            text.includes(word),
    );
}


export function parseGlobalVoiceCommand(
    originalText: string,
): GlobalVoiceCommand {

    const text =
        normalizeVoiceText(
            originalText,
        );


    /* =====================================================
       HOME
    ===================================================== */

    if (
        includesAny(
            text,
            [
                "홈으로",
                "홈 가줘",
                "홈으로 가줘",
                "홈으로 이동해줘",

                "메인으로",
                "메인으로 가줘",
                "메인 화면",

                "처음으로",
                "처음 화면",
            ],
        )
    ) {
        return "GO_HOME";
    }


    /* =====================================================
       CLASSROOM
    ===================================================== */

    if (
        includesAny(
            text,
            [
                "학습하기로",
                "학습하기로 가줘",
                "학습하기로 이동해줘",
                "학습하기로 보내줘",

                "학습실로",
                "학습실 가줘",
                "학습실로 가줘",
                "학습실 이동해줘",
                "학습실로 이동해줘",

                "강의실로",
                "강의실 가줘",
                "강의실로 가줘",
                "강의실 이동해줘",

                "클래스룸으로",
                "클래스룸 가줘",
                "classroom으로",
            ],
        )
    ) {
        return "GO_CLASSROOM";
    }


    /* =====================================================
       LAB
    ===================================================== */

    if (
        includesAny(
            text,
            [
                "실험실로",
                "실험실 가줘",
                "실험실로 가줘",
                "실험실 이동해줘",
                "실험실로 이동해줘",

                "실습실로",
                "실습실 가줘",
                "실습실로 가줘",

                "랩으로",
                "랩으로 가줘",
                "lab으로",
            ],
        )
    ) {
        return "GO_LAB";
    }


    return "UNKNOWN";
}


/* =========================================================
   WAKE WORD
========================================================= */

export function extractFairyCommand(
    originalText: string,
) {

    const text =
        normalizeVoiceText(
            originalText,
        );


    /*
     * Whisper / STT가
     * "아리야"를 띄어쓰기해서
     * "아리 야"라고 잡는 경우도 허용
     */
    const wakeWords = [
        `${FAIRY_NAME}야`,
        `${FAIRY_NAME} 야`,
    ];


    for (
        const wakeWord
        of wakeWords
        ) {

        const index =
            text.indexOf(
                wakeWord,
            );


        if (index === -1) {
            continue;
        }


        const command =
            text
                .slice(
                    index +
                    wakeWord.length,
                )
                .trim();


        return {
            called: true,
            command,
        };
    }


    return {
        called: false,
        command: "",
    };
}