import { lessons } from "../data/lessons";
import type { ClassroomController } from "../hooks/useClassroomController";

export default function ProgressFooter({ controller }: { controller: ClassroomController }) {
    const { overallProgress, getLessonProgress } = controller;
    return (
            <footer className="progress-footer">

                <div className="progress-main-row">

          <span className="progress-title">
            전체 학습
          </span>


                    <div className="progress-bar">

                        <div
                            className="progress-fill"
                            style={{
                                width:
                                    `${overallProgress}%`,
                            }}
                        />

                    </div>


                    <strong className="progress-percent">
                        {overallProgress}%
                    </strong>


                    <div className="module-progress">

                        {lessons.map(
                            (lesson) => {

                                const progress =
                                    getLessonProgress(
                                        lesson,
                                    );

                                return (
                                    <div
                                        className="mini-progress"
                                        key={lesson.key}
                                    >

                    <span>
                      {lesson.title}
                    </span>

                                        <div className="mini-bar">

                                            <div
                                                style={{
                                                    width:
                                                        `${
                                                            progress.percent
                                                        }%`,
                                                }}
                                            />

                                        </div>

                                        <small>
                                            {
                                                progress.percent
                                            }
                                            %
                                        </small>

                                    </div>
                                );
                            },
                        )}

                    </div>

                </div>

            </footer>

    );
}
