from app.rag.keyword.schema import (
    KeywordChatRequest,
    KeywordChatResponse,
    KeywordSearchResponse,
    ProductKeywordResponse,
)

from app.rag.keyword.service import (
    keyword_search,
    make_keyword_answer,
    search_products_keyword,
)
from fastapi import APIRouter, Depends, Query

from app.auth.dependency import get_current_user

router = APIRouter(
    prefix="/api/rag/keyword",
    tags=["Keyword RAG"],
    dependencies=[
        Depends(get_current_user)
    ],
)


# ==========================================
# Keyword 검색
# ==========================================

@router.get(
    "",
    response_model=KeywordSearchResponse,
)
def search_keyword(
    q: str = Query(
        ...,
        min_length=1,
    ),
    limit: int = Query(
        5,
        ge=1,
        le=20,
    ),
):
    keywords, results = keyword_search(
        question=q,
        limit=limit,
    )

    return {
        "query": q,
        "keywords": keywords,
        "results": results,
    }


# ==========================================
# Keyword RAG Chat
# ==========================================

@router.post(
    "/chat",
    response_model=KeywordChatResponse,
)
def keyword_chat(
    request: KeywordChatRequest,
):
    keywords, results = keyword_search(
        question=request.question,
        limit=5,
    )

    answer = make_keyword_answer(
        question=request.question,
        results=results,
    )

    return {
        "question": request.question,
        "rag_type": "keyword",
        "extracted_keywords": keywords,
        "retrieved": results,
        "answer": answer,
    }


# ==========================================
# Product Keyword Search
# ==========================================

@router.get(
    "/products",
    response_model=ProductKeywordResponse,
)
def product_keyword_search(
    q: str = Query(
        ...,
        min_length=1,
    ),
    limit: int = Query(
        5,
        ge=1,
        le=20,
    ),
):
    keywords, results = search_products_keyword(
        question=q,
        limit=limit,
    )

    return {
        "query": q,
        "keywords": keywords,
        "count": len(results),
        "results": results,
    }
