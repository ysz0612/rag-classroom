import os
import time

from dotenv import load_dotenv
from openai import OpenAI
from sqlalchemy import text

from app.db.postgres import engine


# =========================================================
# ENV
# =========================================================

load_dotenv()


OPENAI_API_KEY = os.getenv(
    "OPENAI_API_KEY"
)


if not OPENAI_API_KEY:
    raise RuntimeError(
        "OPENAI_API_KEY가 .env에 없습니다."
    )


client = OpenAI(
    api_key=OPENAI_API_KEY
)


# =========================================================
# SETTINGS
# =========================================================

EMBEDDING_MODEL = (
    "text-embedding-3-small"
)


# 한 번의 API 요청으로 처리할 상품 수
BATCH_SIZE = 50


# =========================================================
# 한국어 상품 데이터 조회
# =========================================================

def get_products():

    sql = text(
        """
        SELECT
            product_id,
            product_name,
            product_name_ko,
            category_ko,
            search_text_ko

        FROM products

        WHERE
            search_text_ko IS NOT NULL

            AND TRIM(
                search_text_ko
            ) <> ''

        ORDER BY product_id
        """
    )


    with engine.connect() as conn:

        rows = (
            conn
            .execute(sql)
            .mappings()
            .all()
        )


    return rows


# =========================================================
# 번역 상태 확인
# =========================================================

def check_korean_data():

    sql = text(
        """
        SELECT

            COUNT(*) AS total,

            COUNT(*) FILTER (
                WHERE
                    search_text_ko
                    IS NOT NULL

                    AND TRIM(
                        search_text_ko
                    ) <> ''
            ) AS korean_ready

        FROM products
        """
    )


    with engine.connect() as conn:

        result = (
            conn
            .execute(sql)
            .mappings()
            .one()
        )


    total = int(
        result["total"]
    )

    korean_ready = int(
        result["korean_ready"]
    )


    print()
    print(
        "=============================="
    )

    print(
        "한국어 상품 데이터 확인"
    )

    print(
        "=============================="
    )

    print(
        f"전체 상품       : "
        f"{total}개"
    )

    print(
        f"한국어 검색문   : "
        f"{korean_ready}개"
    )

    print(
        "=============================="
    )


    if korean_ready != total:

        raise RuntimeError(
            "아직 search_text_ko가 "
            "없는 상품이 있습니다. "
            "번역 작업부터 완료해주세요."
        )


# =========================================================
# Embedding 생성
# =========================================================

def create_embeddings(
    texts: list[str],
) -> list[list[float]]:

    response = (
        client.embeddings.create(
            model=
                EMBEDDING_MODEL,

            input=
                texts,
        )
    )


    return [
        item.embedding
        for item
        in response.data
    ]


# =========================================================
# Embedding 저장
# =========================================================

def save_embeddings(
    products,
    embeddings,
):

    sql = text(
        """
        UPDATE products

        SET embedding = CAST(
            :embedding AS vector
        )

        WHERE product_id =
            :product_id
        """
    )


    values = []


    for (
        product,
        embedding,
    ) in zip(
        products,
        embeddings,
    ):

        embedding_string = (
            "["
            +
            ",".join(
                str(value)
                for value
                in embedding
            )
            +
            "]"
        )


        values.append(
            {
                "product_id":
                    product[
                        "product_id"
                    ],

                "embedding":
                    embedding_string,
            }
        )


    with engine.begin() as conn:

        conn.execute(
            sql,
            values,
        )


# =========================================================
# 결과 확인
# =========================================================

def show_status():

    sql = text(
        """
        SELECT

            COUNT(*) AS total,

            COUNT(*) FILTER (
                WHERE
                    embedding IS NOT NULL
            ) AS embedded,

            COUNT(*) FILTER (
                WHERE
                    search_text_ko
                    IS NOT NULL

                    AND TRIM(
                        search_text_ko
                    ) <> ''
            ) AS korean_ready

        FROM products
        """
    )


    with engine.connect() as conn:

        result = (
            conn
            .execute(sql)
            .mappings()
            .one()
        )


    print()
    print(
        "=============================="
    )

    print(
        "한국어 Product Embedding 현황"
    )

    print(
        "=============================="
    )

    print(
        f"전체 상품     : "
        f"{result['total']}개"
    )

    print(
        f"한국어 데이터 : "
        f"{result['korean_ready']}개"
    )

    print(
        f"Embedding    : "
        f"{result['embedded']}개"
    )

    print(
        "=============================="
    )


# =========================================================
# MAIN
# =========================================================

def main():

    print()
    print(
        "===================================="
    )

    print(
        "KOREAN PRODUCT EMBEDDING"
    )

    print(
        "===================================="
    )

    print(
        f"Model      : "
        f"{EMBEDDING_MODEL}"
    )

    print(
        f"Batch Size : "
        f"{BATCH_SIZE}"
    )

    print(
        "Source     : "
        "products.search_text_ko"
    )

    print(
        "Target     : "
        "products.embedding"
    )

    print(
        "===================================="
    )


    # -----------------------------------------------------
    # 번역 완료 여부 확인
    # -----------------------------------------------------

    check_korean_data()


    # -----------------------------------------------------
    # 상품 조회
    # -----------------------------------------------------

    products = get_products()

    total = len(products)


    if total == 0:

        print(
            "임베딩할 상품이 없습니다."
        )

        return


    print()
    print(
        f"이번 재임베딩 대상: "
        f"{total}개"
    )

    print(
        "기존 embedding은 "
        "한국어 기준으로 덮어씁니다."
    )

    print()


    completed = 0
    failed = 0


    total_batches = (
        total +
        BATCH_SIZE -
        1
    ) // BATCH_SIZE


    # -----------------------------------------------------
    # Batch 처리
    # -----------------------------------------------------

    for start in range(
        0,
        total,
        BATCH_SIZE,
    ):

        batch = products[
            start:
            start + BATCH_SIZE
        ]


        texts = [
            product[
                "search_text_ko"
            ]

            for product
            in batch
        ]


        batch_number = (
            start //
            BATCH_SIZE
        ) + 1


        print(
            f"[Batch "
            f"{batch_number}/"
            f"{total_batches}] "
            f"{len(batch)}개 처리 중..."
        )


        try:

            embeddings = (
                create_embeddings(
                    texts
                )
            )


            save_embeddings(
                products=batch,
                embeddings=embeddings,
            )


            completed += len(batch)


            percent = (
                completed /
                total *
                100
            )


            print(
                f"    저장 완료 "
                f"{completed}/{total} "
                f"({percent:.1f}%)"
            )


        except Exception as error:

            failed += len(batch)


            print(
                f"    ERROR → "
                f"{error}"
            )

            print(
                "    해당 Batch는 "
                "저장하지 않았습니다."
            )


        time.sleep(0.2)


    # -----------------------------------------------------
    # 결과
    # -----------------------------------------------------

    show_status()


    print()
    print(
        "===================================="
    )

    print(
        "한국어 Product Embedding 작업 종료"
    )

    print(
        "===================================="
    )

    print(
        f"이번 실행 성공 : "
        f"{completed}개"
    )

    print(
        f"실패            : "
        f"{failed}개"
    )

    print(
        "===================================="
    )


if __name__ == "__main__":
    main()