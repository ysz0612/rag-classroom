from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    username: str = Field(
        min_length=4,
        max_length=50,
    )
    email: EmailStr
    password: str = Field(
        min_length=6,
        max_length=100,
    )
    nickname: str | None = Field(
        default=None,
        max_length=50,
    )


class LoginRequest(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    nickname: str | None
    is_active: bool


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class MessageResponse(BaseModel):
    message: str