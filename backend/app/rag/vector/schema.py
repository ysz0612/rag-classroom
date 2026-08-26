from pydantic import BaseModel


# ==========================================
# Knowledge Vector Search
# ==========================================

class VectorSearchItem(BaseModel):
    id: int
    category: str
    concept: str
    content: str
    keywords: str | None = None
    similarity: float


class VectorSearchResponse(BaseModel):
    query: str
    results: list[VectorSearchItem]


# ==========================================
# Vector RAG Chat
# ==========================================

class VectorChatRequest(BaseModel):
    question: str


class VectorTraceStep(BaseModel):
    step: int
    key: str
    label: str


class VectorChatResponse(BaseModel):

    question: str

    rag_type: str

    embedding_model: str

    embedding_dimensions: int

    knowledge_count: int

    top_k: int

    retrieved: list[VectorSearchItem]

    context: str

    chat_model: str

    answer: str

    trace: list[VectorTraceStep]


# ==========================================
# Knowledge PCA
# ==========================================

class KnowledgePcaPoint(BaseModel):
    id: int
    category: str
    concept: str
    x: float
    y: float
    z: float | None = None


class KnowledgePcaResponse(BaseModel):
    type: str
    dimensions: int
    count: int
    explained_variance_ratio: list[float]
    points: list[KnowledgePcaPoint]


# ==========================================
# Product Vector Search
# ==========================================

class ProductVectorItem(BaseModel):
    product_id: str
    product_name: str
    description: str | None = None
    category: str | None = None
    price: float | None = None
    brand: str | None = None
    similarity: float


class ProductVectorResponse(BaseModel):
    query: str
    count: int
    results: list[ProductVectorItem]


# ==========================================
# Product PCA
# ==========================================

class ProductPcaPoint(BaseModel):
    product_id: str
    product_name: str
    category: str | None = None
    brand: str | None = None
    x: float
    y: float
    z: float | None = None


class ProductPcaResponse(BaseModel):
    type: str
    dimensions: int
    count: int
    explained_variance_ratio: list[float]
    points: list[ProductPcaPoint]