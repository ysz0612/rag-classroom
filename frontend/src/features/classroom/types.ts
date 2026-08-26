import type React from "react";

export type LessonKey =
    | "llm"
    | "rag"
    | "keyword"
    | "vector"
    | "graph"
    | "summary";

export interface Lesson {
    key: LessonKey;
    title: string;
    icon: React.ReactNode;
    pages: string[];
}

export interface ChatMessage {
    id: number;
    role: "user" | "assistant";
    content: string;
}

export interface SavedClassroomState {
    screenOn: boolean;
    activeLesson: LessonKey;
    pageIndex: number;
    visited: string[];
}