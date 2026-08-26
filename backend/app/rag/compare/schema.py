from typing import Any

from pydantic import BaseModel, Field


class RagCompareRequest(BaseModel):
    question: str = Field(
        min_length=1,
    )

    user_id: str = Field(
        min_length=1,
    )

    min_rating: float = Field(
        default=4.0,
        ge=0,
        le=5,
    )

    limit: int = Field(
        default=5,
        ge=1,
        le=20,
    )


class CompareUserOption(BaseModel):
    alias: str
    user_id: str
    review_count: int


class CompareMethodResult(BaseModel):
    status: str
    search_type: str

    count: int = 0

    keywords: list[str] = []
    path_type: str | None = None
    path: str | None = None

    retrieved: list[dict[str, Any]] = []

    nodes: list[dict[str, Any]] = []
    relationships: list[dict[str, Any]] = []

    error: str | None = None


class RagCompareResponse(BaseModel):
    question: str
    user_id: str
    limit: int

    keyword: CompareMethodResult
    vector: CompareMethodResult
    graph: CompareMethodResult
