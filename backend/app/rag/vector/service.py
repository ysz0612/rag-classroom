import os

from dotenv import load_dotenv
from openai import OpenAI
from sqlalchemy import text

from app.db.postgres import engine


load_dotenv()


client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
)


EMBEDDING_MODEL = "text-embedding-3-small"
CHAT_MODEL = "gpt-4o-mini"


# ==========================================
# 질문 Embedding
# ==========================================

def create_query_embedding(
    question: str,
) -> list[float]:

    response = client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=question,
    )

    return response.data[0].embedding


# ==========================================
# Vector → PostgreSQL 문자열
# ==========================================

def embedding_to_string(
    embedding: list[float],
) -> str:

    return (
        "["
        + ",".join(
            str(value)
            for value in embedding
        )
        + "]"
    )


# ==========================================
# Vector 검색
# ==========================================

def vector_search(
    question: str,
    limit: int = 5,
):

    # 질문 Embedding 생성
    query_embedding = create_query_embedding(
        question
    )

    embedding_string = embedding_to_string(
        query_embedding
    )


    # <=> = cosine distance
    #
    # cosine similarity
    # = 1 - cosine distance

    sql = text("""
        SELECT
            id,
            category,
            concept,
            content,
            keywords,

            (
                1 - (
                    embedding
                    <=>
                    CAST(:embedding AS vector)
                )
            ) AS similarity

        FROM rag_knowledge

        WHERE embedding IS NOT NULL

        ORDER BY
            embedding
            <=>
            CAST(:embedding AS vector)

        LIMIT :limit;
    """)


    with engine.connect() as conn:

        rows = conn.execute(
            sql,
            {
                "embedding": embedding_string,
                "limit": limit,
            },
        ).mappings().all()


    results = []


    for row in rows:

        similarity = float(
            row["similarity"]
        )

        results.append(
            {
                "id": row["id"],
                "category": row["category"],
                "concept": row["concept"],
                "content": row["content"],
                "keywords": row["keywords"],
                "similarity": round(
                    similarity,
                    4,
                ),
            }
        )


    return results


# ==========================================
# Context 생성
# ==========================================

def make_vector_context(
    results: list[dict],
) -> str:

    if not results:
        return ""

    context = "\n\n".join(
        [
            (
                f"[{item['concept']}]\n"
                f"{item['content']}"
            )
            for item in results
        ]
    )

    return context


# ==========================================
# LLM 답변 생성
# ==========================================

def make_vector_answer(
    question: str,
    results: list[dict],
) -> str:

    if not results:

        return (
            "질문과 의미적으로 관련된 "
            "지식을 찾지 못했습니다."
        )


    context = make_vector_context(
        results
    )


    response = client.chat.completions.create(

        model=CHAT_MODEL,

        messages=[

            {
                "role": "system",

                "content": (
                    "당신은 RAG 교육 사이트의 "
                    "강의 도우미입니다. "

                    "Vector RAG가 검색한 지식만 "
                    "근거로 답변하세요. "

                    "학생이 이해하기 쉽게 "
                    "한국어로 설명하세요. "

                    "검색된 정보에 없는 사실을 "
                    "추측하지 마세요."
                ),
            },

            {
                "role": "user",

                "content": f"""
사용자 질문:
{question}

Vector RAG가 의미 유사도로 검색한 정보:
{context}

위 검색 정보만 참고하여
사용자의 질문에 답변해주세요.
""",
            },
        ],

        temperature=0.2,
    )


    return (
        response
        .choices[0]
        .message
        .content
    )