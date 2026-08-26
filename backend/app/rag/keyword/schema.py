from pydantic import BaseModel


class KeywordSearchItem(BaseModel):
    id: int
    category: str
    concept: str
    content: str
    keywords: str | None = None
    score: int


class KeywordSearchResponse(BaseModel):
    query: str
    keywords: list[str]
    results: list[KeywordSearchItem]


class KeywordChatRequest(BaseModel):
    question: str


class KeywordChatResponse(BaseModel):
    question: str
    rag_type: str
    extracted_keywords: list[str]
    retrieved: list[KeywordSearchItem]
    answer: str


# ==========================================
# Product Keyword Search
# ==========================================

class ProductKeywordItem(BaseModel):
    product_id: str
    product_name: str
    description: str | None = None
    category: str | None = None
    price: float | None = None
    brand: str | None = None
    score: int


class ProductKeywordResponse(BaseModel):
    query: str
    keywords: list[str]
    count: int
    results: list[ProductKeywordItem]
