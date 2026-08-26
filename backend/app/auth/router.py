from fastapi import (
    APIRouter,
    Depends,
)

from app.auth.dependency import (
    get_current_user,
)

from app.auth.schema import (
    LoginRequest,
    LoginResponse,
    MessageResponse,
    SignupRequest,
    UserResponse,
)

from app.auth.service import (
    login_user,
    logout_user,
    signup_user,
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


# ==========================================
# 회원가입
# ==========================================

@router.post(
    "/signup",
    response_model=UserResponse,
    status_code=201,
)
def signup(
    request: SignupRequest,
):

    return signup_user(
        username=request.username,
        email=request.email,
        password=request.password,
        nickname=request.nickname,
    )


# ==========================================
# 로그인
# ==========================================

@router.post(
    "/login",
    response_model=LoginResponse,
)
def login(
    request: LoginRequest,
):

    return login_user(
        username=request.username,
        password=request.password,
    )


# ==========================================
# 현재 로그인 사용자
# ==========================================

@router.get(
    "/me",
    response_model=UserResponse,
)
def me(
    current_user=Depends(
        get_current_user
    ),
):

    return current_user


# ==========================================
# 로그아웃
# ==========================================

@router.post(
    "/logout",
    response_model=MessageResponse,
)
def logout(
    current_user=Depends(
        get_current_user
    ),
):

    logout_user(
        current_user["id"]
    )

    return {
        "message": "로그아웃되었습니다."
    }