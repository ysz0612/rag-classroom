import { lessons } from "./data/lessons";
import type {
    ChatMessage,
    LessonKey,
    SavedClassroomState,
} from "./types";

const CLASSROOM_STORAGE_KEY = "rag-classroom-state";
const CLASSROOM_CHAT_STORAGE_KEY = "rag-classroom-chat";

export const defaultClassroomState: SavedClassroomState = {
    screenOn: false,
    activeLesson: "llm",
    pageIndex: 0,
    visited: [],
};

export const defaultChatMessages: ChatMessage[] = [
    {
        id: 1,
        role: "assistant",
        content:
            "강의 내용에 대해 궁금한 점을 물어보세요. LLM, RAG, Keyword RAG, Vector RAG, Graph RAG, PCA를 질문할 수 있습니다.",
    },
];

export function getClassroomStorageKey(userId: number) {
    return `${CLASSROOM_STORAGE_KEY}:${userId}`;
}

export function getClassroomChatStorageKey(userId: number) {
    return `${CLASSROOM_CHAT_STORAGE_KEY}:${userId}`;
}

export function loadClassroomState(
    userId: number,
): SavedClassroomState {
    try {
        const saved = sessionStorage.getItem(
            getClassroomStorageKey(userId),
        );

        if (!saved) {
            return defaultClassroomState;
        }

        const parsed = JSON.parse(saved) as Partial<SavedClassroomState>;

        const lessonExists = lessons.some(
            (lesson) => lesson.key === parsed.activeLesson,
        );

        if (!lessonExists) {
            return defaultClassroomState;
        }

        const activeLesson = parsed.activeLesson as LessonKey;
        const lesson = lessons.find(
            (item) => item.key === activeLesson,
        )!;

        const safePageIndex = Math.min(
            Math.max(parsed.pageIndex ?? 0, 0),
            lesson.pages.length - 1,
        );

        return {
            screenOn: parsed.screenOn ?? false,
            activeLesson,
            pageIndex: safePageIndex,
            visited: Array.isArray(parsed.visited)
                ? parsed.visited
                : [],
        };
    }
    catch {
        return defaultClassroomState;
    }
}
