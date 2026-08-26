import "../../styles/classroom.css";

import SiteHeader from "../../layout/SiteHeader";
import VoiceStatus from "../../features/voice/VoiceStatus";
import ClassroomBackground from "../../features/classroom/components/ClassroomBackground";
import ClassroomChat from "../../features/classroom/components/ClassroomChat";
import ClassroomComputer from "../../features/classroom/components/ClassroomComputer";
import LessonSidebar from "../../features/classroom/components/LessonSidebar";
import ProgressFooter from "../../features/classroom/components/ProgressFooter";
import VoiceHelpModal from "../../features/classroom/components/VoiceHelpModal";
import { useClassroomController } from "../../features/classroom/hooks/useClassroomController";
import {useNavigate} from "react-router-dom";
import LabUnlockModal from "../../features/lab/LabUnlockModal";

export default function ClassroomPage() {
    const controller = useClassroomController();
    const navigate = useNavigate();
    return (
        <div className="classroom-app">
            <SiteHeader
                showLearningRecord
                onLearningRecord={() => {
                    console.log("학습 기록");
                }}
            />

            <main className="classroom-main">
                <ClassroomBackground />
                <LessonSidebar controller={controller} />
                <ClassroomComputer controller={controller} />
                <ClassroomChat controller={controller} />
            </main>

            <ProgressFooter controller={controller} />
            <VoiceHelpModal controller={controller} />
            <VoiceStatus state={controller.voiceState} />

            <button
                type="button"

                disabled={
                    !controller.labUnlocked
                }

                onClick={() => {
                    if (
                        controller.labUnlocked
                    ) {
                        navigate("/lab");
                    }
                }}

                className={
                    controller.labUnlocked
                        ? "lab-entry-button unlocked"
                        : "lab-entry-button locked"
                }
            >
                {controller.labUnlocked
                    ? "AI 실험실 가기"
                    : "🔒 AI 실험실"}
            </button>
            <LabUnlockModal
                open={
                    controller.labJustUnlocked
                }
                onClose={
                    controller.closeLabUnlockNotice
                }
            />
        </div>
    );
}
