from fastapi import (
    APIRouter,
    Depends,
    Query,
)

from sqlalchemy import text

from app.auth.dependency import get_current_user
from app.db.postgres import engine

from app.rag.vector.schema import (
    KnowledgePcaResponse,
    ProductPcaResponse,
    ProductVectorResponse,
    VectorChatRequest,
    VectorChatResponse,
    VectorSearchResponse,
)

from app.rag.vector.service import (
    make_vector_answer,
    make_vector_context,
    vector_search,
)

from app.rag.vector.product_service import (
    search_products_vector,
)

from app.rag.vector.pca_service import (
    create_knowledge_pca,
    create_product_pca,
)


router = APIRouter(
    prefix="/api/rag/vector",
    tags=["Vector RAG"],
    dependencies=[
        Depends(get_current_user)
    ],
)


# ==========================================
# Knowledge 개수
# ==========================================

def get_knowledge_count() -> int:

    sql = text("""
        SELECT COUNT(*)
        FROM rag_knowledge
        WHERE embedding IS NOT NULL;
    """)

    with engine.connect() as conn:

        count = conn.execute(
            sql
        ).scalar_one()

    return count


# ==========================================
# Knowledge Vector Search
# ==========================================

@router.get(
    "",
    response_model=VectorSearchResponse,
)
def search_vector(
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

    results = vector_search(
        question=q,
        limit=limit,
    )

    return {
        "query": q,
        "results": results,
    }


# ==========================================
# Vector RAG Chat
# ==========================================

@router.post(
    "/chat",
    response_model=VectorChatResponse,
)
def vector_chat(
    request: VectorChatRequest,
):

    # --------------------------------------
    # 1. Vector Search
    # --------------------------------------

    top_k = 5

    results = vector_search(
        question=request.question,
        limit=top_k,
    )


    # --------------------------------------
    # 2. Context 생성
    # --------------------------------------

    context = make_vector_context(
        results
    )


    # --------------------------------------
    # 3. LLM Answer
    # --------------------------------------

    answer = make_vector_answer(
        question=request.question,
        results=results,
    )


    # --------------------------------------
    # 4. Knowledge 개수
    # --------------------------------------

    knowledge_count = (
        get_knowledge_count()
    )


    # --------------------------------------
    # 5. 발표 시각화용 Trace
    # --------------------------------------

    trace = [

        {
            "step": 1,
            "key": "question",
            "label": "Question",
        },

        {
            "step": 2,
            "key": "embedding",
            "label": "Embedding",
        },

        {
            "step": 3,
            "key": "vector_db",
            "label": "Vector DB",
        },

        {
            "step": 4,
            "key": "similarity",
            "label": "Similarity",
        },

        {
            "step": 5,
            "key": "top_k",
            "label": "Top-K",
        },

        {
            "step": 6,
            "key": "context",
            "label": "Context",
        },

        {
            "step": 7,
            "key": "llm",
            "label": "LLM",
        },

        {
            "step": 8,
            "key": "answer",
            "label": "Answer",
        },
    ]


    # --------------------------------------
    # Response
    # --------------------------------------

    return {

        "question": request.question,

        "rag_type": "vector",

        "embedding_model":
            "text-embedding-3-small",

        "embedding_dimensions":
            1536,

        "knowledge_count":
            knowledge_count,

        "top_k":
            top_k,

        "retrieved":
            results,

        "context":
            context,

        "chat_model":
            "gpt-4o-mini",

        "answer":
            answer,

        "trace":
            trace,
    }


# ==========================================
# Product Vector Search
# ==========================================

@router.get(
    "/products",
    response_model=ProductVectorResponse,
)
def product_vector_search(
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

    results = search_products_vector(
        question=q,
        limit=limit,
    )

    return {
        "query": q,
        "count": len(results),
        "results": results,
    }


# ==========================================
# Knowledge PCA
# ==========================================

@router.get(
    "/pca/knowledge",
    response_model=KnowledgePcaResponse,
)
def knowledge_pca(
    dimensions: int = Query(
        3,
        ge=2,
        le=3,
    ),
):

    return create_knowledge_pca(
        dimensions=dimensions,
    )


# ==========================================
# Product PCA
# ==========================================

@router.get(
    "/pca/products",
    response_model=ProductPcaResponse,
)
def product_pca(
    dimensions: int = Query(
        3,
        ge=2,
        le=3,
    ),
):

    return create_product_pca(
        dimensions=dimensions,
    )