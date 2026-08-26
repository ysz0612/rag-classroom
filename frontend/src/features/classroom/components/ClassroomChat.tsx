import { AudioOutlined, MessageOutlined } from "@ant-design/icons";
import type { ClassroomController } from "../hooks/useClassroomController";

export default function ClassroomChat({ controller }: { controller: ClassroomController }) {
    const { chatCollapsed, setChatCollapsed, chatMessages, chatLoading, chatBottomRef, chatInput, setChatInput, askClassroomQuestion, isRecording, toggleRecording } = controller;
    return (
        <aside
            className={
                `ai-sidebar ${
                    chatCollapsed
                        ? "collapsed"
                        : ""
                }`
            }
        >

            {chatCollapsed ? (

                <button
                    className="chat-open-button"
                    onClick={() =>
                        setChatCollapsed(false)
                    }
                >

                    <MessageOutlined />

                </button>

            ) : (

                <>

                    <div className="chat-header">

                        <div className="chat-title">

                            <span className="ai-online-dot" />

                            ARI ASSISTANT

                        </div>

                        <button
                            className="collapse-button"
                            onClick={() =>
                                setChatCollapsed(
                                    true,
                                )
                            }
                        >
                            —
                        </button>

                    </div>


                    <div className="chat-history-title">

                <span>
                  대화 기록
                </span>

                        <button>
                            전체 보기
                        </button>

                    </div>


                    <div className="chat-body">

                        {chatMessages.map(
                            (message) => (

                                <div
                                    key={message.id}
                                    className={
                                        `chat-message ${message.role}`
                                    }
                                >
                                    {message.role ===
                                        "assistant" && (
                                            <div className="message-label">
                                                아리
                                            </div>
                                        )}

                                    {message.content}
                                </div>

                            ),
                        )}

                        {chatLoading && (
                            <div className="chat-message assistant">
                                <div className="message-label">
                                    아리
                                </div>
                                학습 자료를 검색하고 있습니다...
                            </div>
                        )}


                        <div
                            ref={chatBottomRef}
                            aria-hidden="true"
                            style={{
                                width: "100%",
                                height: 1,
                                flexShrink: 0,
                            }}
                        />

                    </div>


                    <div className="chat-input-area">

                        <input
                            value={chatInput}
                            onChange={(event) =>
                                setChatInput(
                                    event.target.value,
                                )
                            }
                            onKeyDown={(event) => {
                                if (
                                    event.key === "Enter"
                                ) {
                                    event.preventDefault();
                                    void askClassroomQuestion();
                                }
                            }}
                            placeholder="아리에게 강의 내용을 질문하세요..."
                            disabled={chatLoading}
                        />

                        <button
                            type="button"
                            onClick={() =>
                                void askClassroomQuestion()
                            }
                            disabled={
                                chatLoading ||
                                !chatInput.trim()
                            }
                            title="질문 보내기"
                            style={{
                                minWidth: 42,
                                height: 38,
                                border:
                                    "1px solid #7f96a3",
                                background:
                                    "#eef3f5",
                                color:
                                    "#2e4b5d",
                                fontWeight: 900,
                                cursor: "pointer",
                            }}
                        >
                            ↑
                        </button>

                        <button
                            type="button"
                            className={
                                `voice-button ${
                                    isRecording
                                        ? "recording"
                                        : ""
                                }`
                            }
                            onClick={toggleRecording}
                            title={
                                isRecording
                                    ? "음성 인식 종료"
                                    : "음성 인식 시작"
                            }
                        >
                            {isRecording ? (
                                <span>■</span>
                            ) : (
                                <AudioOutlined />
                            )}
                        </button>

                    </div>


                </>

            )}

        </aside>

    );
}