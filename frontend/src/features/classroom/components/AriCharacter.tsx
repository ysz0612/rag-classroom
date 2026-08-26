import { useEffect, useMemo, useState } from "react";

type AriCharacterProps = {
    frameDuration?: number;
    className?: string;
};

const IDLE_FRAME_PATHS = [
    "/characters/ari/ari-idle.png",
    "/characters/ari/ari-idle-02.png",
    "/characters/ari/ari-idle-03.png",
];

export default function AriCharacter({
                                         frameDuration = 520,
                                         className = "",
                                     }: AriCharacterProps) {
    const frameSequence = useMemo(
        () => [0, 1, 0, 2],
        [],
    );

    const [sequenceIndex, setSequenceIndex] = useState(0);

    useEffect(() => {
        IDLE_FRAME_PATHS.forEach((src) => {
            const image = new Image();
            image.src = src;
        });
    }, []);

    useEffect(() => {
        const safeDuration = Math.max(120, frameDuration);
        const timer = window.setInterval(() => {
            setSequenceIndex(
                (current) =>
                    (current + 1) % frameSequence.length,
            );
        }, safeDuration);

        return () => window.clearInterval(timer);
    }, [frameDuration, frameSequence]);

    const currentFrame =
        IDLE_FRAME_PATHS[frameSequence[sequenceIndex]];

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