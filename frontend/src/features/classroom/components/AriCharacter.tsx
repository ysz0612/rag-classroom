import { useEffect, useMemo, useState } from "react";

type AriCharacterProps = {
    frameDuration?: number;
    className?: string;
    state?: AriVisualState;
};

export type AriVisualState =
    | "idle"
    | "processing"
    | "success"
    | "error";

const IDLE_FRAME_PATHS = [
    "/characters/ari/ari-idle.png",
    "/characters/ari/ari-idle-02.png",
    "/characters/ari/ari-idle-03.png",
];

const THINKING_FRAME_PATHS = [
    "/characters/ari/ari-thinking-01.png",
    "/characters/ari/ari-thinking-02.png",
    "/characters/ari/ari-thinking-03.png",
    "/characters/ari/ari-thinking-04.png",
];

const HAPPY_FRAME_PATHS = [
    "/characters/ari/ari-happy-01.png",
    "/characters/ari/ari-happy-02.png",
];

const ALL_FRAME_PATHS = [
    ...IDLE_FRAME_PATHS,
    ...THINKING_FRAME_PATHS,
    ...HAPPY_FRAME_PATHS,
];

export default function AriCharacter({
                                         frameDuration = 520,
                                         className = "",
                                         state = "idle",
                                     }: AriCharacterProps) {
    const frames = useMemo(() => {
        if (state === "processing") {
            return THINKING_FRAME_PATHS;
        }

        if (state === "success") {
            return HAPPY_FRAME_PATHS;
        }

        return [
            IDLE_FRAME_PATHS[0],
            IDLE_FRAME_PATHS[1],
            IDLE_FRAME_PATHS[0],
            IDLE_FRAME_PATHS[2],
        ];
    }, [state]);

    const [sequenceIndex, setSequenceIndex] = useState(0);

    useEffect(() => {
        ALL_FRAME_PATHS.forEach((src) => {
            const image = new Image();
            image.src = src;
        });
    }, []);

    useEffect(() => {
        setSequenceIndex(0);
    }, [state]);

    useEffect(() => {
        const stateDuration =
            state === "processing"
                ? 300
                : state === "success"
                    ? 260
                    : frameDuration;

        const safeDuration = Math.max(120, stateDuration);
        const timer = window.setInterval(() => {
            setSequenceIndex(
                (current) =>
                    (current + 1) % frames.length,
            );
        }, safeDuration);

        return () => window.clearInterval(timer);
    }, [frameDuration, frames, state]);

    const currentFrame = frames[sequenceIndex] ?? frames[0];

    return (
        <img
            src={currentFrame}
            alt=""
            aria-hidden="true"
            className={`assistant-character ari-character ${className}`.trim()}
            draggable={false}
        />
    );
}
