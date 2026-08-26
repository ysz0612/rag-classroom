from io import BytesIO
from pathlib import Path

from fastapi import (
    APIRouter,
    File,
    HTTPException,
    UploadFile,
)

from openai import OpenAI


router = APIRouter(
    prefix="/api/voice",
    tags=["Voice"],
)


client = OpenAI()


# =========================================================
# 지원 확장자
# =========================================================

SUPPORTED_EXTENSIONS = {
    ".flac",
    ".m4a",
    ".mp3",
    ".mp4",
    ".mpeg",
    ".mpga",
    ".oga",
    ".ogg",
    ".wav",
    ".webm",
}


# =========================================================
# MIME TYPE
# =========================================================

MIME_TYPES = {
    ".flac": "audio/flac",
    ".m4a": "audio/mp4",
    ".mp3": "audio/mpeg",
    ".mp4": "audio/mp4",
    ".mpeg": "audio/mpeg",
    ".mpga": "audio/mpeg",
    ".oga": "audio/ogg",
    ".ogg": "audio/ogg",
    ".wav": "audio/wav",
    ".webm": "audio/webm",
}


# =========================================================
# TRANSCRIBE
# =========================================================

@router.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
):
    """
    브라우저 또는 파일 업로드로 받은 음성을
    Whisper를 이용해 한국어 텍스트로 변환합니다.
    """

    try:

        # =================================================
        # 1. 파일 읽기
        # =================================================

        audio_bytes = await file.read()


        print(
            "[VOICE FILE]",
            {
                "filename": file.filename,
                "content_type": file.content_type,
                "size": len(audio_bytes),
            },
        )


        # =================================================
        # 2. 빈 파일 검사
        #
        # 짧은 음성은 허용합니다.
        #
        # "다음"
        # "이전"
        # "PCA"
        #
        # 같은 명령도 받아야 하므로
        # 파일 크기로 차단하지 않습니다.
        # =================================================

        if not audio_bytes:

            raise HTTPException(
                status_code=400,
                detail="음성 파일이 비어 있습니다.",
            )


        # =================================================
        # 3. 확장자 확인
        # =================================================

        original_filename = (
            file.filename
            or "voice.webm"
        )


        extension = (
            Path(original_filename)
            .suffix
            .lower()
        )


        if extension not in SUPPORTED_EXTENSIONS:

            raise HTTPException(
                status_code=400,
                detail=(
                    "지원하지 않는 음성 파일 형식입니다. "
                    f"현재 파일: {original_filename}"
                ),
            )


        # =================================================
        # 4. OpenAI로 보낼 파일명
        #
        # 한글 파일명 등의 영향을 피하기 위해
        # 내부에서는 voice.m4a 같은 이름으로 전달
        # =================================================

        safe_filename = (
            f"voice{extension}"
        )


        mime_type = MIME_TYPES.get(
            extension,
            "application/octet-stream",
        )


        # =================================================
        # 5. BytesIO 생성
        # =================================================

        audio_file = BytesIO(
            audio_bytes,
        )


        audio_file.name = (
            safe_filename
        )


        # =================================================
        # 6. Whisper
        #
        # prompt는 명령문을 강제하는 것이 아니라
        # 프로젝트에서 자주 등장하는 용어를
        # Whisper에게 힌트로 제공합니다.
        # =================================================

        transcription = (
            client.audio.transcriptions.create(

                model="whisper-1",

                file=(
                    safe_filename,
                    audio_bytes,
                    mime_type,
                ),

                language="ko",

                prompt=(
                    "RAG, LLM, Keyword RAG, "
                    "Vector RAG, Graph RAG, "
                    "PCA, Embedding, "
                    "Cosine Similarity, "
                    "키워드, 벡터, 그래프, "
                    "노드, 관계, 임베딩, "
                    "코사인 유사도, "
                    "다음, 이전, 홈, "
                    "학습실, 실습실"
                ),
            )
        )


        # =================================================
        # 7. 텍스트
        # =================================================

        text = (
            transcription.text
            or ""
        ).strip()


        print(
            "[VOICE RESULT]",
            text,
        )


        # =================================================
        # 8. 결과
        # =================================================

        return {

            "text": text,

            "original_filename":
                original_filename,

            "size":
                len(audio_bytes),

            "content_type":
                file.content_type,

        }


    # =====================================================
    # FastAPI에서 우리가 직접 발생시킨 오류
    # =====================================================

    except HTTPException:

        raise


    # =====================================================
    # OpenAI / 기타 오류
    # =====================================================

    except Exception as exc:

        print(
            "[VOICE TRANSCRIBE ERROR]",
            repr(exc),
        )


        raise HTTPException(
            status_code=500,
            detail=(
                "음성 인식 중 오류가 발생했습니다."
            ),
        )