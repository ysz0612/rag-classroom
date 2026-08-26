import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiClient } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import type { PCADimension } from "../../visualizer/PCAVisualizer";
import useVoiceRecorder from "../../voice/useVoiceRecorder";
import { parseVoiceCommand } from "../../voice/voiceCommands";
import {
    extractFairyCommand,
    normalizeVoiceText,
} from "../../voiceAssistant/globalVoiceCommands";
import type { VoiceStatusState } from "../../voice/voiceTypes";
import { lessons } from "../data/lessons";
import {
    defaultChatMessages,
    defaultClassroomState,
    getClassroomChatStorageKey,
    getClassroomStorageKey,
    loadClassroomState,
} from "../storage";
import type { ChatMessage, Lesson, LessonKey, SavedClassroomState } from "../types";
import {
    useLabAccess,
} from "../../lab/useLabAccess";

export function useClassroomController() {
    const navigate = useNavigate();

    /*
     * AuthContext가 이미 현재 로그인 사용자를 관리하고 있습니다.
     * 학습 기록은 반드시 user.id를 기준으로 분리합니다.
     */
    const {
        user,
        loading: authLoading,
    } = useAuth();


    /*
     * 로그인 사용자 확인이 끝나고
     * 해당 사용자의 sessionStorage를 읽기 전까지는
     * 저장 effect가 실행되지 않도록 막습니다.
     */
    const [classroomStateReady, setClassroomStateReady] =
        useState(false);


    const [screenOn, setScreenOn] =
        useState(
            defaultClassroomState.screenOn,
        );


    const [activeLesson, setActiveLesson] =
        useState<LessonKey>(
            defaultClassroomState.activeLesson,
        );


    const [pageIndex, setPageIndex] =
        useState(
            defaultClassroomState.pageIndex,
        );


    const [chatCollapsed, setChatCollapsed] =
        useState(false);

    const [voiceHelpOpen, setVoiceHelpOpen] =
        useState(false);

    /*
     * 현재 열려 있는 시각화의 공통 확대 상태
     * PCA / Keyword / Vector / Graph 모두 함께 사용합니다.
     */
    const [visualizerExpanded, setVisualizerExpanded] =
        useState(false);


    /* =====================================================
       LIVE PCA VISUALIZER
    ===================================================== */

    const [pcaOpen, setPcaOpen] =
        useState(false);

    const [pcaDimension, setPcaDimension] =
        useState<PCADimension>("3D");

    const [pcaAutoRotate, setPcaAutoRotate] =
        useState(false);

    const [pcaHighlightPC1, setPcaHighlightPC1] =
        useState(false);


    /* =====================================================
       VECTOR RAG LIVE DEMO
    ===================================================== */

    const [vectorDemoOpen, setVectorDemoOpen] =
        useState(false);

    const [vectorDemoPaused, setVectorDemoPaused] =
        useState(false);

    const [vectorDemoRestartKey, setVectorDemoRestartKey] =
        useState(0);


    /* =====================================================
       KEYWORD RAG LIVE DEMO
    ===================================================== */

    const [keywordDemoOpen, setKeywordDemoOpen] =
        useState(false);

    const [keywordDemoPaused, setKeywordDemoPaused] =
        useState(false);

    const [keywordDemoRestartKey, setKeywordDemoRestartKey] =
        useState(0);


    /* =====================================================
       GRAPH RAG LIVE DEMO
    ===================================================== */

    const [graphDemoOpen, setGraphDemoOpen] =
        useState(false);

    const [graphDemoPaused, setGraphDemoPaused] =
        useState(false);

    const [graphDemoRestartKey, setGraphDemoRestartKey] =
        useState(0);


    const [visited, setVisited] =
        useState<Set<string>>(
            () =>
                new Set(
                    defaultClassroomState.visited,
                ),
        );


    const [voiceState, setVoiceState] =
        useState<VoiceStatusState>({
            status: "idle",
            message: "음성 명령을 기다리고 있습니다.",
        });

    /*
     * 페이지 명령과 챗봇 질문을 분리합니다.
     * false: 짧고 정확한 화면 명령만 처리
     * true : "아리야" 다음에 들어온 음성을 챗봇 질문으로 처리
     */
    const [fairyListening, setFairyListening] =
        useState(false);

    const lastVoiceCommandRef = useRef({
        text: "",
        executedAt: 0,
    });


    const [chatInput, setChatInput] =
        useState("");

    const [chatLoading, setChatLoading] =
        useState(false);

    const [chatMessages, setChatMessages] =
        useState<ChatMessage[]>(
            defaultChatMessages,
        );


    /*
     * 사용자별 저장된 대화를 불러오기 전
     * 빈 기본 대화가 저장소를 덮어쓰지 않도록 막습니다.
     */
    const [chatStateReady, setChatStateReady] =
        useState(false);


    /*
     * 로그인 계정이 바뀌면 해당 사용자의 Classroom 대화를 복원합니다.
     * sessionStorage라서 새로고침에는 유지되지만 브라우저 세션이 끝나면 사라집니다.
     */
    useEffect(
        () => {

            if (authLoading) {
                return;
            }

            if (!user) {
                setChatMessages(
                    defaultChatMessages,
                );
                setChatStateReady(false);
                return;
            }

            try {
                const saved =
                    sessionStorage.getItem(
                        getClassroomChatStorageKey(
                            user.id,
                        ),
                    );

                if (saved) {
                    const parsed =
                        JSON.parse(saved);

                    if (Array.isArray(parsed)) {
                        setChatMessages(
                            parsed.length > 0
                                ? parsed
                                : defaultChatMessages,
                        );
                    }
                    else {
                        setChatMessages(
                            defaultChatMessages,
                        );
                    }
                }
                else {
                    setChatMessages(
                        defaultChatMessages,
                    );
                }
            }
            catch (error) {
                console.warn(
                    "Classroom chat restore failed:",
                    error,
                );

                setChatMessages(
                    defaultChatMessages,
                );
            }

            setChatStateReady(true);

        },
        [
            authLoading,
            user?.id,
        ],
    );


    /*
     * 대화가 추가될 때마다 현재 로그인 사용자의 세션에 저장합니다.
     */
    useEffect(
        () => {

            if (
                !chatStateReady ||
                !user
            ) {
                return;
            }

            try {
                sessionStorage.setItem(
                    getClassroomChatStorageKey(
                        user.id,
                    ),
                    JSON.stringify(
                        chatMessages,
                    ),
                );
            }
            catch (error) {
                console.warn(
                    "Classroom chat save failed:",
                    error,
                );
            }

        },
        [
            chatMessages,
            chatStateReady,
            user?.id,
        ],
    );


    /*
     * 새 메시지나 로딩 메시지가 생길 때
     * 채팅창 맨 아래로 자동 스크롤하기 위한 기준점
     */
    const chatBottomRef =
        useRef<HTMLDivElement | null>(
            null,
        );


    useEffect(
        () => {

            chatBottomRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "end",
            });

        },
        [
            chatMessages,
            chatLoading,
            chatCollapsed,
        ],
    );


    /* =====================================================
       USER-SPECIFIC CLASSROOM LOAD
       계정이 바뀌면 해당 사용자 기록을 다시 로드
    ===================================================== */

    useEffect(
        () => {
            /*
             * AuthProvider가 현재 사용자를 확인 중일 때는
             * guest 기록을 만들거나 덮어쓰지 않습니다.
             */
            if (authLoading) {
                return;
            }


            /*
             * Classroom은 로그인 사용자를 기준으로 기록합니다.
             * 로그아웃 상태라면 저장 준비 상태를 해제합니다.
             */
            if (!user) {
                setClassroomStateReady(false);

                setScreenOn(
                    defaultClassroomState.screenOn,
                );

                setActiveLesson(
                    defaultClassroomState.activeLesson,
                );

                setPageIndex(
                    defaultClassroomState.pageIndex,
                );

                setVisited(
                    new Set(
                        defaultClassroomState.visited,
                    ),
                );

                setPcaOpen(false);
                setVectorDemoOpen(false);
                setKeywordDemoOpen(false);
                setKeywordDemoPaused(false);
                setGraphDemoOpen(false);
                setGraphDemoPaused(false);

                return;
            }


            const state =
                loadClassroomState(
                    user.id,
                );


            /*
             * 새 계정의 상태를 불러오는 동안
             * 이전 계정 상태가 저장되는 것을 방지
             */
            setClassroomStateReady(false);


            setScreenOn(
                state.screenOn,
            );

            setActiveLesson(
                state.activeLesson,
            );

            setPageIndex(
                state.pageIndex,
            );

            setVisited(
                new Set(
                    state.visited,
                ),
            );


            /*
             * 시각화 오버레이는 계정 전환 시 닫습니다.
             */
            setPcaOpen(false);
            setPcaAutoRotate(false);
            setPcaHighlightPC1(false);

            setVectorDemoOpen(false);
            setVectorDemoPaused(false);

            setKeywordDemoOpen(false);
            setKeywordDemoPaused(false);

            setGraphDemoOpen(false);
            setGraphDemoPaused(false);


            /*
             * 위의 상태 세팅이 반영된 다음 render부터
             * 해당 사용자의 기록 저장을 허용합니다.
             */
            window.setTimeout(
                () => {
                    setClassroomStateReady(true);
                },
                0,
            );
        },
        [
            authLoading,
            user?.id,
        ],
    );


    /* =====================================================
       USER-SPECIFIC CLASSROOM SAVE
       user.id별로 별도 저장
    ===================================================== */

    useEffect(
        () => {
            if (
                !classroomStateReady ||
                !user
            ) {
                return;
            }


            const state: SavedClassroomState = {
                screenOn,
                activeLesson,
                pageIndex,
                visited:
                    Array.from(
                        visited,
                    ),
            };


            sessionStorage.setItem(
                getClassroomStorageKey(
                    user.id,
                ),
                JSON.stringify(
                    state,
                ),
            );
        },
        [
            classroomStateReady,
            user?.id,
            screenOn,
            activeLesson,
            pageIndex,
            visited,
        ],
    );


    const currentLesson = useMemo(
        () =>
            lessons.find(
                (lesson) =>
                    lesson.key === activeLesson,
            )!,
        [activeLesson],
    );


    const markVisited = (
        lessonKey: LessonKey,
        index: number,
    ) => {
        setVisited((prev) => {
            const next = new Set(prev);

            next.add(
                `${lessonKey}:${index}`,
            );

            return next;
        });
    };


    const openLesson = (
        lessonKey: LessonKey,
    ) => {
        setScreenOn(true);
        setActiveLesson(lessonKey);
        setPageIndex(0);

        markVisited(
            lessonKey,
            0,
        );
    };


    const activeLessonIndex = useMemo(
        () =>
            lessons.findIndex(
                (lesson) =>
                    lesson.key === activeLesson,
            ),
        [activeLesson],
    );


    const isFirstPage =
        activeLessonIndex === 0 &&
        pageIndex === 0;


    const isLastPage =
        activeLessonIndex === lessons.length - 1 &&
        pageIndex === currentLesson.pages.length - 1;


    const goNext = () => {
        if (!screenOn || isLastPage) {
            return;
        }

        /*
         * 현재 강의 안에 다음 페이지가 있으면
         * 같은 강의의 다음 페이지로 이동
         */
        if (
            pageIndex <
            currentLesson.pages.length - 1
        ) {
            const nextIndex =
                pageIndex + 1;

            setPageIndex(nextIndex);

            markVisited(
                activeLesson,
                nextIndex,
            );

            return;
        }

        /*
         * 현재 강의의 마지막 페이지라면
         * 다음 강의의 첫 페이지로 자동 이동
         */
        const nextLesson =
            lessons[activeLessonIndex + 1];

        if (!nextLesson) {
            return;
        }

        setActiveLesson(nextLesson.key);
        setPageIndex(0);

        markVisited(
            nextLesson.key,
            0,
        );
    };


    const goPrev = () => {
        if (!screenOn || isFirstPage) {
            return;
        }

        /*
         * 현재 강의 안에서 이전 페이지가 있으면
         * 같은 강의의 이전 페이지로 이동
         */
        if (pageIndex > 0) {
            const prevIndex =
                pageIndex - 1;

            setPageIndex(prevIndex);

            markVisited(
                activeLesson,
                prevIndex,
            );

            return;
        }

        /*
         * 현재 강의 첫 페이지라면
         * 이전 강의의 마지막 페이지로 이동
         */
        const prevLesson =
            lessons[activeLessonIndex - 1];

        if (!prevLesson) {
            return;
        }

        const prevIndex =
            prevLesson.pages.length - 1;

        setActiveLesson(prevLesson.key);
        setPageIndex(prevIndex);

        markVisited(
            prevLesson.key,
            prevIndex,
        );
    };


    /* =====================================================
       CLASSROOM CHATBOT
    ===================================================== */

    const getCurrentLearningContext =
        () => {

            const lessonTitle =
                currentLesson?.title ??
                activeLesson;

            const pageTitle =
                currentLesson?.pages?.[
                    pageIndex
                    ] ??
                "";

            let visualizerContext =
                "현재 별도 시각화 없음";

            if (graphDemoOpen) {
                visualizerContext =
                    "Graph RAG 작동 과정 시각화가 열려 있음";
            }
            else if (vectorDemoOpen) {
                visualizerContext =
                    "Vector RAG 작동 과정 시각화가 열려 있음";
            }
            else if (keywordDemoOpen) {
                visualizerContext =
                    "Keyword RAG 작동 과정 시각화가 열려 있음";
            }
            else if (pcaOpen) {
                visualizerContext =
                    `PCA ${pcaDimension} 시각화가 열려 있음`;
            }

            return [
                "[현재 학습 화면]",
                `강의: ${lessonTitle}`,
                `페이지: ${pageTitle}`,
                `시각화: ${visualizerContext}`,
                "",
                "[응답 지침]",
                "사용자가 '이거', '이게', '여기서', '방금', '지금 보는 것'처럼 현재 화면을 가리키면 위 학습 화면을 문맥으로 해석하세요.",
                "현재 화면과 무관한 질문이라면 억지로 연결하지 말고 질문 자체에 답하세요.",
            ].join("\n");
        };


    const askClassroomQuestion =
        async (
            rawQuestion?: string,
        ) => {

            const question =
                (
                    rawQuestion ??
                    chatInput
                ).trim();

            if (
                !question ||
                chatLoading
            ) {
                return;
            }

            setChatMessages(
                (current) => [
                    ...current,
                    {
                        id: Date.now(),
                        role: "user",
                        content: question,
                    },
                ],
            );

            setChatInput("");
            setChatLoading(true);

            try {
                const learningContext =
                    getCurrentLearningContext();

                const contextualQuestion =
                    `${learningContext}

[사용자 질문]
${question}`;


                const response =
                    await apiClient.post(
                        "/api/rag/vector/chat",
                        {
                            question:
                            contextualQuestion,
                        },
                    );

                const answer =
                    response.data?.answer ??
                    "답변을 생성하지 못했습니다.";

                setChatMessages(
                    (current) => [
                        ...current,
                        {
                            id: Date.now() + 1,
                            role: "assistant",
                            content: answer,
                        },
                    ],
                );

                setVoiceState({
                    status: "success",
                    message:
                        "학습 질문에 답변했습니다.",
                    transcript: question,
                });
            }
            catch (error) {
                console.error(
                    "[CLASSROOM CHAT ERROR]",
                    error,
                );

                setChatMessages(
                    (current) => [
                        ...current,
                        {
                            id: Date.now() + 1,
                            role: "assistant",
                            content:
                                "답변을 가져오지 못했습니다. 백엔드 서버와 로그인 상태를 확인해주세요.",
                        },
                    ],
                );

                setVoiceState({
                    status: "error",
                    message:
                        "학습 질문 처리 중 오류가 발생했습니다.",
                    transcript: question,
                });
            }
            finally {
                setChatLoading(false);
            }
        };


    /* =====================================================
       VOICE COMMAND
    ===================================================== */

    const executeVoiceCommand = (text: string) => {

        const keywordCommandText =
            normalizeVoiceText(text);

        if (!keywordCommandText) {
            return;
        }

        /* 같은 Whisper 결과가 연속 전달돼도 한 번만 실행합니다. */
        const now = Date.now();
        if (
            lastVoiceCommandRef.current.text === keywordCommandText &&
            now - lastVoiceCommandRef.current.executedAt < 1500
        ) {
            return;
        }

        lastVoiceCommandRef.current = {
            text: keywordCommandText,
            executedAt: now,
        };

        /* =====================================================
           LEARNING COMPLETE MODAL CLOSE
           "학습 완료!" 팝업이 열려 있으면 시각화보다 먼저 닫습니다.
        ===================================================== */
        const compactCloseCommand =
            keywordCommandText.replace(/\s+/g, "");

        const wantsCloseCompletionModal = [
            "닫아줘",
            "꺼줘",
            "종료해줘",
            "팝업닫아줘",
            "완료창닫아줘",
            "학습완료창닫아줘",
        ].includes(compactCloseCommand);

        if (
            labJustUnlocked &&
            wantsCloseCompletionModal
        ) {
            closeLabUnlockNotice();
            setVoiceState({
                status: "success",
                message: "학습 완료 창을 닫았습니다.",
                transcript: text,
            });
            return;
        }

        /* =====================================================
           FAIRY CHAT MODE
           - "아리야, 질문"은 바로 질문
           - "아리야"만 말하면 다음 음성을 질문으로 처리
           - 호출하지 않은 일반 설명은 챗봇으로 보내지 않음
        ===================================================== */
        const compactDemoCommand =
            keywordCommandText
                .replace(/백터/g, "벡터")
                .replace(/아리야/g, "")
                .replace(/아리\s*야/g, "")
                .replace(/\s+/g, "");

        const hasVisualizerAction =
            ["보여줘", "띄워줘", "열어줘", "실행해줘", "시작해줘"]
                .some((word) => compactDemoCommand.includes(word));

        const hasVisualizerSubject =
            ["예시", "시연", "작동방법", "작동방식", "작동과정", "검색과정", "상세과정"]
                .some((word) => compactDemoCommand.includes(word));

        const isPresentationVisualizerCommand =
            hasVisualizerAction &&
            hasVisualizerSubject &&
            ["키워드", "벡터", "그래프"]
                .some((word) => compactDemoCommand.includes(word));

        const fairyCommand =
            extractFairyCommand(text);

        if (
            fairyCommand.called &&
            !isPresentationVisualizerCommand
        ) {
            setChatCollapsed(false);

            if (fairyCommand.command) {
                setFairyListening(false);
                setVoiceState({
                    status: "processing",
                    message: "아리가 질문을 확인하고 있습니다.",
                    transcript: fairyCommand.command,
                });
                void askClassroomQuestion(
                    fairyCommand.command,
                );
            }
            else {
                setFairyListening(true);
                setVoiceState({
                    status: "listening",
                    message: "아리가 듣고 있어요. 질문해주세요.",
                    transcript: text,
                });
            }

            return;
        }

        /* =====================================================
           PRESENTATION DEMO COMMANDS
           등록된 시연 명령은 아리의 질문 대기 상태보다 먼저 처리합니다.
        ===================================================== */
        const isExactDemoCommand = (
            ragName: "키워드" | "벡터" | "그래프",
        ) => {
            const commands = [
                `${ragName}래그예시`,
                `${ragName}래그예시보여줘`,
                `${ragName}레그예시`,
                `${ragName}레그예시보여줘`,
                `${ragName}rag예시`,
                `${ragName}rag예시보여줘`,
                `${ragName}예시`,
                `${ragName}예시보여줘`,
                `${ragName}시연`,
                `${ragName}시연보여줘`,
                `${ragName}작동방식`,
                `${ragName}작동방식보여줘`,
                `${ragName}작동방법`,
                `${ragName}작동방법보여줘`,
                `${ragName}작동과정`,
                `${ragName}작동과정보여줘`,
                `${ragName}검색과정`,
                `${ragName}검색과정보여줘`,
                `${ragName}상세과정`,
                `${ragName}상세과정보여줘`,
            ];

            const mentionsRag =
                compactDemoCommand.includes(ragName);

            return (
                commands.includes(compactDemoCommand) ||
                (
                    mentionsRag &&
                    hasVisualizerAction &&
                    hasVisualizerSubject
                )
            );
        };

        if (isExactDemoCommand("키워드")) {
            setFairyListening(false);
            setScreenOn(true);
            setVisualizerExpanded(false);
            setPcaOpen(false);
            setVectorDemoOpen(false);
            setVectorDemoPaused(false);
            setGraphDemoOpen(false);
            setGraphDemoPaused(false);
            setKeywordDemoOpen(true);
            setKeywordDemoPaused(false);
            setKeywordDemoRestartKey((prev) => prev + 1);
            setVoiceState({
                status: "success",
                message: "Keyword RAG 검색 과정을 시각화합니다.",
                transcript: text,
            });
            return;
        }

        if (isExactDemoCommand("벡터")) {
            setFairyListening(false);
            setScreenOn(true);
            setVisualizerExpanded(false);
            setPcaOpen(false);
            setKeywordDemoOpen(false);
            setKeywordDemoPaused(false);
            setGraphDemoOpen(false);
            setGraphDemoPaused(false);
            setVectorDemoOpen(true);
            setVectorDemoPaused(false);
            setVectorDemoRestartKey((prev) => prev + 1);
            setVoiceState({
                status: "success",
                message: "Vector RAG 검색 과정을 시각화합니다.",
                transcript: text,
            });
            return;
        }

        if (isExactDemoCommand("그래프")) {
            setFairyListening(false);
            setScreenOn(true);
            setVisualizerExpanded(false);
            setPcaOpen(false);
            setKeywordDemoOpen(false);
            setKeywordDemoPaused(false);
            setVectorDemoOpen(false);
            setVectorDemoPaused(false);
            setGraphDemoOpen(true);
            setGraphDemoPaused(false);
            setGraphDemoRestartKey((prev) => prev + 1);
            setVoiceState({
                status: "success",
                message: "Graph RAG 관계 탐색 과정을 시각화합니다.",
                transcript: text,
            });
            return;
        }

        if (fairyListening) {
            setFairyListening(false);
            setChatCollapsed(false);
            setVoiceState({
                status: "processing",
                message: "아리가 질문을 확인하고 있습니다.",
                transcript: text,
            });
            void askClassroomQuestion(text);
            return;
        }

        /*
         * 발표 문장 중간의 "다음 페이지에서는..."가 실행되지 않도록
         * 페이지 이동은 아래의 독립된 짧은 문장만 허용합니다.
         */
        const exactPageCommand =
            keywordCommandText.replace(/\s+/g, " ");

        // STT가 "언어 모델"을 "언어모델"로 붙이거나
        // "보여 줘"처럼 띄어 써도 같은 명령으로 인식합니다.
        const compactPageCommand =
            exactPageCommand.replace(/\s+/g, "");

        if (
            exactPageCommand === "다음 페이지" ||
            exactPageCommand === "다음페이지"
        ) {
            goNext();
            setVoiceState({
                status: "success",
                message: "다음 페이지로 이동했습니다.",
                transcript: text,
            });
            return;
        }

        if (
            exactPageCommand === "이전 페이지" ||
            exactPageCommand === "이전페이지"
        ) {
            goPrev();
            setVoiceState({
                status: "success",
                message: "이전 페이지로 이동했습니다.",
                transcript: text,
            });
            return;
        }

        const directLessonCommands: Partial<Record<string, LessonKey>> = {
            "llm보여줘": "llm",
            "엘엘엠보여줘": "llm",
            "언어모델보여줘": "llm",
            "언어모델화면보여줘": "llm",
            "대규모언어모델보여줘": "llm",
            "rag보여줘": "rag",
            "래그보여줘": "rag",
            "키워드보여줘": "keyword",
            "키워드rag보여줘": "keyword",
            "벡터보여줘": "vector",
            "벡터rag보여줘": "vector",
            "그래프보여줘": "graph",
            "그래프rag보여줘": "graph",
        };

        const directLesson =
            directLessonCommands[compactPageCommand];

        if (directLesson) {
            openLesson(directLesson);
            setVoiceState({
                status: "success",
                message: `${lessons.find((lesson) => lesson.key === directLesson)?.title ?? directLesson} 강의를 열었습니다.`,
                transcript: text,
            });
            return;
        }


        /* =====================================================
           VOICE HELP
           "도움말 보여줘", "명령어 보여줘" 등
        ===================================================== */

        const wantsVoiceHelp =
            keywordCommandText.includes("도움말") ||
            keywordCommandText.includes("명령어 알려줘") ||
            keywordCommandText.includes("명령어 보여줘") ||
            keywordCommandText.includes("뭐라고 말") ||
            keywordCommandText.includes("어떻게 말");

        if (wantsVoiceHelp) {
            setVoiceHelpOpen(true);

            setVoiceState({
                status: "success",
                message:
                    "사용할 수 있는 음성 명령 예시를 보여드립니다.",
                transcript: text,
            });

            return;
        }


        /* =====================================================
           COMMON VISUALIZER CONTROL
           현재 열려 있는 시각화를 기준으로
           "다시 보여줘 / 멈춰줘 / 계속해 / 꺼줘"를 공통 처리
        ===================================================== */

        const wantsRestart =
            keywordCommandText.includes("다시 보여줘") ||
            keywordCommandText.includes("다시보여줘") ||
            keywordCommandText.includes("다시 시작") ||
            keywordCommandText.includes("다시시작") ||
            keywordCommandText.includes("처음부터");

        const wantsPause =
            keywordCommandText.includes("멈춰") ||
            keywordCommandText.includes("일시정지");

        const wantsResume =
            keywordCommandText.includes("계속") ||
            keywordCommandText.includes("재생");

        const wantsClose =
            keywordCommandText.includes("꺼줘") ||
            keywordCommandText.includes("닫아줘") ||
            keywordCommandText.includes("닫기") ||
            keywordCommandText.includes("종료") ||
            keywordCommandText.includes("그만");

        const wantsExpand =
            keywordCommandText.includes("크게 보여줘") ||
            keywordCommandText.includes("크게보여줘") ||
            keywordCommandText.includes("확대해줘") ||
            keywordCommandText.includes("확대해") ||
            keywordCommandText.includes("크게 해줘") ||
            keywordCommandText.includes("화면 확대") ||
            keywordCommandText.includes("전체 화면");

        const wantsShrink =
            keywordCommandText.includes("원래대로") ||
            keywordCommandText.includes("작게 보여줘") ||
            keywordCommandText.includes("작게보여줘") ||
            keywordCommandText.includes("축소해줘") ||
            keywordCommandText.includes("축소해") ||
            keywordCommandText.includes("원래 크기");


        const anyVisualizerOpen =
            graphDemoOpen ||
            vectorDemoOpen ||
            keywordDemoOpen ||
            pcaOpen;


        if (
            wantsExpand &&
            anyVisualizerOpen
        ) {
            setVisualizerExpanded(true);

            setVoiceState({
                status: "success",
                message:
                    "현재 시각화를 크게 보여드립니다.",
                transcript: text,
            });

            return;
        }


        if (
            wantsShrink &&
            anyVisualizerOpen
        ) {
            setVisualizerExpanded(false);

            setVoiceState({
                status: "success",
                message:
                    "시각화를 원래 크기로 되돌렸습니다.",
                transcript: text,
            });

            return;
        }


        if (wantsRestart) {

            if (graphDemoOpen) {
                setGraphDemoPaused(false);
                setGraphDemoRestartKey(
                    (prev) => prev + 1,
                );

                setVoiceState({
                    status: "success",
                    message:
                        "Graph RAG 탐색 과정을 처음부터 다시 보여드립니다.",
                    transcript: text,
                });

                return;
            }


            if (vectorDemoOpen) {
                setVectorDemoPaused(false);
                setVectorDemoRestartKey(
                    (prev) => prev + 1,
                );

                setVoiceState({
                    status: "success",
                    message:
                        "Vector RAG 검색 과정을 처음부터 다시 보여드립니다.",
                    transcript: text,
                });

                return;
            }


            if (keywordDemoOpen) {
                setKeywordDemoPaused(false);
                setKeywordDemoRestartKey(
                    (prev) => prev + 1,
                );

                setVoiceState({
                    status: "success",
                    message:
                        "Keyword RAG 검색 과정을 처음부터 다시 보여드립니다.",
                    transcript: text,
                });

                return;
            }


            if (pcaOpen) {
                setPcaAutoRotate(false);
                setPcaHighlightPC1(false);
                setPcaDimension("3D");

                setVoiceState({
                    status: "success",
                    message:
                        "PCA 시각화를 기본 3차원 상태로 다시 보여드립니다.",
                    transcript: text,
                });

                return;
            }
        }


        if (wantsPause) {

            if (graphDemoOpen) {
                setGraphDemoPaused(true);

                setVoiceState({
                    status: "success",
                    message:
                        "Graph RAG 시연을 잠시 멈췄습니다.",
                    transcript: text,
                });

                return;
            }


            if (vectorDemoOpen) {
                setVectorDemoPaused(true);

                setVoiceState({
                    status: "success",
                    message:
                        "Vector RAG 시연을 잠시 멈췄습니다.",
                    transcript: text,
                });

                return;
            }


            if (keywordDemoOpen) {
                setKeywordDemoPaused(true);

                setVoiceState({
                    status: "success",
                    message:
                        "Keyword RAG 시연을 잠시 멈췄습니다.",
                    transcript: text,
                });

                return;
            }


            if (pcaOpen) {
                setPcaAutoRotate(false);

                setVoiceState({
                    status: "success",
                    message:
                        "PCA 회전을 멈췄습니다.",
                    transcript: text,
                });

                return;
            }
        }


        if (wantsResume) {

            if (graphDemoOpen) {
                setGraphDemoPaused(false);

                setVoiceState({
                    status: "success",
                    message:
                        "Graph RAG 시연을 계속합니다.",
                    transcript: text,
                });

                return;
            }


            if (vectorDemoOpen) {
                setVectorDemoPaused(false);

                setVoiceState({
                    status: "success",
                    message:
                        "Vector RAG 시연을 계속합니다.",
                    transcript: text,
                });

                return;
            }


            if (keywordDemoOpen) {
                setKeywordDemoPaused(false);

                setVoiceState({
                    status: "success",
                    message:
                        "Keyword RAG 시연을 계속합니다.",
                    transcript: text,
                });

                return;
            }


            if (pcaOpen) {
                setPcaAutoRotate(true);

                setVoiceState({
                    status: "success",
                    message:
                        "PCA 회전을 계속합니다.",
                    transcript: text,
                });

                return;
            }
        }


        if (wantsClose) {

            if (graphDemoOpen) {
                setGraphDemoOpen(false);
                setGraphDemoPaused(false);
                setVisualizerExpanded(false);

                setVoiceState({
                    status: "success",
                    message:
                        "Graph RAG 시각화를 닫았습니다.",
                    transcript: text,
                });

                return;
            }


            if (vectorDemoOpen) {
                setVectorDemoOpen(false);
                setVectorDemoPaused(false);
                setVisualizerExpanded(false);

                setVoiceState({
                    status: "success",
                    message:
                        "Vector RAG 시각화를 닫았습니다.",
                    transcript: text,
                });

                return;
            }


            if (keywordDemoOpen) {
                setKeywordDemoOpen(false);
                setKeywordDemoPaused(false);
                setVisualizerExpanded(false);

                setVoiceState({
                    status: "success",
                    message:
                        "Keyword RAG 시각화를 닫았습니다.",
                    transcript: text,
                });

                return;
            }


            if (pcaOpen) {
                setPcaOpen(false);
                setPcaAutoRotate(false);
                setPcaHighlightPC1(false);
                setVisualizerExpanded(false);

                setVoiceState({
                    status: "success",
                    message:
                        "PCA 시각화를 닫았습니다.",
                    transcript: text,
                });

                return;
            }
        }


        /* =====================================================
           RAG 실생활 예시 페이지
        ===================================================== */

        const asksForExamplePage =
            keywordCommandText.includes("예시 페이지") ||
            keywordCommandText.includes("실생활 예시") ||
            (
                keywordCommandText.includes("예시 보여줘") &&
                !keywordCommandText.includes("작동") &&
                !keywordCommandText.includes("과정") &&
                !keywordCommandText.includes("시연")
            );

        if (asksForExamplePage) {
            let exampleLesson:
                "keyword" | "vector" | "graph" | null =
                null;

            if (
                keywordCommandText.includes("키워드") ||
                keywordCommandText.includes("keyword")
            ) {
                exampleLesson = "keyword";
            }
            else if (
                keywordCommandText.includes("벡터") ||
                keywordCommandText.includes("vector")
            ) {
                exampleLesson = "vector";
            }
            else if (
                keywordCommandText.includes("그래프") ||
                keywordCommandText.includes("graph")
            ) {
                exampleLesson = "graph";
            }
            else if (
                activeLesson === "keyword" ||
                activeLesson === "vector" ||
                activeLesson === "graph"
            ) {
                exampleLesson = activeLesson;
            }

            if (exampleLesson) {
                setScreenOn(true);
                setPcaOpen(false);
                setVectorDemoOpen(false);
                setKeywordDemoOpen(false);
                setGraphDemoOpen(false);
                setVisualizerExpanded(false);

                setActiveLesson(exampleLesson);
                setPageIndex(
                    exampleLesson === "graph"
                        ? 3
                        : 2,
                );

                setVoiceState({
                    status: "success",
                    message:
                        `${exampleLesson.toUpperCase()} RAG 실생활 예시 페이지를 보여드립니다.`,
                    transcript: text,
                });

                return;
            }
        }


        /*
         * Keyword RAG 시각화 닫기
         * "키워드 작동방식 꺼줘"처럼
         * 작동방식이라는 단어가 함께 있어도
         * 열기보다 닫기를 먼저 처리합니다.
         */
        if (
            keywordDemoOpen &&
            (
                keywordCommandText.includes("꺼줘") ||
                keywordCommandText.includes("닫아줘") ||
                keywordCommandText.includes("닫기") ||
                keywordCommandText.includes("종료") ||
                keywordCommandText.includes("그만")
            )
        ) {
            setKeywordDemoOpen(false);
            setKeywordDemoPaused(false);

            setVoiceState({
                status: "success",
                message:
                    "Keyword RAG 시각화를 닫았습니다.",
                transcript: text,
            });

            return;
        }


        /*
         * Keyword RAG 시각화 제어
         * 기존 voiceCommands 파서를 건드리지 않고
         * Classroom에서 먼저 처리합니다.
         */
        if (
            (
                keywordCommandText.includes("키워드") ||
                keywordCommandText.includes("keyword")
            ) &&
            (
                keywordCommandText.includes("작동 과정") ||
                keywordCommandText.includes("작동과정") ||
                keywordCommandText.includes("작동 방식") ||
                keywordCommandText.includes("작동방식") ||
                keywordCommandText.includes("검색 과정") ||
                keywordCommandText.includes("검색과정") ||
                keywordCommandText.includes("과정 보여줘") ||
                keywordCommandText.includes("어떻게 작동") ||
                keywordCommandText.includes("어떻게 동작") ||
                keywordCommandText.includes("시연")
            )
        ) {
            setScreenOn(true);
            setVisualizerExpanded(false);

            setPcaOpen(false);
            setPcaAutoRotate(false);
            setPcaHighlightPC1(false);

            setVectorDemoOpen(false);
            setVectorDemoPaused(false);

            setGraphDemoOpen(false);
            setGraphDemoPaused(false);

            setKeywordDemoOpen(true);
            setKeywordDemoPaused(false);
            setKeywordDemoRestartKey(
                (prev) => prev + 1,
            );

            setVoiceState({
                status: "success",
                message:
                    "Keyword RAG 검색 과정을 시각화합니다.",
                transcript: text,
            });

            return;
        }


        if (
            keywordDemoOpen &&
            (
                keywordCommandText.includes("멈춰") ||
                keywordCommandText.includes("일시정지")
            )
        ) {
            setKeywordDemoPaused(true);

            setVoiceState({
                status: "success",
                message:
                    "Keyword RAG 시연을 잠시 멈췄습니다.",
                transcript: text,
            });

            return;
        }


        if (
            keywordDemoOpen &&
            (
                keywordCommandText.includes("계속") ||
                keywordCommandText.includes("재생")
            )
        ) {
            setKeywordDemoPaused(false);

            setVoiceState({
                status: "success",
                message:
                    "Keyword RAG 시연을 계속합니다.",
                transcript: text,
            });

            return;
        }


        if (
            keywordDemoOpen &&
            (
                keywordCommandText.includes("처음부터") ||
                keywordCommandText.includes("다시 보여줘")
            )
        ) {
            setKeywordDemoPaused(false);
            setKeywordDemoRestartKey(
                (prev) => prev + 1,
            );

            setVoiceState({
                status: "success",
                message:
                    "Keyword RAG 시연을 처음부터 다시 시작합니다.",
                transcript: text,
            });

            return;
        }


        /* =====================================================
           GRAPH RAG 시각화 제어
           자유 질문 판정보다 먼저 처리해야
           "그래프 래그 작동방식 보여줘"가 강의 질문으로 빠지지 않습니다.
        ===================================================== */
        const isGraphCommand =
            keywordCommandText.includes("그래프") ||
            keywordCommandText.includes("graph");

        if (
            graphDemoOpen &&
            isGraphCommand &&
            (
                keywordCommandText.includes("꺼줘") ||
                keywordCommandText.includes("닫아줘") ||
                keywordCommandText.includes("닫기") ||
                keywordCommandText.includes("종료") ||
                keywordCommandText.includes("그만")
            )
        ) {
            setGraphDemoOpen(false);
            setGraphDemoPaused(false);

            setVoiceState({
                status: "success",
                message: "Graph RAG 시각화를 닫았습니다.",
                transcript: text,
            });
            return;
        }

        if (
            isGraphCommand &&
            (
                keywordCommandText.includes("작동 과정") ||
                keywordCommandText.includes("작동과정") ||
                keywordCommandText.includes("작동 방식") ||
                keywordCommandText.includes("작동방식") ||
                keywordCommandText.includes("탐색 과정") ||
                keywordCommandText.includes("탐색과정") ||
                keywordCommandText.includes("과정 보여줘") ||
                keywordCommandText.includes("어떻게 작동") ||
                keywordCommandText.includes("어떻게 동작") ||
                keywordCommandText.includes("시연")
            )
        ) {
            setScreenOn(true);
            setVisualizerExpanded(false);

            setPcaOpen(false);
            setPcaAutoRotate(false);
            setPcaHighlightPC1(false);

            setVectorDemoOpen(false);
            setVectorDemoPaused(false);

            setKeywordDemoOpen(false);
            setKeywordDemoPaused(false);

            setGraphDemoOpen(true);
            setGraphDemoPaused(false);
            setGraphDemoRestartKey((prev) => prev + 1);

            setVoiceState({
                status: "success",
                message: "Graph RAG 탐색 과정을 시각화합니다.",
                transcript: text,
            });
            return;
        }

        if (
            graphDemoOpen &&
            isGraphCommand &&
            (
                keywordCommandText.includes("멈춰") ||
                keywordCommandText.includes("일시정지")
            )
        ) {
            setGraphDemoPaused(true);
            setVoiceState({
                status: "success",
                message: "Graph RAG 시연을 잠시 멈췄습니다.",
                transcript: text,
            });
            return;
        }

        if (
            graphDemoOpen &&
            isGraphCommand &&
            (
                keywordCommandText.includes("계속") ||
                keywordCommandText.includes("재생")
            )
        ) {
            setGraphDemoPaused(false);
            setVoiceState({
                status: "success",
                message: "Graph RAG 시연을 계속합니다.",
                transcript: text,
            });
            return;
        }

        if (
            graphDemoOpen &&
            isGraphCommand &&
            (
                keywordCommandText.includes("처음부터") ||
                keywordCommandText.includes("다시 보여줘") ||
                keywordCommandText.includes("다시 시작")
            )
        ) {
            setGraphDemoPaused(false);
            setGraphDemoRestartKey((prev) => prev + 1);
            setVoiceState({
                status: "success",
                message: "Graph RAG 시연을 처음부터 다시 시작합니다.",
                transcript: text,
            });
            return;
        }


        const command =
            parseVoiceCommand(text);

        setVoiceState({
            status: "processing",
            message: "명령을 처리하고 있습니다.",
            transcript: text,
        });

        switch (command.type) {
            case "NEXT": {
                setVoiceState({
                    status: "idle",
                    message: "페이지 이동은 ‘다음 페이지’라고 짧게 말해주세요.",
                    transcript: text,
                });
                break;
            }

            case "PREV": {
                setVoiceState({
                    status: "idle",
                    message: "페이지 이동은 ‘이전 페이지’라고 짧게 말해주세요.",
                    transcript: text,
                });
                break;
            }

            case "SHOW_LLM": {
                setVoiceState({
                    status: "idle",
                    message: "강의 이동 명령은 짧게 ‘LLM 보여줘’라고 말해주세요.",
                    transcript: text,
                });
                break;
            }

            case "SHOW_RAG": {
                setVoiceState({
                    status: "idle",
                    message: "강의 이동 명령은 짧게 ‘RAG 보여줘’라고 말해주세요.",
                    transcript: text,
                });
                break;
            }

            case "SHOW_KEYWORD": {
                setVoiceState({
                    status: "idle",
                    message: "강의 이동 명령은 짧게 ‘키워드 보여줘’라고 말해주세요.",
                    transcript: text,
                });
                break;
            }

            case "SHOW_VECTOR": {
                setVoiceState({
                    status: "idle",
                    message: "강의 이동 명령은 짧게 ‘벡터 보여줘’라고 말해주세요.",
                    transcript: text,
                });
                break;
            }

            case "SHOW_GRAPH": {
                setVoiceState({
                    status: "idle",
                    message: "강의 이동 명령은 짧게 ‘그래프 보여줘’라고 말해주세요.",
                    transcript: text,
                });
                break;
            }

            /* =====================================================
               VECTOR RAG LIVE DEMO
            ===================================================== */

            case "RUN_VECTOR_DEMO": {
                setScreenOn(true);
                setVisualizerExpanded(false);

                setPcaOpen(false);
                setPcaAutoRotate(false);
                setPcaHighlightPC1(false);

                setKeywordDemoOpen(false);
                setKeywordDemoPaused(false);

                setGraphDemoOpen(false);
                setGraphDemoPaused(false);

                setVectorDemoOpen(true);
                setVectorDemoPaused(false);
                setVectorDemoRestartKey(
                    (prev) => prev + 1,
                );

                setVoiceState({
                    status: "success",
                    message:
                        "Vector RAG 검색 과정을 시각화합니다.",
                    transcript: text,
                });

                break;
            }

            case "PAUSE_VECTOR_DEMO": {
                setVectorDemoPaused(true);

                setVoiceState({
                    status: "success",
                    message:
                        "Vector RAG 시연을 잠시 멈췄습니다.",
                    transcript: text,
                });

                break;
            }

            case "RESUME_VECTOR_DEMO": {
                setVectorDemoOpen(true);
                setVectorDemoPaused(false);

                setVoiceState({
                    status: "success",
                    message:
                        "Vector RAG 시연을 계속합니다.",
                    transcript: text,
                });

                break;
            }

            case "RESTART_VECTOR_DEMO": {
                setScreenOn(true);
                setVisualizerExpanded(false);

                setPcaOpen(false);
                setPcaAutoRotate(false);
                setPcaHighlightPC1(false);

                setVectorDemoOpen(true);
                setVectorDemoPaused(false);
                setVectorDemoRestartKey(
                    (prev) => prev + 1,
                );

                setVoiceState({
                    status: "success",
                    message:
                        "Vector RAG 시연을 처음부터 다시 시작합니다.",
                    transcript: text,
                });

                break;
            }


            /* =====================================================
               PCA VISUALIZER
            ===================================================== */

            case "SHOW_PCA": {
                setScreenOn(true);

                setVectorDemoOpen(false);
                setVectorDemoPaused(false);

                setKeywordDemoOpen(false);
                setKeywordDemoPaused(false);

                setGraphDemoOpen(false);
                setGraphDemoPaused(false);

                setPcaOpen(true);
                setPcaDimension("3D");
                setPcaAutoRotate(false);
                setPcaHighlightPC1(false);

                setVoiceState({
                    status: "success",
                    message:
                        "PCA 3차원 시각화를 열었습니다.",
                    transcript: text,
                });

                break;
            }

            case "PCA_ROTATE": {
                setScreenOn(true);

                setVectorDemoOpen(false);
                setVectorDemoPaused(false);

                setPcaOpen(true);
                setPcaDimension("3D");
                setPcaAutoRotate(true);

                setVoiceState({
                    status: "success",
                    message:
                        "PCA 시각화를 회전합니다.",
                    transcript: text,
                });

                break;
            }

            case "PCA_STOP": {
                setPcaAutoRotate(false);

                setVoiceState({
                    status: "success",
                    message:
                        "PCA 회전을 멈췄습니다.",
                    transcript: text,
                });

                break;
            }

            case "PCA_2D": {
                setScreenOn(true);

                setVectorDemoOpen(false);
                setVectorDemoPaused(false);

                setPcaOpen(true);
                setPcaDimension("2D");
                setPcaAutoRotate(false);

                setVoiceState({
                    status: "success",
                    message:
                        "PCA를 2차원으로 표시합니다.",
                    transcript: text,
                });

                break;
            }

            case "PCA_3D": {
                setScreenOn(true);

                setVectorDemoOpen(false);
                setVectorDemoPaused(false);

                setPcaOpen(true);
                setPcaDimension("3D");

                setVoiceState({
                    status: "success",
                    message:
                        "PCA를 3차원으로 표시합니다.",
                    transcript: text,
                });

                break;
            }

            case "PCA_PC1": {
                setScreenOn(true);

                setVectorDemoOpen(false);
                setVectorDemoPaused(false);

                setPcaOpen(true);
                setPcaHighlightPC1(true);

                setVoiceState({
                    status: "success",
                    message:
                        "첫 번째 주성분 PC1을 강조했습니다.",
                    transcript: text,
                });

                break;
            }

            case "CLOSE_VISUALIZER": {
                setPcaOpen(false);
                setPcaAutoRotate(false);
                setPcaHighlightPC1(false);

                setVectorDemoOpen(false);
                setVectorDemoPaused(false);

                setKeywordDemoOpen(false);
                setKeywordDemoPaused(false);

                setGraphDemoOpen(false);
                setGraphDemoPaused(false);
                setVisualizerExpanded(false);

                setVoiceState({
                    status: "success",
                    message:
                        "시각화를 닫았습니다.",
                    transcript: text,
                });

                break;
            }

            case "SHOW_RELATIONSHIP": {
                const relationshipPageIndex = 1;

                setScreenOn(true);
                setActiveLesson("graph");
                setPageIndex(relationshipPageIndex);
                markVisited("graph", relationshipPageIndex);

                setVoiceState({
                    status: "success",
                    message: "Graph 관계 화면을 열었습니다.",
                    transcript: text,
                });
                break;
            }

            case "SHOW_PROCESS": {
                setVoiceState({
                    status: "success",
                    message: "RAG 과정 시각화는 다음 단계에서 연결합니다.",
                    transcript: text,
                });
                break;
            }

            case "SHOW_LAST_PROCESS": {
                setVoiceState({
                    status: "success",
                    message: "직전 답변 과정은 실습 API 연결 후 사용할 수 있습니다.",
                    transcript: text,
                });
                break;
            }

            case "GO_HOME": {
                navigate("/");
                break;
            }

            case "GO_LAB": {
                navigate("/lab");
                break;
            }

            default: {
                setVoiceState({
                    status: "idle",
                    message: "질문하려면 먼저 ‘아리야’라고 불러주세요.",
                    transcript: text,
                });
                break;
            }
        }
    };

    const {
        isRecording,
        toggleRecording,
    } = useVoiceRecorder({

        /* =========================================
           Whisper 결과
        ========================================= */

        onTranscript: (
            text,
        ) => {

            executeVoiceCommand(
                text,
            );

        },


        /* =========================================
           듣는 중
        ========================================= */

        onListening: () => {

            setVoiceState({
                status: "listening",
                message:
                    "말씀해주세요.",
            });

        },


        /* =========================================
           Whisper 처리 중
        ========================================= */

        onProcessing: () => {

            setVoiceState({
                status: "processing",
                message:
                    "음성을 인식하고 있습니다.",
            });

        },


        /* =========================================
           오류
        ========================================= */

        onError: (
            message,
        ) => {

            setVoiceState({
                status: "error",
                message,
            });

        },

    });
    /* =====================================================
       개발용 음성 명령 테스트

       브라우저 콘솔 예시:
       window.ragVoice("벡터 보여줘")
    ===================================================== */

    useEffect(() => {
        const testWindow = window as typeof window & {
            ragVoice?: (text: string) => void;
        };

        testWindow.ragVoice = executeVoiceCommand;

        return () => {
            delete testWindow.ragVoice;
        };
    });


    const totalPages =
        lessons.reduce(
            (sum, lesson) =>
                sum + lesson.pages.length,
            0,
        );


    const overallProgress =
        Math.round(
            (visited.size / totalPages) *
            100,
        );

    const {
        unlocked: labUnlocked,
        justUnlocked: labJustUnlocked,
        closeUnlockNotice:
            closeLabUnlockNotice,
    } =
        useLabAccess({
            userId:
            user?.id,

            progress:
            overallProgress,
        });

    const getLessonProgress = (
        lesson: Lesson,
    ) => {
        const count =
            lesson.pages.filter(
                (_, index) =>
                    visited.has(
                        `${lesson.key}:${index}`,
                    ),
            ).length;

        return {
            count,
            percent: Math.round(
                (count /
                    lesson.pages.length) *
                100,
            ),
        };
    };

    return {
        user,
        authLoading,
        screenOn,
        setScreenOn,
        activeLesson,
        setActiveLesson,
        pageIndex,
        setPageIndex,
        chatCollapsed,
        setChatCollapsed,
        voiceHelpOpen,
        setVoiceHelpOpen,
        visualizerExpanded,
        setVisualizerExpanded,
        pcaOpen,
        setPcaOpen,
        pcaDimension,
        setPcaDimension,
        pcaAutoRotate,
        setPcaAutoRotate,
        pcaHighlightPC1,
        setPcaHighlightPC1,
        vectorDemoOpen,
        setVectorDemoOpen,
        vectorDemoPaused,
        setVectorDemoPaused,
        vectorDemoRestartKey,
        setVectorDemoRestartKey,
        keywordDemoOpen,
        setKeywordDemoOpen,
        keywordDemoPaused,
        setKeywordDemoPaused,
        keywordDemoRestartKey,
        setKeywordDemoRestartKey,
        graphDemoOpen,
        setGraphDemoOpen,
        graphDemoPaused,
        setGraphDemoPaused,
        graphDemoRestartKey,
        setGraphDemoRestartKey,
        visited,
        voiceState,
        setVoiceState,
        chatInput,
        setChatInput,
        chatLoading,
        chatMessages,
        fairyListening,
        chatBottomRef,
        currentLesson,
        openLesson,
        goNext,
        goPrev,
        isFirstPage,
        isLastPage,
        askClassroomQuestion,
        executeVoiceCommand,
        isRecording,
        toggleRecording,
        overallProgress,
        getLessonProgress,
        navigate,
        labUnlocked,
        labJustUnlocked,
        closeLabUnlockNotice,
    };
}

export type ClassroomController = ReturnType<typeof useClassroomController>;