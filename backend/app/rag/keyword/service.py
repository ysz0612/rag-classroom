import os
import re

from dotenv import load_dotenv
from openai import OpenAI
from sqlalchemy import text

from app.db.postgres import engine


load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
)

CHAT_MODEL = "gpt-4o-mini"


# ==========================================
# 중요 개념어
# ==========================================

SPECIAL_TERMS = [
    "Keyword RAG",
    "Vector RAG",
    "Graph RAG",
    "Hybrid RAG",
    "Keyword Search",
    "Vector Search",
    "Graph Search",
    "Cosine Similarity",
    "Semantic Search",
    "Fine-tuning",
    "Context Window",
    "Graph Traversal",
    "Vector DB",
    "Graph DB",
    "Embedding",
    "Retriever",
    "Retrieval",
    "Generation",
    "Chunking",
    "Chunk",
    "Top-K",
    "Reranking",
    "Grounding",
    "Hallucination",
    "Neo4j",
    "pgvector",
    "PostgreSQL",
    "PCA",
    "LLM",
    "RAG",
]


# ==========================================
# 불필요한 단어
# ==========================================

STOPWORDS = {
    "내가",
    "높게",
    "평가한",
    "평가",
    "상품",
    "제품",
    "같은",

    "은",
    "는",
    "이",
    "가",
    "을",
    "를",
    "에",
    "에서",
    "에게",
    "으로",
    "로",
    "와",
    "과",
    "도",
    "만",

    "뭐야",
    "뭔데",
    "무엇",
    "어떤",
    "어떻게",
    "언제",
    "왜",

    "알려줘",
    "설명해줘",
    "말해줘",
    "보여줘",
    "추천해줘",
    "추천",

    "좋아",
    "좋은",
    "좋을까",
    "좋나요",

    "사용",
    "사용하는",
    "사용하면",
    "사용할",
    "사용할까",
    "사용해",
    "사용해서",

    "쓰는",
    "쓰면",
    "쓸까",
    "쓸",

    "할때",
    "할",
    "때",
    "경우",
}


# ==========================================
# 조사 제거
# ==========================================

def normalize_word(
    word: str,
) -> str:
    endings = [
        "에서는",
        "에게는",
        "으로는",
        "이라는",
        "라는",
        "이란",
        "에는",
        "에서",
        "으로",
        "에게",
        "은",
        "는",
        "이",
        "가",
        "을",
        "를",
        "도",
        "만",
    ]

    for ending in endings:
        if (
            word.endswith(ending)
            and len(word) > len(ending) + 1
        ):
            return word[:-len(ending)]

    return word


# ==========================================
# Keyword 추출
# ==========================================

def extract_keywords(
    question: str,
) -> list[str]:
    result: list[str] = []

    working_text = question

    # 중요 복합 개념을 먼저 추출합니다.
    for term in SPECIAL_TERMS:
        pattern = re.compile(
            re.escape(term),
            re.IGNORECASE,
        )

        if pattern.search(working_text):
            if term not in result:
                result.append(term)

            working_text = pattern.sub(
                " ",
                working_text,
            )

    cleaned = re.sub(
        r"[^0-9a-zA-Z가-힣\s\-]",
        " ",
        working_text,
    )

    for original_word in cleaned.split():
        word = original_word.strip()

        if not word:
            continue

        if word in STOPWORDS:
            continue

        word = normalize_word(word)

        if word in STOPWORDS:
            continue

        if len(word) < 2:
            continue

        if word not in result:
            result.append(word)

    return result


# ==========================================
# 지식 Keyword 검색
# ==========================================

def keyword_search(
    question: str,
    limit: int = 5,
):
    keywords = extract_keywords(question)

    if not keywords:
        return keywords, []

    score_parts = []
    params = {
        "limit": limit,
    }

    for index, keyword in enumerate(keywords):
        key = f"k{index}"

        params[key] = f"%{keyword}%"

        score_parts.append(
            f"""
            (
                CASE
                    WHEN concept ILIKE :{key}
                    THEN 5
                    ELSE 0
                END

                +

                CASE
                    WHEN keywords ILIKE :{key}
                    THEN 3
                    ELSE 0
                END

                +

                CASE
                    WHEN content ILIKE :{key}
                    THEN 1
                    ELSE 0
                END
            )
            """
        )

    score_sql = " + ".join(
        score_parts
    )

    sql = text(
        f"""
        SELECT
            id,
            category,
            concept,
            content,
            keywords,
            ({score_sql}) AS score

        FROM rag_knowledge

        WHERE
            ({score_sql}) > 0

        ORDER BY
            score DESC,
            id ASC

        LIMIT :limit
        """
    )

    with engine.connect() as conn:
        rows = (
            conn.execute(
                sql,
                params,
            )
            .mappings()
            .all()
        )

    results = [
        {
            "id":
                row["id"],

            "category":
                row["category"],

            "concept":
                row["concept"],

            "content":
                row["content"],

            "keywords":
                row["keywords"],

            "score":
                int(row["score"]),
        }

        for row in rows
    ]

    return keywords, results


# ==========================================
# 지식 Keyword RAG 답변
# ==========================================

