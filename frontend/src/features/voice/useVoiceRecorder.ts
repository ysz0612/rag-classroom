import {
    useRef,
    useState,
} from "react";

import {
    transcribeVoice,
} from "./voiceApi";


interface UseVoiceRecorderOptions {
    onTranscript: (
        text: string,
    ) => void;

    onListening?: () => void;

    onProcessing?: () => void;

    onError?: (
        message: string,
    ) => void;
}


export default function useVoiceRecorder({
                                             onTranscript,
                                             onListening,
                                             onProcessing,
                                             onError,
                                         }: UseVoiceRecorderOptions) {

    const [
        isRecording,
        setIsRecording,
    ] = useState(false);


    const mediaRecorderRef =
        useRef<MediaRecorder | null>(
            null,
        );


    const streamRef =
        useRef<MediaStream | null>(
            null,
        );


    const chunksRef =
        useRef<Blob[]>([]);


    /* =====================================================
       녹음 시작
    ===================================================== */

    const startRecording =
        async () => {

            try {

                /* =========================================
                   마이크 권한 요청
                ========================================= */

                const stream =
                    await navigator.mediaDevices
                        .getUserMedia({
                            audio: true,
                        });


                streamRef.current =
                    stream;


                /* =========================================
                   지원 가능한 MIME 선택
                ========================================= */

                let mimeType =
                    "audio/webm";


                if (
                    MediaRecorder
                        .isTypeSupported(
                            "audio/webm;codecs=opus",
                        )
                ) {

                    mimeType =
                        "audio/webm;codecs=opus";

                }


                const recorder =
                    new MediaRecorder(
                        stream,
                        {
                            mimeType,
                        },
                    );


                mediaRecorderRef.current =
                    recorder;


                chunksRef.current =
                    [];


                /* =========================================
                   음성 조각 저장
                ========================================= */

                recorder.ondataavailable =
                    (event) => {

                        if (
                            event.data.size >
                            0
                        ) {

                            chunksRef.current.push(
                                event.data,
                            );

                        }

                    };


                /* =========================================
                   녹음 종료 후 Whisper 호출
                ========================================= */

                recorder.onstop =
                    async () => {

                        try {

                            onProcessing?.();


                            const blob =
                                new Blob(
                                    chunksRef.current,
                                    {
                                        type:
                                            recorder.mimeType
                                            || "audio/webm",
                                    },
                                );


                            console.log(
                                "[VOICE BLOB]",
                                {
                                    size:
                                    blob.size,

                                    type:
                                    blob.type,
                                },
                            );


                            if (
                                blob.size ===
                                0
                            ) {

                                throw new Error(
                                    "녹음된 음성이 없습니다.",
                                );

                            }


                            const text =
                                await transcribeVoice(
                                    blob,
                                );


                            console.log(
                                "[VOICE TRANSCRIPT]",
                                text,
                            );


                            if (!text) {

                                throw new Error(
                                    "음성을 인식하지 못했습니다.",
                                );

                            }


                            /*
                             * 여기서 ClassroomPage의
                             * executeVoiceCommand로 연결됩니다.
                             */
                            onTranscript(
                                text,
                            );

                        }
                        catch (error) {

                            console.error(
                                "[VOICE ERROR]",
                                error,
                            );


                            const message =

                                error
                                instanceof Error

                                    ? error.message

                                    : "음성 처리 중 오류가 발생했습니다.";


                            onError?.(
                                message,
                            );

                        }
                        finally {

                            /*
                             * 사용이 끝난 마이크 장치 종료
                             */
                            streamRef.current
                                ?.getTracks()
                                .forEach(
                                    (track) =>
                                        track.stop(),
                                );


                            streamRef.current =
                                null;

                        }

                    };


                recorder.start();


                setIsRecording(
                    true,
                );


                onListening?.();

            }
            catch (error) {

                console.error(
                    "[MIC ERROR]",
                    error,
                );


                setIsRecording(
                    false,
                );


                onError?.(
                    "마이크 권한을 확인해주세요.",
                );

            }

        };


    /* =====================================================
       녹음 종료
    ===================================================== */

    const stopRecording =
        () => {

            const recorder =
                mediaRecorderRef.current;


            if (
                !recorder
                ||
                recorder.state !==
                "recording"
            ) {

                return;

            }


            recorder.stop();


            setIsRecording(
                false,
            );

        };


    /* =====================================================
       녹음 Toggle
    ===================================================== */

    const toggleRecording =
        async () => {

            if (
                isRecording
            ) {

                stopRecording();

                return;
            }


            await startRecording();

        };


    return {

        isRecording,

        startRecording,

        stopRecording,

        toggleRecording,

    };
}