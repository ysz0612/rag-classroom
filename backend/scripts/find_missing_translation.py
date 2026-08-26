from sqlalchemy import text

from app.db.postgres import engine


def main():

    sql = text("""
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

        WHERE
            search_text_ko IS NULL
            OR TRIM(search_text_ko) = ''

        ORDER BY product_id
    """)

    with engine.connect() as conn:

        products = (
            conn
            .execute(sql)
            .mappings()
            .all()
        )

    print()
    print("=" * 70)
    print("한국어 검색문 누락 상품")
    print("=" * 70)

    print(
        f"누락 상품 수: {len(products)}개"
    )

    print()

    for index, product in enumerate(
        products,
        start=1,
    ):

        print(
            f"[{index}]"
        )

        print(
            "product_id:",
            product["product_id"],
        )

        print(
            "product_name:",
            product["product_name"],
        )

        print(
            "description:",
            product["description"],
        )

        print(
            "brand:",
            product["brand"],
        )

        print(
            "category:",
            product["category"],
        )

        print(
            "product_name_ko:",
            product["product_name_ko"],
        )

        print(
            "description_ko:",
            product["description_ko"],
        )

        print(
            "category_ko:",
            product["category_ko"],
        )

        print(
            "search_text_ko:",
            product["search_text_ko"],
        )

        print("-" * 70)


if __name__ == "__main__":
    main()