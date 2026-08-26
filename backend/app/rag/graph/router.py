from fastapi import (
    APIRouter,
    Depends,
)

from app.auth.dependency import (
    get_current_user,
)

from app.rag.graph.schema import (
    GraphChatRequest,
    GraphChatResponse,
)

from app.rag.graph.service import (
    build_visualization,
    graph_search,
    make_graph_answer,
)


router = APIRouter(
    prefix="/api/rag/graph",
    tags=["Graph RAG"],

    dependencies=[
        Depends(
            get_current_user
        )
    ],
)


# ==========================================
# Graph RAG Chat
# ==========================================

@router.post(
    "/chat",
    response_model=GraphChatResponse,
)
def graph_chat(
    request: GraphChatRequest,
):

    # ======================================
    # 질문에 맞는 Graph 경로 탐색
    # ======================================

    (
        path_type,
        path,
        results,
    ) = graph_search(

        question=request.question,

        user_id=request.user_id,

        min_rating=request.min_rating,

        limit=request.limit,
    )


    # ======================================
    # Graph 시각화 데이터
    # ======================================

    (
        nodes,
        relationships,
    ) = build_visualization(

        path_type=path_type,

        results=results,
    )


    # ======================================
    # LLM 답변
    # ======================================

    answer = make_graph_answer(

        question=request.question,

        path_type=path_type,

        path=path,

        results=results,
    )


    return {
        "question":
            request.question,

        "rag_type":
            "graph",

        "path_type":
            path_type,

        "path":
            path,

        "retrieved":
            results,

        "nodes":
            nodes,

        "relationships":
            relationships,

        "answer":
            answer,
    }