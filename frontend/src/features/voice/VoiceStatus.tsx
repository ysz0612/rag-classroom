import {
    AudioOutlined,
    CheckOutlined,
    LoadingOutlined,
    WarningOutlined,
} from "@ant-design/icons";

import type {
    VoiceStatusState,
} from "./voiceTypes";

import "./voice-status.css";


interface VoiceStatusProps {
    state: VoiceStatusState;
}


export default function VoiceStatus({
                                        state,
                                    }: VoiceStatusProps) {

    const renderIcon = () => {

        switch (state.status) {

            case "listening":
                return <AudioOutlined />;

            case "processing":
                return <LoadingOutlined spin />;

            case "success":
                return <CheckOutlined />;

            case "error":
                return <WarningOutlined />;

            default:
                return <AudioOutlined />;
        }
    };


    return (
        <div
            className={`voice-status voice-${state.status}`}
        >
            <div className="voice-status-icon">
                {renderIcon()}
            </div>

            <div className="voice-status-text">

                <strong>
                    {state.status === "idle" && "VOICE READY"}
                    {state.status === "listening" && "LISTENING"}
                    {state.status === "processing" && "PROCESSING"}
                    {state.status === "success" && "COMMAND"}
                    {state.status === "error" && "ERROR"}
                </strong>

                <span>
                    {state.message}
                </span>

                {state.transcript && (
                    <small>
                        “{state.transcript}”
                    </small>
                )}

            </div>
        </div>
    );
}