from pydantic import BaseModel, Field


# ==========================================
# Graph 탐색 결과
# ==========================================

class GraphSearchItem(BaseModel):
    user_id: str | None = None

    product_id: str | None = None
    product_name: str | None = None

    rating: float | None = None

    brand: str | None = None
    category: str | None = None

    related_product_id: str | None = None
    related_product: str | None = None

    related_user_id: str | None = None


# ==========================================
# Graph 시각화
# ==========================================

class GraphNode(BaseModel):
    id: str
    label: str
    type: str


class GraphRelationship(BaseModel):
    source: str
    target: str
    type: str


# ==========================================
# Chat
# ==========================================

class GraphChatRequest(BaseModel):
    question: str = Field(
        min_length=1,
    )

    user_id: str

    min_rating: float = Field(
        default=4.0,
        ge=0,
        le=5,
    )

    limit: int = Field(
        default=10,
        ge=1,
        le=30,
    )


class GraphChatResponse(BaseModel):
    question: str

    rag_type: str

    path_type: str

    path: str

    retrieved: list[GraphSearchItem]

    nodes: list[GraphNode]

    relationships: list[GraphRelationship]

    answer: str