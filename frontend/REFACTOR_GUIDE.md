# Classroom 리팩터링 구조

기존 `src/pages/learn/ClassroomPage.tsx`(약 3,900줄)를 역할별 파일로 분리했습니다.
화면/기능은 유지하고 페이지 파일은 조립 역할만 하도록 변경했습니다.

## 핵심 구조

```text
src/
├─ features/
│  ├─ classroom/
│  │  ├─ components/
│  │  │  ├─ ClassroomBackground.tsx   # 교실 배경 장식
│  │  │  ├─ LessonSidebar.tsx         # 왼쪽 학습 목록
│  │  │  ├─ ClassroomComputer.tsx     # 중앙 모니터 + 시각화 레이어
│  │  │  ├─ ClassroomChat.tsx         # 오른쪽 AI 챗봇
│  │  │  ├─ ProgressFooter.tsx        # 전체/강의별 진행률
│  │  │  ├─ VoiceHelpModal.tsx        # 음성 명령 도움말
│  │  │  └─ LessonScreen.tsx          # 현재 강의 컴포넌트 선택
│  │  ├─ data/
│  │  │  └─ lessons.tsx               # 강의 목록/페이지 메타데이터
│  │  ├─ hooks/
│  │  │  └─ useClassroomController.ts # 상태, 저장, 챗봇, 음성 명령 제어
│  │  ├─ storage.ts                    # 사용자별 sessionStorage 키/복원
│  │  └─ types.ts                      # Classroom 타입
│  ├─ visualizer/                      # 기존 PCA / Keyword / Vector / Graph 시각화
│  └─ voice/                           # 기존 Whisper/명령 파서
│
└─ pages/
   └─ learn/
      ├─ ClassroomPage.tsx             # 약 37줄, 전체 조립만 담당
      └─ lessons/
         ├─ LlmLesson.tsx              # 기존 ClassroomPage 내부 LLM 강의 분리
         ├─ RagLesson.tsx
         ├─ KeywordLesson.tsx
         ├─ VectorLesson.tsx
         └─ GraphLesson.tsx
```

## 같이 수정한 빌드 오류

- `voiceCommands.ts`의 `VoiceCommandType`에 `RESUME_VECTOR_DEMO`를 추가했습니다.
- `VectorLesson.tsx`의 사용하지 않는 Ant Design icon import 2개를 제거했습니다.

## 검증

`tsc -b` 타입 검사는 통과했습니다.
현재 전달 ZIP에서는 `node_modules`를 제외했습니다. 새 환경에서 압축을 풀었다면 `npm install` 후 실행하면 됩니다.