def make_keyword_answer(
    question: str,
    results: list[dict],
) -> str:
    if not results:
        return (
            "현재 지식 데이터에서 "
            "질문과 직접 일치하는 정보를 "
            "찾지 못했습니다."
        )

    context = "\n\n".join(
        [
            (
                f"[{item['concept']}]\n"
                f"{item['content']}"
            )
            for item in results
        ]
    )

    response = client.chat.completions.create(
        model=CHAT_MODEL,

        messages=[
            {
                "role": "system",
                "content": (
                    "당신은 RAG 교육 사이트의 "
                    "강의 도우미입니다. "

                    "반드시 제공된 검색 정보만 "
                    "근거로 답변하세요. "

                    "학생이 이해하기 쉽게 "
                    "한국어로 설명하세요. "

                    "검색 정보에 없는 사실은 "
                    "추측하지 마세요."
                ),
            },
            {
                "role": "user",
                "content": f"""
사용자 질문:
{question}

Keyword RAG가 검색한 관련 정보:
{context}

위 정보만 참고하여 질문에 답변해주세요.
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
        or ""
    )


# ==========================================
# 상품 Keyword 검색
# ==========================================

def search_products_keyword(
    question: str,
    limit: int = 5,
):
    """
    질문에서 추출한 모든 핵심 단어가
    상품 검색문에 포함된 경우만 반환합니다.

    예:
    '무선 이어폰'
    → '무선'과 '이어폰'이 모두 있어야 검색됩니다.
    """

    keywords = extract_keywords(question)

    if not keywords:
        return keywords, []

    score_parts = []
    required_parts = []

    params = {
        "limit": limit,
    }

    for index, keyword in enumerate(keywords):
        key = f"product_k{index}"

        params[key] = f"%{keyword}%"

        # 모든 핵심 단어가 검색문에 있어야 합니다.
        required_parts.append(
            f"""
            COALESCE(
                search_text_ko,
                search_text,
                ''
            ) ILIKE :{key}
            """
        )

        # 단어가 나타난 위치에 따라 점수를 계산합니다.
        score_parts.append(
            f"""
            (
                CASE
                    WHEN COALESCE(
                        product_name_ko,
                        product_name,
                        ''
                    ) ILIKE :{key}
                    THEN 5
                    ELSE 0
                END

                +

                CASE
                    WHEN COALESCE(
                        category_ko,
                        category,
                        ''
                    ) ILIKE :{key}
                    THEN 3
                    ELSE 0
                END

                +

                CASE
                    WHEN COALESCE(
                        brand,
                        ''
                    ) ILIKE :{key}
                    THEN 2
                    ELSE 0
                END

                +

                CASE
                    WHEN COALESCE(
                        search_text_ko,
                        search_text,
                        ''
                    ) ILIKE :{key}
                    THEN 1
                    ELSE 0
                END
            )
            """
        )

    score_sql = " + ".join(
        score_parts
    )

    required_sql = " AND ".join(
        required_parts
    )

    sql = text(
        f"""
        SELECT
            product_id,

            COALESCE(
                CASE
                    WHEN LOWER(
                        TRIM(
                            COALESCE(
                                product_name_ko,
                                ''
                            )
                        )
                    ) NOT IN ('', 'nan')
                    THEN product_name_ko
                END,

                CASE
                    WHEN LOWER(
                        TRIM(
                            COALESCE(
                                product_name,
                                ''
                            )
                        )
                    ) NOT IN ('', 'nan')
                    THEN product_name
                END
            ) AS product_name,

            COALESCE(
                CASE
                    WHEN LOWER(
                        TRIM(
                            COALESCE(
                                description_ko,
                                ''
                            )
                        )
                    ) NOT IN ('', 'nan')
                    THEN description_ko
                END,

                CASE
                    WHEN LOWER(
                        TRIM(
                            COALESCE(
                                description,
                                ''
                            )
                        )
                    ) NOT IN ('', 'nan')
                    THEN description
                END
            ) AS description,

            COALESCE(
                CASE
                    WHEN LOWER(
                        TRIM(
                            COALESCE(
                                category_ko,
                                ''
                            )
                        )
                    ) NOT IN ('', 'nan')
                    THEN category_ko
                END,

                CASE
                    WHEN LOWER(
                        TRIM(
                            COALESCE(
                                category,
                                ''
                            )
                        )
                    ) NOT IN ('', 'nan')
                    THEN category
                END
            ) AS category,

            price,

            CASE
                WHEN LOWER(
                    TRIM(
                        COALESCE(
                            brand,
                            ''
                        )
                    )
                ) NOT IN ('', 'nan')
                THEN brand
            END AS brand,

            ({score_sql}) AS score

        FROM products

        WHERE
            {required_sql}

        ORDER BY
            score DESC,
            product_id ASC

        LIMIT :limit
        """
    )

    with engine.connect() as conn:
        rows = (
            conn.execute(
                sql,
                params,
            )
            .mappings()
            .all()
        )

    results = [
        {
            "product_id":
                row["product_id"],

            "product_name":
                row["product_name"],

            "description":
                row["description"],

            "category":
                row["category"],

            "price":
                row["price"],

            "brand":
                row["brand"],

            "score":
                int(row["score"]),
        }

        for row in rows
    ]

    return keywords, results