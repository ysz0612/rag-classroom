import os

from dotenv import load_dotenv
from openai import OpenAI
from sqlalchemy import text

from app.db.postgres import engine


load_dotenv()


client = OpenAI(
    api_key=os.getenv(
        "OPENAI_API_KEY"
    )
)


EMBEDDING_MODEL = (
    "text-embedding-3-small"
)


# ==========================================
# 질문 Embedding 생성
# ==========================================

def create_query_embedding(
    question: str,
) -> list[float]:
    response = (
        client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=question,
        )
    )

    return (
        response
        .data[0]
        .embedding
    )


# ==========================================
# pgvector 문자열 변환
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
# 상품 Vector 검색
# ==========================================

def search_products_vector(
    question: str,
    limit: int = 5,
    min_similarity: float = 0.34,
):
    query_embedding = (
        create_query_embedding(
            question
        )
    )

    embedding_string = (
        embedding_to_string(
            query_embedding
        )
    )

    sql = text(
        """
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

            (
                1 - (
                    embedding
                    <=>
                    CAST(
                        :embedding AS vector
                    )
                )
            ) AS similarity

        FROM products

        WHERE
            embedding IS NOT NULL

            AND (
                1 - (
                    embedding
                    <=>
                    CAST(
                        :embedding AS vector
                    )
                )
            ) >= :min_similarity

        ORDER BY
            embedding
            <=>
            CAST(
                :embedding AS vector
            )

        LIMIT :limit
        """
    )

    with engine.connect() as conn:
        rows = (
            conn.execute(
                sql,
                {
                    "embedding":
                        embedding_string,

                    "limit":
                        limit,

                    "min_similarity":
                        min_similarity,
                },
            )
            .mappings()
            .all()
        )

    return [
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

            "similarity":
                round(
                    float(
                        row["similarity"]
                    ),
                    4,
                ),
        }

        for row in rows
    ]