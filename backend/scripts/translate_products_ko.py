import json
import os
import time

from dotenv import load_dotenv
from openai import OpenAI
from sqlalchemy import text

from app.db.postgres import engine


# =========================================================
# ENV / OPENAI
# =========================================================

load_dotenv()


OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


if not OPENAI_API_KEY:
    raise RuntimeError(
        "OPENAI_API_KEY가 .env에 없습니다."
    )


client = OpenAI(
    api_key=OPENAI_API_KEY,
)


# 비용을 줄이기 위해 mini 모델 사용
MODEL = "gpt-4o-mini"


# =========================================================
# SETTINGS
# =========================================================

# 테스트할 때 일부만 번역하고 싶으면
# 10, 20 등으로 변경
#
# 전체 번역:
# LIMIT = None

LIMIT = None

# 요청 사이 간격
REQUEST_DELAY = 0.15


# =========================================================
# 1. 한국어 컬럼 준비
# =========================================================

def prepare_columns():

    sql = text(
        """
        ALTER TABLE products
        ADD COLUMN IF NOT EXISTS product_name_ko TEXT;

        ALTER TABLE products
        ADD COLUMN IF NOT EXISTS description_ko TEXT;

        ALTER TABLE products
        ADD COLUMN IF NOT EXISTS category_ko TEXT;

        ALTER TABLE products
        ADD COLUMN IF NOT EXISTS search_text_ko TEXT;
        """
    )


    with engine.begin() as conn:
        conn.execute(sql)


    print()
    print("========================================")
    print("한국어 컬럼 준비 완료")
    print("========================================")
    print("product_name_ko")
    print("description_ko")
    print("category_ko")
    print("search_text_ko")
    print()


# =========================================================
# 2. 상품 불러오기
# =========================================================

def load_products():

    limit_sql = ""

    if LIMIT is not None:
        limit_sql = f"LIMIT {int(LIMIT)}"


    sql = text(
        f"""
        SELECT
            product_id,
            product_name,
            description,
            brand,
            category,

            product_name_ko,
            description_ko,
            category_ko,
            search_text_ko

        FROM products

        ORDER BY product_id

        {limit_sql}
        """
    )


    with engine.connect() as conn:

        rows = (
            conn
            .execute(sql)
            .mappings()
            .all()
        )


    return [
        dict(row)
        for row in rows
    ]


# =========================================================
# 3. 값 정리
# =========================================================

def clean_value(
    value,
) -> str:

    if value is None:
        return ""

    value = str(value).strip()

    if value.lower() in {
        "nan",
        "none",
        "null",
    }:
        return ""

    return value


# =========================================================
# 4. 번역
# =========================================================

