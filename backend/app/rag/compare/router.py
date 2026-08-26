from fastapi import (
    APIRouter,
    Depends,
)

from app.auth.dependency import (
    get_current_user,
)

from app.rag.compare.schema import (
    CompareUserOption,
    RagCompareRequest,
    RagCompareResponse,
)

from app.rag.compare.service import (
    compare_product_search,
    get_compare_users,
)


router = APIRouter(
    prefix="/api/rag/compare",
    tags=["RAG Compare"],

    dependencies=[
        Depends(
            get_current_user
        )
    ],
)


@router.get(
    "/users",
    response_model=list[CompareUserOption],
)
def compare_users(
    limit: int = 20,
):
    return get_compare_users(
        limit=max(1, min(limit, 50)),
    )


@router.post(
    "",
    response_model=RagCompareResponse,
)
def compare_rag(
    request: RagCompareRequest,
):
    return compare_product_search(
        question=request.question,
        user_id=request.user_id,
        min_rating=request.min_rating,
        limit=request.limit,
    )
