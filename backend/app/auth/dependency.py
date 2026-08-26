from fastapi import (
    Depends,
    HTTPException,
)

from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)

from app.auth.security import (
    decode_access_token,
)

from app.auth.service import (
    get_user_by_id,
)

from app.db.redis import redis_client


security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),
):

    token = credentials.credentials

    payload = decode_access_token(
        token
    )

    if not payload:

        raise HTTPException(
            status_code=401,
            detail="유효하지 않거나 만료된 로그인입니다.",
        )

    user_id_text = payload.get(
        "sub"
    )

    if not user_id_text:

        raise HTTPException(
            status_code=401,
            detail="잘못된 인증 정보입니다.",
        )

    try:
        user_id = int(
            user_id_text
        )

    except ValueError:

        raise HTTPException(
            status_code=401,
            detail="잘못된 사용자 정보입니다.",
        )

    # ======================================
    # Redis 세션 확인
    # ======================================

    session_key = (
        f"session:user:{user_id}"
    )

    stored_token = redis_client.get(
        session_key
    )

    if not stored_token:

        raise HTTPException(
            status_code=401,
            detail="로그인 세션이 만료되었습니다.",
        )

    if stored_token != token:

        raise HTTPException(
            status_code=401,
            detail="현재 로그인 세션과 일치하지 않습니다.",
        )

    # ======================================
    # PostgreSQL 사용자 확인
    # ======================================

    user = get_user_by_id(
        user_id
    )

    if not user:

        raise HTTPException(
            status_code=401,
            detail="사용자 정보를 찾을 수 없습니다.",
        )

    if not user["is_active"]:

        raise HTTPException(
            status_code=403,
            detail="비활성화된 계정입니다.",
        )

    return user