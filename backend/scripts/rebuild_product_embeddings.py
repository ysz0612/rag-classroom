import os
import time

from dotenv import load_dotenv
from openai import OpenAI
from sqlalchemy import text

from app.db.postgres import engine


load_dotenv()


client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

EMBEDDING_MODEL = "text-embedding-3-small"


# ==========================================
# 1. search_text 재생성
# ==========================================

def rebuild_search_text():

    sql = text("""
        UPDATE products

        SET search_text =
            CONCAT_WS(
                ' ',
                NULLIF(product_name, ''),
                NULLIF(description, ''),
                NULLIF(brand, ''),
                NULLIF(inferred_category, '')
            );
    """)

    with engine.begin() as conn:
        result = conn.execute(sql)

    print(
        f"search_text 갱신 완료: "
        f"{result.rowcount}개"
    )


# ==========================================
# 2. 기존 상품 embedding 초기화
# ==========================================

def clear_embeddings():

    sql = text("""
        UPDATE products
        SET embedding = NULL;
    """)

    with engine.begin() as conn:
        result = conn.execute(sql)

    print(
        f"기존 embedding 초기화 완료: "
        f"{result.rowcount}개"
    )


# ==========================================
# 3. embedding 없는 상품 조회
# ==========================================

def get_products_without_embedding():

    sql = text("""
        SELECT
            product_id,
            product_name,
            inferred_category,
            search_text

        FROM products

        WHERE embedding IS NULL

        ORDER BY product_id;
    """)

    with engine.connect() as conn:
        return conn.execute(
            sql
        ).mappings().all()


# ==========================================
# 4. OpenAI Embedding 생성
# ==========================================

def create_embedding(
    search_text: str,
):

    response = client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=search_text,
    )

    return (
        response
        .data[0]
        .embedding
    )


# ==========================================
# 5. PostgreSQL 저장
# ==========================================

def save_embedding(
    product_id: str,
    embedding: list[float],
):

    # pgvector가 이해할 수 있는 문자열 형태
    vector_string = (
        "["
        + ",".join(
            str(value)
            for value in embedding
        )
        + "]"
    )

    sql = text("""
        UPDATE products

        SET embedding = CAST(
            :embedding AS vector
        )

        WHERE product_id = :product_id;
    """)

    with engine.begin() as conn:
        conn.execute(
            sql,
            {
                "product_id": product_id,
                "embedding": vector_string,
            },
        )


# ==========================================
# 6. 결과 확인
# ==========================================

def show_result():

    sql = text("""
        SELECT
            COUNT(*) AS total,

            COUNT(embedding)
                AS embedded,

            COUNT(*) FILTER (
                WHERE embedding IS NULL
            ) AS missing

        FROM products;
    """)

    with engine.connect() as conn:
        result = conn.execute(
            sql
        ).mappings().first()

    print()
    print("=" * 60)
    print("상품 Embedding 결과")
    print("=" * 60)

    print(
        f"전체 상품 : {result['total']}"
    )

    print(
        f"Embedding : {result['embedded']}"
    )

    print(
        f"미완료    : {result['missing']}"
    )


# ==========================================
# 실행
# ==========================================

def main():

    print()
    print("=" * 60)
    print("Product Embedding 재생성")
    print("=" * 60)

    print(
        f"Embedding Model: "
        f"{EMBEDDING_MODEL}"
    )

    print()

    # --------------------------------------
    # search_text 갱신
    # --------------------------------------

    rebuild_search_text()

    # --------------------------------------
    # 기존 embedding 제거
    # --------------------------------------

    clear_embeddings()

    # --------------------------------------
    # 상품 조회
    # --------------------------------------

    products = (
        get_products_without_embedding()
    )

    total = len(products)

    print()
    print(
        f"Embedding 대상: {total}개"
    )
    print()

    success = 0
    failed = 0

    for index, product in enumerate(
        products,
        start=1,
    ):

        product_name = (
            product["product_name"]
            or "상품명 없음"
        )

        category = (
            product["inferred_category"]
            or "카테고리 없음"
        )

        print(
            f"[{index}/{total}] "
            f"{product_name[:60]}"
        )

        print(
            f"    category → {category}"
        )

        try:

            search_text = (
                product["search_text"]
                or product_name
            )

            embedding = create_embedding(
                search_text
            )

            save_embedding(
                product_id=product[
                    "product_id"
                ],
                embedding=embedding,
            )

            success += 1

            print(
                "    → embedding 완료"
            )

        except Exception as e:

            failed += 1

            print(
                f"    ERROR → {e}"
            )

        time.sleep(0.05)

    print()
    print("=" * 60)

    print(
        f"성공: {success}"
    )

    print(
        f"실패: {failed}"
    )

    show_result()


if __name__ == "__main__":
    main()