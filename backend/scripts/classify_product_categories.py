import json
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

MODEL = "gpt-4o-mini"


# ==========================================
# 고정 카테고리
# ==========================================

CATEGORIES = [
    "Hair Care",
    "Hair Extensions & Wigs",
    "Hair Accessories",
    "Skin Care",
    "Makeup",
    "Nail Care",
    "Bath & Body",
    "Fragrance",
    "Sun Care",
    "Beauty Tools",
    "Personal Care",
    "Fashion / Costume Accessories",
    "Household & Product Care",
    "Other",
]


# ==========================================
# 컬럼 준비
# ==========================================

def prepare_columns():

    sql = text("""
        ALTER TABLE products
        ADD COLUMN IF NOT EXISTS
            inferred_category TEXT;

        ALTER TABLE products
        ADD COLUMN IF NOT EXISTS
            category_confidence TEXT;
    """)

    with engine.begin() as conn:
        conn.execute(sql)

    print("카테고리 컬럼 준비 완료")


# ==========================================
# 아직 분류하지 않은 상품
# ==========================================

def get_products():

    sql = text("""
        SELECT
            product_id,
            product_name,
            description,
            brand,
            search_text

        FROM products

        WHERE inferred_category IS NULL

        ORDER BY product_id;
    """)

    with engine.connect() as conn:
        return conn.execute(
            sql
        ).mappings().all()


# ==========================================
# AI 카테고리 분류
# ==========================================

def classify_product(product):

    categories = "\n".join(
        f"- {category}"
        for category in CATEGORIES
    )

    response = client.chat.completions.create(
        model=MODEL,

        messages=[
            {
                "role": "system",
                "content": (
                    "당신은 Amazon 상품 분류기입니다. "
                    "반드시 제공된 카테고리 중 "
                    "하나만 선택하세요. "
                    "새로운 카테고리를 만들면 안 됩니다."
                ),
            },
            {
                "role": "user",
                "content": f"""
다음 상품을 분류하세요.

[허용 카테고리]

{categories}

[상품 정보]

상품명:
{product["product_name"]}

브랜드:
{product["brand"]}

상품 설명:
{product["description"]}

검색용 텍스트:
{product["search_text"]}

반드시 다음 JSON 형식으로만 응답하세요.

{{
    "category": "Hair Care",
    "confidence": "high"
}}

confidence는
high, medium, low
중 하나만 사용하세요.
""",
            },
        ],

        response_format={
            "type": "json_object"
        },

        temperature=0,
    )

    content = (
        response
        .choices[0]
        .message
        .content
    )

    result = json.loads(content)

    category = result.get(
        "category",
        "Other",
    )

    confidence = result.get(
        "confidence",
        "low",
    )

    # ======================================
    # AI 출력 검증
    # ======================================

    if category not in CATEGORIES:
        category = "Other"
        confidence = "low"

    if confidence not in {
        "high",
        "medium",
        "low",
    }:
        confidence = "low"

    return category, confidence


# ==========================================
# DB 저장
# ==========================================

def save_result(
    product_id,
    category,
    confidence,
):

    sql = text("""
        UPDATE products

        SET
            inferred_category = :category,
            category_confidence = :confidence

        WHERE product_id = :product_id;
    """)

    with engine.begin() as conn:
        conn.execute(
            sql,
            {
                "product_id": product_id,
                "category": category,
                "confidence": confidence,
            },
        )


# ==========================================
# 결과 통계
# ==========================================

def show_statistics():

    sql = text("""
        SELECT
            inferred_category,
            category_confidence,
            COUNT(*) AS count

        FROM products

        WHERE inferred_category IS NOT NULL

        GROUP BY
            inferred_category,
            category_confidence

        ORDER BY
            inferred_category,
            category_confidence;
    """)

    with engine.connect() as conn:
        rows = conn.execute(
            sql
        ).mappings().all()

    print()
    print("=" * 60)
    print("AI 상품 카테고리 분류 결과")
    print("=" * 60)

    for row in rows:

        print(
            f"{row['inferred_category']:<32}"
            f"{row['category_confidence']:<10}"
            f"{row['count']}"
        )


# ==========================================
# 실행
# ==========================================

def main():

    prepare_columns()

    products = get_products()

    total = len(products)

    print()
    print("=" * 60)
    print("Amazon 상품 AI 카테고리 분류")
    print("=" * 60)

    print(f"모델: {MODEL}")
    print(f"분류 대상: {total}개")
    print()

    if total == 0:

        print(
            "새로 분류할 상품이 없습니다."
        )

        show_statistics()

        return

    success = 0
    failed = 0

    for index, product in enumerate(
        products,
        start=1,
    ):

        name = (
            product["product_name"]
            or "상품명 없음"
        )

        print(
            f"[{index}/{total}] "
            f"{name[:70]}"
        )

        try:

            category, confidence = (
                classify_product(
                    product
                )
            )

            save_result(
                product_id=product[
                    "product_id"
                ],
                category=category,
                confidence=confidence,
            )

            success += 1

            print(
                f"    → {category} "
                f"[{confidence}]"
            )

        except Exception as e:

            failed += 1

            print(
                f"    ERROR → {e}"
            )

        # API에 지나치게 빠른 연속 요청 방지
        time.sleep(0.1)

    print()
    print("=" * 60)

    print(
        f"성공: {success}"
    )

    print(
        f"실패: {failed}"
    )

    show_statistics()


if __name__ == "__main__":
    main()