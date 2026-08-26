from pathlib import Path

import pandas as pd
from sqlalchemy import text

from app.db.postgres import engine


DATA_DIR = Path(__file__).resolve().parent.parent / "data"

PRODUCTS_PATH = DATA_DIR / "products_clean.csv"
REVIEWS_PATH = DATA_DIR / "reviews_clean.csv"


def load_products():
    products = pd.read_csv(PRODUCTS_PATH)

    products = products.where(
        pd.notnull(products),
        None
    )

    records = products.to_dict(
        orient="records"
    )

    sql = text(
        """
        INSERT INTO products (
            product_id,
            product_name,
            description,
            category,
            price,
            brand,
            search_text
        )
        VALUES (
            :product_id,
            :product_name,
            :description,
            :category,
            :price,
            :brand,
            :search_text
        )
        ON CONFLICT (product_id)
        DO UPDATE SET
            product_name = EXCLUDED.product_name,
            description = EXCLUDED.description,
            category = EXCLUDED.category,
            price = EXCLUDED.price,
            brand = EXCLUDED.brand,
            search_text = EXCLUDED.search_text;
        """
    )

    with engine.begin() as conn:
        conn.execute(sql, records)

    print(
        f"상품 {len(records):,}개 적재 완료"
    )


def load_reviews():
    reviews = pd.read_csv(REVIEWS_PATH)

    reviews = reviews.where(
        pd.notnull(reviews),
        None
    )

    records = reviews.to_dict(
        orient="records"
    )

    # 다시 실행했을 때 리뷰가 중복으로 쌓이지 않도록
    # 현재 실습 단계에서는 기존 리뷰를 비우고 재적재
    with engine.begin() as conn:
        conn.execute(
            text("TRUNCATE TABLE reviews RESTART IDENTITY;")
        )

        conn.execute(
            text(
                """
                INSERT INTO reviews (
                    user_id,
                    product_id,
                    rating,
                    review_text
                )
                VALUES (
                    :user_id,
                    :product_id,
                    :rating,
                    :review_text
                );
                """
            ),
            records,
        )

    print(
        f"리뷰 {len(records):,}개 적재 완료"
    )


def check_counts():
    with engine.connect() as conn:

        product_count = conn.execute(
            text(
                "SELECT COUNT(*) FROM products"
            )
        ).scalar()

        review_count = conn.execute(
            text(
                "SELECT COUNT(*) FROM reviews"
            )
        ).scalar()

    print()
    print("====================")
    print("DB 적재 결과")
    print("====================")
    print(
        f"products : {product_count:,}"
    )
    print(
        f"reviews  : {review_count:,}"
    )


if __name__ == "__main__":
    load_products()
    load_reviews()
    check_counts()