def translate_product(
    product: dict,
) -> dict:

    product_name = clean_value(
        product.get("product_name")
    )

    description = clean_value(
        product.get("description")
    )

    category = clean_value(
        product.get("category")
    )

    brand = clean_value(
        product.get("brand")
    )


    prompt = f"""
다음은 Amazon 상품 데이터입니다.

한국 사용자가 이해하기 쉽도록
상품명, 상품 설명, 카테고리를
자연스러운 한국어로 번역하세요.

[중요 규칙]

1. 원문에 없는 정보를 추가하지 마세요.
2. 상품의 기능을 임의로 추측하지 마세요.
3. 브랜드명은 원칙적으로 원문을 유지하세요.
4. 모델명과 제품 번호는 원문을 유지하세요.
5. 고유 상품명은 필요하면 원문을 일부 유지해도 됩니다.
6. category는 자연스러운 한국어 카테고리명으로 번역하세요.
7. description이 비어 있다면 빈 문자열을 반환하세요.
8. 번역에 대한 설명은 하지 마세요.
9. 반드시 JSON 하나만 반환하세요.

[상품]

상품명:
{product_name}

브랜드:
{brand}

카테고리:
{category}

상품 설명:
{description}


다음 형식으로만 반환하세요.

{{
    "product_name_ko": "한국어 상품명",
    "description_ko": "한국어 상품 설명",
    "category_ko": "한국어 카테고리"
}}
"""


    response = client.chat.completions.create(

        model=MODEL,

        messages=[
            {
                "role": "system",
                "content": (
                    "당신은 Amazon 상품 데이터를 "
                    "한국어로 정확하게 번역하는 "
                    "전자상거래 데이터 번역기입니다."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],

        temperature=0,

        response_format={
            "type": "json_object"
        },
    )


    content = (
        response
        .choices[0]
        .message
        .content
    )


    if not content:
        raise RuntimeError(
            "OpenAI 응답이 비어 있습니다."
        )


    result = json.loads(
        content
    )


    return {
        "product_name_ko":
            clean_value(
                result.get(
                    "product_name_ko"
                )
            ),

        "description_ko":
            clean_value(
                result.get(
                    "description_ko"
                )
            ),

        "category_ko":
            clean_value(
                result.get(
                    "category_ko"
                )
            ),
    }


# =========================================================
# 5. 한국어 search_text 생성
# =========================================================

def build_search_text_ko(
    product_name_ko: str,
    description_ko: str,
    brand: str,
    category_ko: str,
) -> str:

    values = [
        product_name_ko,
        description_ko,
        brand,
        category_ko,
    ]


    values = [
        clean_value(value)
        for value in values
    ]


    values = [
        value
        for value in values
        if value
    ]


    return " ".join(values)


# =========================================================
# 6. DB 저장
# =========================================================

def save_translation(
    product_id,
    product_name_ko,
    description_ko,
    category_ko,
    search_text_ko,
):

    sql = text(
        """
        UPDATE products

        SET
            product_name_ko =
                :product_name_ko,

            description_ko =
                :description_ko,

            category_ko =
                :category_ko,

            search_text_ko =
                :search_text_ko

        WHERE product_id =
            :product_id
        """
    )


    with engine.begin() as conn:

        conn.execute(
            sql,
            {
                "product_id":
                    product_id,

                "product_name_ko":
                    product_name_ko,

                "description_ko":
                    description_ko,

                "category_ko":
                    category_ko,

                "search_text_ko":
                    search_text_ko,
            },
        )


# =========================================================
# 7. 이미 번역됐는지 확인
# =========================================================

def is_completed(
    product: dict,
) -> bool:

    product_name_ko = clean_value(
        product.get(
            "product_name_ko"
        )
    )

    category_ko = clean_value(
        product.get(
            "category_ko"
        )
    )

    search_text_ko = clean_value(
        product.get(
            "search_text_ko"
        )
    )


    # 설명 원문이 없는 상품은
    # description_ko가 없어도 정상
    original_description = clean_value(
        product.get(
            "description"
        )
    )


    description_ko = clean_value(
        product.get(
            "description_ko"
        )
    )


    description_ok = (
        not original_description
        or bool(description_ko)
    )


    return (
        bool(product_name_ko)
        and
        bool(category_ko)
        and
        bool(search_text_ko)
        and
        description_ok
    )


# =========================================================
# 8. 현재 번역 현황
# =========================================================

def print_database_status():

    sql = text(
        """
        SELECT

            COUNT(*) AS total,

            COUNT(*) FILTER (
                WHERE
                    product_name_ko IS NOT NULL
                    AND TRIM(product_name_ko) <> ''
            ) AS translated_name,

            COUNT(*) FILTER (
                WHERE
                    category_ko IS NOT NULL
                    AND TRIM(category_ko) <> ''
            ) AS translated_category,

            COUNT(*) FILTER (
                WHERE
                    search_text_ko IS NOT NULL
                    AND TRIM(search_text_ko) <> ''
            ) AS search_text_ready

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
    print("========================================")
    print("현재 DB 상태")
    print("========================================")

    print(
        f"전체 상품          : "
        f"{result['total']:,}"
    )

    print(
        f"상품명 번역        : "
        f"{result['translated_name']:,}"
    )

    print(
        f"카테고리 번역      : "
        f"{result['translated_category']:,}"
    )

    print(
        f"한국어 검색문 준비 : "
        f"{result['search_text_ready']:,}"
    )

    print("========================================")
    print()


# =========================================================
# 9. MAIN
# =========================================================

def main():

    print()
    print("========================================")
    print("AMAZON PRODUCT KOREAN TRANSLATOR")
    print("========================================")


    # -----------------------------------------------------
    # 컬럼 자동 생성
    # -----------------------------------------------------

    prepare_columns()


    # -----------------------------------------------------
    # 상품 불러오기
    # -----------------------------------------------------

    products = load_products()

    total = len(products)


    print(
        f"처리 대상 상품: {total:,}개"
    )

    print()


    success_count = 0
    skip_count = 0
    error_count = 0


    # -----------------------------------------------------
    # 상품 처리
    # -----------------------------------------------------

    for index, product in enumerate(
        products,
        start=1,
    ):

        product_id = (
            product.get(
                "product_id"
            )
        )

        product_name = clean_value(
            product.get(
                "product_name"
            )
        )


        percent = (
            index /
            total *
            100
        )


        print(
            f"[{index}/{total}] "
            f"{percent:6.2f}% "
            f"{product_name[:55]}"
        )


        # -------------------------------------------------
        # 이미 번역 완료
        # -------------------------------------------------

        if is_completed(product):

            skip_count += 1

            print(
                "    → 이미 완료됨 / SKIP"
            )

            continue


        try:

            # ---------------------------------------------
            # 번역
            # ---------------------------------------------

            translated = (
                translate_product(
                    product
                )
            )


            product_name_ko = (
                translated[
                    "product_name_ko"
                ]
            )

            description_ko = (
                translated[
                    "description_ko"
                ]
            )

            category_ko = (
                translated[
                    "category_ko"
                ]
            )


            # ---------------------------------------------
            # search_text_ko
            # ---------------------------------------------

            search_text_ko = (
                build_search_text_ko(
                    product_name_ko=
                        product_name_ko,

                    description_ko=
                        description_ko,

                    brand=
                        clean_value(
                            product.get(
                                "brand"
                            )
                        ),

                    category_ko=
                        category_ko,
                )
            )


            # ---------------------------------------------
            # DB 저장
            # ---------------------------------------------

            save_translation(
                product_id=
                    product_id,

                product_name_ko=
                    product_name_ko,

                description_ko=
                    description_ko,

                category_ko=
                    category_ko,

                search_text_ko=
                    search_text_ko,
            )


            success_count += 1


            print(
                f"    → {product_name_ko[:55]}"
            )

            print(
                f"    → 카테고리: "
                f"{category_ko}"
            )

            print(
                "    → DB 저장 완료"
            )


        except Exception as error:

            error_count += 1

            print(
                f"    → ERROR: {error}"
            )


            # 실패한 상품은 저장하지 않음.
            # 다음 실행 때 자동으로 다시 시도됩니다.

            time.sleep(2)

            continue


        time.sleep(
            REQUEST_DELAY
        )


    # =====================================================
    # SUMMARY
    # =====================================================

    print()
    print("========================================")
    print("번역 작업 종료")
    print("========================================")

    print(
        f"신규 완료 : "
        f"{success_count:,}"
    )

    print(
        f"SKIP      : "
        f"{skip_count:,}"
    )

    print(
        f"ERROR     : "
        f"{error_count:,}"
    )


    print_database_status()


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":
    main()