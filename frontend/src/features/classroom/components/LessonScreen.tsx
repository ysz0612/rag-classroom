import type { Lesson } from "../types";
import LlmLesson from "../../../pages/learn/lessons/LlmLesson";
import RagLesson from "../../../pages/learn/lessons/RagLesson";
import KeywordLesson from "../../../pages/learn/lessons/KeywordLesson";
import VectorLesson from "../../../pages/learn/lessons/VectorLesson";
import GraphLesson from "../../../pages/learn/lessons/GraphLesson";
import SummaryLesson from "../../../pages/learn/lessons/SummaryLesson";

export default function LessonScreen({
                                         lesson,
                                         pageIndex,
                                     }: {
    lesson: Lesson;
    pageIndex: number;
}) {
    const page = lesson.pages[pageIndex];

    if (lesson.key === "llm") {
        return (
            <LlmLesson
                pageIndex={pageIndex}
                totalPages={lesson.pages.length}
            />
        );
    }

    if (lesson.key === "rag") {
        return (
            <RagLesson
                pageIndex={pageIndex}
                totalPages={lesson.pages.length}
            />
        );
    }

    if (lesson.key === "keyword") {
        return (
            <KeywordLesson
                pageIndex={pageIndex}
                totalPages={lesson.pages.length}
            />
        );
    }

    if (lesson.key === "vector") {
        return (
            <VectorLesson
                pageIndex={pageIndex}
                totalPages={lesson.pages.length}
            />
        );
    }

    if (lesson.key === "graph") {
        return (
            <GraphLesson
                pageIndex={pageIndex}
                totalPages={lesson.pages.length}
            />
        );
    }

    if (lesson.key === "summary") {
        return (
            <SummaryLesson
                pageIndex={pageIndex}
                totalPages={lesson.pages.length}
            />
        );
    }

    return (
        <div className="lesson-screen">
            <div className="lesson-screen-header">
                <span>{lesson.title.toUpperCase()}</span>
                <span>
                    {pageIndex + 1} / {lesson.pages.length}
                </span>
            </div>

            <div className="generic-lesson">
                <div className="generic-badge">COMING NEXT</div>
                <h1>{page}</h1>
                <p>이 강의 화면은 다음 단계에서 제작합니다.</p>
            </div>
        </div>
    );
}