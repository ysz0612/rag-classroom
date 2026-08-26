import { LeftOutlined, QuestionCircleOutlined, RightOutlined } from "@ant-design/icons";
import PCAVisualizer from "../../visualizer/PCAVisualizer";
import VectorRAGVisualizer from "../../visualizer/VectorRAGVisualizer";
import KeywordRAGVisualizer from "../../visualizer/KeywordRAGVisualizer";
import GraphRAGVisualizer from "../../visualizer/GraphRAGVisualizer";
import type { ClassroomController } from "../hooks/useClassroomController";
import LessonScreen from "./LessonScreen";

export default function ClassroomComputer({ controller }: { controller: ClassroomController }) {
    const {
        screenOn, currentLesson, pageIndex,
        pcaOpen, vectorDemoOpen, keywordDemoOpen, graphDemoOpen,
        pcaDimension, pcaAutoRotate, pcaHighlightPC1,
        setPcaOpen, setPcaAutoRotate, setPcaHighlightPC1,
        keywordDemoPaused, keywordDemoRestartKey, setKeywordDemoOpen, setKeywordDemoPaused,
        graphDemoPaused, graphDemoRestartKey, setGraphDemoOpen, setGraphDemoPaused,
        vectorDemoPaused, vectorDemoRestartKey, setVectorDemoOpen, setVectorDemoPaused,
        visualizerExpanded, setVisualizerExpanded, setVoiceHelpOpen,
        goPrev, goNext, isFirstPage, isLastPage,
    } = controller;

    return (
                <section className="computer-zone">

                    <div className="computer-shell">

                        <div className="computer-top">

              <span>
                RAG CLASSROOM
                COMPUTER
              </span>

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                }}
                            >
                                <div className="computer-status">

                                    <span
                                        className={
                                            screenOn
                                                ? "status-dot on"
                                                : "status-dot"
                                        }
                                    />

                                    {screenOn
                                        ? "ONLINE"
                                        : "STANDBY"}

                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setVoiceHelpOpen(true)
                                    }
                                    title="음성 명령 도움말"
                                    style={{
                                        width: 28,
                                        height: 28,
                                        border:
                                            "1px solid rgba(255,255,255,0.35)",
                                        background:
                                            "rgba(255,255,255,0.12)",
                                        color: "inherit",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        borderRadius: 4,
                                    }}
                                >
                                    <QuestionCircleOutlined />
                                </button>
                            </div>

                        </div>


                        <div
                            className={
                                `monitor ${
                                    !screenOn
                                        ? "monitor-off"
                                        : ""
                                }`
                            }
                        >

                            {!screenOn ? (

                                <div className="power-off-screen">

                                    <div className="power-icon">
                                        ⏻
                                    </div>

                                    <div className="power-title">
                                        POWER OFF
                                    </div>

                                    <div className="power-divider" />

                                    <p>
                                        아직 강의가
                                        시작되지 않았어요.
                                    </p>

                                    <strong>
                                        “LLM 보여줘”
                                    </strong>

                                    <span>
                    라고 말해보세요.
                  </span>

                                </div>

                            ) : (

                                <LessonScreen
                                    lesson={
                                        currentLesson
                                    }
                                    pageIndex={
                                        pageIndex
                                    }
                                />

                            )}

                            {/* =================================================
                                LIVE PCA
                            ================================================= */}

                            {screenOn && pcaOpen && !vectorDemoOpen && !keywordDemoOpen && !graphDemoOpen && (
                                <div
                                    className="live-visualizer-overlay"
                                    style={
                                        visualizerExpanded
                                            ? {
                                                position: "fixed",
                                                inset: "72px 24px 24px",
                                                zIndex: 4500,
                                                width: "auto",
                                                height: "auto",
                                                maxWidth: "none",
                                                maxHeight: "none",
                                                border:
                                                    "3px solid #425d68",
                                                boxShadow:
                                                    "0 18px 60px rgba(20, 31, 36, 0.35)",
                                                background:
                                                    "#eef2f1",
                                            }
                                            : undefined
                                    }
                                >

                                    <PCAVisualizer
                                        dimension={pcaDimension}
                                        autoRotate={pcaAutoRotate}
                                        highlightPC1={pcaHighlightPC1}

                                        onClose={() => {
                                            setPcaOpen(false);
                                            setPcaAutoRotate(false);
                                            setPcaHighlightPC1(false);
                                            setVisualizerExpanded(false);
                                        }}
                                    />

                                </div>
                            )}


                            {/* =================================================
                                LIVE KEYWORD RAG DEMO
                            ================================================= */}

                            {screenOn && keywordDemoOpen && (
                                <div
                                    className="live-visualizer-overlay"
                                    style={
                                        visualizerExpanded
                                            ? {
                                                position: "fixed",
                                                inset: "72px 24px 24px",
                                                zIndex: 4500,
                                                width: "auto",
                                                height: "auto",
                                                maxWidth: "none",
                                                maxHeight: "none",
                                                border:
                                                    "3px solid #425d68",
                                                boxShadow:
                                                    "0 18px 60px rgba(20, 31, 36, 0.35)",
                                                background:
                                                    "#eef2f1",
                                            }
                                            : undefined
                                    }
                                >

                                    <KeywordRAGVisualizer
                                        autoPlay={true}
                                        paused={keywordDemoPaused}
                                        restartKey={keywordDemoRestartKey}

                                        onClose={() => {
                                            setKeywordDemoOpen(false);
                                            setKeywordDemoPaused(false);
                                            setVisualizerExpanded(false);
                                        }}
                                    />

                                </div>
                            )}


                            {/* =================================================
                                LIVE GRAPH RAG DEMO
                            ================================================= */}

                            {screenOn && graphDemoOpen && (
                                <div
                                    className="live-visualizer-overlay"
                                    style={
                                        visualizerExpanded
                                            ? {
                                                position: "fixed",
                                                inset: "72px 24px 24px",
                                                zIndex: 4500,
                                                width: "auto",
                                                height: "auto",
                                                maxWidth: "none",
                                                maxHeight: "none",
                                                border:
                                                    "3px solid #425d68",
                                                boxShadow:
                                                    "0 18px 60px rgba(20, 31, 36, 0.35)",
                                                background:
                                                    "#eef2f1",
                                            }
                                            : undefined
                                    }
                                >

                                    <GraphRAGVisualizer
                                        autoPlay={true}
                                        paused={graphDemoPaused}
                                        restartKey={graphDemoRestartKey}
                                        onClose={() => {
                                            setGraphDemoOpen(false);
                                            setGraphDemoPaused(false);
                                            setVisualizerExpanded(false);
                                        }}
                                    />

                                </div>
                            )}


                            {/* =================================================
                                LIVE VECTOR RAG DEMO
                            ================================================= */}

                            {screenOn && vectorDemoOpen && (
                                <div
                                    className="live-visualizer-overlay"
                                    style={
                                        visualizerExpanded
                                            ? {
                                                position: "fixed",
                                                inset: "72px 24px 24px",
                                                zIndex: 4500,
                                                width: "auto",
                                                height: "auto",
                                                maxWidth: "none",
                                                maxHeight: "none",
                                                border:
                                                    "3px solid #425d68",
                                                boxShadow:
                                                    "0 18px 60px rgba(20, 31, 36, 0.35)",
                                                background:
                                                    "#eef2f1",
                                            }
                                            : undefined
                                    }
                                >

                                    <VectorRAGVisualizer
                                        autoPlay={true}
                                        paused={vectorDemoPaused}
                                        restartKey={vectorDemoRestartKey}

                                        onClose={() => {
                                            setVectorDemoOpen(false);
                                            setVectorDemoPaused(false);
                                            setVisualizerExpanded(false);
                                        }}
                                    />

                                </div>
                            )}


                        </div>


                        <div className="computer-controls">

                            <button
                                className="pixel-control"
                                onClick={goPrev}
                                disabled={
                                    !screenOn ||
                                    isFirstPage
                                }
                            >

                                <LeftOutlined />
                                이전

                            </button>


                            <div className="page-counter">

                                {screenOn
                                    ? `${
                                        pageIndex + 1
                                    } / ${
                                        currentLesson
                                            .pages.length
                                    } PAGE`
                                    : "0 / 0 PAGE"}

                            </div>


                            <button
                                className="pixel-control"
                                onClick={goNext}
                                disabled={
                                    !screenOn ||
                                    isLastPage
                                }
                            >

                                다음
                                <RightOutlined />

                            </button>

                        </div>

                    </div>

                </section>


    );
}
