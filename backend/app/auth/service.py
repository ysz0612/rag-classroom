import os

from fastapi import HTTPException
from sqlalchemy import text

from app.auth.security import (
    create_access_token,
    hash_password,
    verify_password,
)

from app.db.postgres import engine
from app.db.redis import redis_client


SESSION_EXPIRE_SECONDS = int(
    os.getenv(
        "SESSION_EXPIRE_SECONDS",
        "7200",
    )
)


# ==========================================
# 회원가입
# ==========================================

def signup_user(
    username: str,
    email: str,
    password: str,
    nickname: str | None,
):

    check_sql = text("""
        SELECT id
        FROM app_users

        WHERE
            username = :username
            OR email = :email

        LIMIT 1;
    """)

    with engine.connect() as conn:

        existing = conn.execute(
            check_sql,
            {
                "username": username,
                "email": email,
            },
        ).mappings().first()

    if existing:

        raise HTTPException(
            status_code=409,
            detail="이미 사용 중인 아이디 또는 이메일입니다.",
        )

    hashed = hash_password(
        password
    )

    insert_sql = text("""
        INSERT INTO app_users (
            username,
            email,
            password_hash,
            nickname
        )

        VALUES (
            :username,
            :email,
            :password_hash,
            :nickname
        )

        RETURNING
            id,
            username,
            email,
            nickname,
            is_active;
    """)

    with engine.begin() as conn:

        user = conn.execute(
            insert_sql,
            {
                "username": username,
                "email": email,
                "password_hash": hashed,
                "nickname": nickname,
            },
        ).mappings().first()

    return dict(user)


# ==========================================
# 로그인
# ==========================================

def login_user(
    username: str,
    password: str,
):

    sql = text("""
        SELECT
            id,
            username,
            email,
            password_hash,
            nickname,
            is_active

        FROM app_users

        WHERE username = :username

        LIMIT 1;
    """)

    with engine.connect() as conn:

        user = conn.execute(
            sql,
            {
                "username": username,
            },
        ).mappings().first()

    if not user:

        raise HTTPException(
            status_code=401,
            detail="아이디 또는 비밀번호가 올바르지 않습니다.",
        )

    if not user["is_active"]:

        raise HTTPException(
            status_code=403,
            detail="비활성화된 계정입니다.",
        )

    if not verify_password(
        password,
        user["password_hash"],
    ):

        raise HTTPException(
            status_code=401,
            detail="아이디 또는 비밀번호가 올바르지 않습니다.",
        )

    token = create_access_token(
        user_id=user["id"],
        username=user["username"],
    )

    # Redis 로그인 세션
    session_key = (
        f"session:user:{user['id']}"
    )

    redis_client.setex(
        session_key,
        SESSION_EXPIRE_SECONDS,
        token,
    )

    return {
        "access_token": token,

        "token_type": "bearer",

        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "nickname": user["nickname"],
            "is_active": user["is_active"],
        },
    }


# ==========================================
# 사용자 조회
# ==========================================

def get_user_by_id(
    user_id: int,
):

    sql = text("""
        SELECT
            id,
            username,
            email,
            nickname,
            is_active

        FROM app_users

        WHERE id = :user_id

        LIMIT 1;
    """)

    with engine.connect() as conn:

        user = conn.execute(
            sql,
            {
                "user_id": user_id,
            },
        ).mappings().first()

    if not user:

        return None

    return dict(user)


# ==========================================
# 로그아웃
# ==========================================

def logout_user(
    user_id: int,
):

    redis_client.delete(
        f"session:user:{user_id}"
    )