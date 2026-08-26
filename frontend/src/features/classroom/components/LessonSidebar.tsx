import { BookOutlined } from "@ant-design/icons";
import { lessons } from "../data/lessons";
import type { ClassroomController } from "../hooks/useClassroomController";

export default function LessonSidebar({ controller }: { controller: ClassroomController }) {
    const { getLessonProgress, screenOn, activeLesson, openLesson } = controller;
    return (
                <aside className="lesson-sidebar">

                    <div className="sidebar-title">

                        <BookOutlined />

                        <span>
              학습 목록
            </span>

                    </div>


                    <div className="lesson-list">

                        {lessons.map(
                            (lesson) => {

                                const progress =
                                    getLessonProgress(
                                        lesson,
                                    );

                                const isActive =
                                    screenOn &&
                                    activeLesson ===
                                    lesson.key;

                                return (
                                    <button
                                        key={lesson.key}
                                        className={
                                            `lesson-item ${
                                                isActive
                                                    ? "active"
                                                    : ""
                                            }`
                                        }
                                        onClick={() =>
                                            openLesson(
                                                lesson.key,
                                            )
                                        }
                                    >

                                        <div className="lesson-icon">
                                            {lesson.icon}
                                        </div>


                                        <div className="lesson-meta">

                                            <div className="lesson-name">
                                                {lesson.title}
                                            </div>

                                            <div className="lesson-count">
                                                {
                                                    progress.count
                                                }
                                                {" / "}
                                                {
                                                    lesson.pages
                                                        .length
                                                }
                                            </div>

                                        </div>


                                        <div
                                            className={
                                                `lesson-status ${
                                                    progress.percent ===
                                                    100
                                                        ? "done"
                                                        : ""
                                                }`
                                            }
                                        >
                                            {progress.percent ===
                                            100
                                                ? "✓"
                                                : ""}
                                        </div>

                                    </button>
                                );
                            },
                        )}

                    </div>


                    <div className="lesson-tip">

                        <div className="tip-label">
                            TIP
                        </div>

                        <p>
                            모든 페이지를 확인하면
                            해당 학습 항목이
                            완료됩니다.
                        </p>

                    </div>

                </aside>

    );
}
