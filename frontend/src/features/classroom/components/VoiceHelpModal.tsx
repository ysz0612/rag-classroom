import type { ClassroomController } from "../hooks/useClassroomController";
import "./VoiceHelpModal.css";

interface VoiceHelpModalProps {
    controller: ClassroomController;
}

const HELP_SECTIONS = [
    {
        number: "01",
        title: "페이지 조작",
        badge: "아리 호출 없이",
        commands: [
            ["다음 페이지", "현재 강의의 다음 장으로 이동"],
            ["이전 페이지", "현재 강의의 이전 장으로 이동"],
            ["키워드 예시 보여줘", "현재 RAG의 상품 선택 예시 열기"],
            ["벡터 예시 보여줘", "Vector RAG 상품 선택 예시 열기"],
            ["그래프 예시 보여줘", "Graph RAG 상품 선택 예시 열기"],
        ],
    },
    {
        number: "02",
        title: "강의·화면 이동",
        badge: "아리 호출 없이",
        commands: [
            ["LLM 보여줘", "LLM 강의로 이동"],
            ["RAG 보여줘", "RAG 기본 강의로 이동"],
            ["키워드 / 벡터 / 그래프 보여줘", "해당 RAG 강의로 이동"],
            ["수업 요약 보여줘", "마지막 요약 페이지로 이동"],
            ["실험실로 이동해줘", "AI 실험실로 이동"],
        ],
    },
    {
        number: "03",
        title: "아리에게 질문",
        badge: "먼저 ‘아리야’",
        commands: [
            ["아리야, 임베딩이 뭐야?", "강의 내용에 관한 질문"],
            ["아리야, Keyword RAG 설명해줘", "개념 설명 요청"],
            ["아리야, 지금 어디야?", "현재 화면·강의 확인"],
        ],
    },
];

export default function VoiceHelpModal({
    controller,
}: VoiceHelpModalProps) {
    const {
        voiceHelpOpen,
        setVoiceHelpOpen,
    } = controller;

    if (!voiceHelpOpen) {
        return null;
    }

    return (
        <div
            className="voice-help-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="voice-help-title"
        >
            <button
                type="button"
                className="voice-help-backdrop"
                onClick={() => setVoiceHelpOpen(false)}
                aria-label="음성 도움말 닫기"
            />

            <section className="voice-help-modal">
                <header className="voice-help-header">
                    <div>
                        <small>VOICE COMMAND GUIDE</small>
                        <h2 id="voice-help-title">아리 음성 명령 도움말</h2>
                        <p>화면 조작은 바로 말하고, 질문할 때만 먼저 “아리야”라고 불러주세요.</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setVoiceHelpOpen(false)}
                    >
                        × 닫기
                    </button>
                </header>

                <div className="voice-help-sections">
                    {HELP_SECTIONS.map((section) => (
                        <article key={section.number}>
                            <div className="voice-help-section-title">
                                <span>{section.number}</span>
                                <div>
                                    <h3>{section.title}</h3>
                                    <small>{section.badge}</small>
                                </div>
                            </div>

                            <ul>
                                {section.commands.map(([command, description]) => (
                                    <li key={command}>
                                        <strong>“{command}”</strong>
                                        <span>{description}</span>
                                    </li>
                                ))}
                            </ul>
                        </article>
                    ))}
                </div>

                <div className="voice-help-lab">
                    <div>
                        <small>AI EXPERIMENT LAB</small>
                        <strong>실험실 상세 검색 과정</strong>
                    </div>
                    <p>
                        “상세 과정 보여줘” → “다음 과정 보여줘” → “상세 과정 닫아줘”
                    </p>
                    <p>
                        특정 화면은 “키워드·벡터·그래프 상세 과정 보여줘”라고 말하면 됩니다.
                    </p>
                </div>
            </section>
        </div>
    );
}
