import os

from dotenv import load_dotenv
from neo4j import GraphDatabase
from sqlalchemy import text

from app.db.postgres import engine


# =========================================================
# ENV
# =========================================================

load_dotenv()


NEO4J_URI = os.getenv(
    "NEO4J_URI",
    "bolt://localhost:7687",
)

NEO4J_USER = os.getenv(
    "NEO4J_USER",
    "neo4j",
)

NEO4J_PASSWORD = os.getenv(
    "NEO4J_PASSWORD",
    "rag12345",
)


driver = GraphDatabase.driver(
    NEO4J_URI,
    auth=(
        NEO4J_USER,
        NEO4J_PASSWORD,
    ),
)


# =========================================================
# PostgreSQL - Products
# =========================================================

def get_products():

    sql = text(
        """
        SELECT
            product_id,

            product_name,
            product_name_ko,

            description,
            description_ko,

            brand,

            category,
            category_ko,

            price,

            search_text,
            search_text_ko

        FROM products

        WHERE
            product_id IS NOT NULL

        ORDER BY product_id
        """
    )


    with engine.connect() as conn:

        return (
            conn
            .execute(sql)
            .mappings()
            .all()
        )


# =========================================================
# PostgreSQL - Reviews
# =========================================================

def get_reviews():

    sql = text(
        """
        SELECT
            id AS review_id,
            user_id,
            product_id,
            rating,
            review_text

        FROM reviews

        WHERE
            user_id IS NOT NULL
            AND product_id IS NOT NULL

        ORDER BY id
        """
    )


    with engine.connect() as conn:

        return (
            conn
            .execute(sql)
            .mappings()
            .all()
        )


# =========================================================
# Neo4j 연결 확인
# =========================================================

def check_connection():

    driver.verify_connectivity()

    print(
        "Neo4j 연결 확인 완료"
    )


# =========================================================
# 기존 Graph 삭제
# =========================================================

def clear_graph():

    print()
    print(
        "기존 Neo4j Graph 삭제 중..."
    )


    with driver.session() as session:

        session.run(
            """
            MATCH (n)
            DETACH DELETE n
            """
        )


    print(
        "기존 Graph 삭제 완료"
    )


# =========================================================
# Constraint
# =========================================================

def create_constraints():

    queries = [

        """
        CREATE CONSTRAINT user_id_unique
        IF NOT EXISTS
        FOR (u:User)
        REQUIRE u.user_id IS UNIQUE
        """,

        """
        CREATE CONSTRAINT product_id_unique
        IF NOT EXISTS
        FOR (p:Product)
        REQUIRE p.product_id IS UNIQUE
        """,

        """
        CREATE CONSTRAINT brand_name_unique
        IF NOT EXISTS
        FOR (b:Brand)
        REQUIRE b.name IS UNIQUE
        """,

        """
        CREATE CONSTRAINT category_name_unique
        IF NOT EXISTS
        FOR (c:Category)
        REQUIRE c.name IS UNIQUE
        """,
    ]


    with driver.session() as session:

        for query in queries:
            session.run(query)


    print(
        "Neo4j Constraint 확인 완료"
    )


# =========================================================
# Product / Brand / Category 생성
# =========================================================

def create_products(
    products,
):

    query = """
    UNWIND $rows AS row


    // ====================================================
    // PRODUCT
    // ====================================================

    MERGE (p:Product {
        product_id: row.product_id
    })

    SET
        p.name = row.product_name_ko,

        p.product_name =
            row.product_name_ko,

        p.product_name_ko =
            row.product_name_ko,

        p.product_name_en =
            row.product_name,

        p.description =
            row.description_ko,

        p.description_ko =
            row.description_ko,

        p.description_en =
            row.description,

        p.price =
            row.price,

        p.search_text =
            row.search_text_ko,

        p.search_text_ko =
            row.search_text_ko


    // ====================================================
    // BRAND
    // ====================================================

    FOREACH (
        _ IN CASE

            WHEN
                row.brand IS NOT NULL
                AND trim(row.brand) <> ''

            THEN [1]

            ELSE []

        END |

        MERGE (b:Brand {
            name: row.brand
        })

        MERGE
            (p)-[:MADE_BY]->(b)
    )


    // ====================================================
    // CATEGORY
    // ====================================================

    FOREACH (
        _ IN CASE

            WHEN
                row.category_ko IS NOT NULL
                AND trim(row.category_ko) <> ''

            THEN [1]

            ELSE []

        END |

        MERGE (c:Category {
            name: row.category_ko
        })

        ON CREATE SET
            c.name_ko =
                row.category_ko,

            c.name_en =
                row.category

        SET
            c.name_ko =
                row.category_ko

        MERGE
            (p)-[:BELONGS_TO]->(c)
    )
    """


    batch_size = 200

    total = len(products)


    with driver.session() as session:

        for start in range(
            0,
            total,
            batch_size,
        ):

            batch = products[
                start:
                start + batch_size
            ]


            values = [
                dict(row)
                for row
                in batch
            ]


            session.run(
                query,
                rows=values,
            ).consume()


            end = min(
                start + batch_size,
                total,
            )


            print(
                f"Product Graph 저장: "
                f"{end}/{total}"
            )


def create_reviews(
    reviews,
):

    query = """
    UNWIND $rows AS row


    // ====================================================
    // USER
    // ====================================================

    MERGE (u:User {
        user_id: row.user_id
    })


    // MERGE → MATCH 사이에는 WITH 필요
    WITH
        row,
        u


    // ====================================================
    // PRODUCT
    // ====================================================

    MATCH (p:Product {
        product_id: row.product_id
    })


    // ====================================================
    // REVIEW
    // ====================================================

    MERGE (u)-[r:REVIEWED {
        review_id: row.review_id
    }]->(p)

    SET
        r.rating =
            row.rating,

        r.review_text =
            row.review_text
    """


    batch_size = 500

    total = len(reviews)


    with driver.session() as session:

        for start in range(
            0,
            total,
            batch_size,
        ):

            batch = reviews[
                start:
                start + batch_size
            ]


            values = [
                dict(row)
                for row
                in batch
            ]


            session.run(
                query,
                rows=values,
            ).consume()


            end = min(
                start + batch_size,
                total,
            )


            print(
                f"Review Graph 저장: "
                f"{end}/{total}"
            )


# =========================================================
# Node 결과 확인
# =========================================================

def show_nodes():

    query = """
    MATCH (n)

    RETURN
        labels(n)[0] AS type,
        count(n) AS count

    ORDER BY type
    """


    print()
    print(
        "===================================="
    )

    print(
        "Neo4j NODE"
    )

    print(
        "===================================="
    )


    with driver.session() as session:

        results = session.run(
            query
        )


        for record in results:

            print(
                f"{record['type']:<12} "
                f": {record['count']}"
            )


# =========================================================
# Relationship 결과 확인
# =========================================================

def show_relationships():

    query = """
    MATCH ()-[r]->()

    RETURN
        type(r) AS type,
        count(r) AS count

    ORDER BY type
    """


    print()
    print(
        "===================================="
    )

    print(
        "Neo4j RELATIONSHIP"
    )

    print(
        "===================================="
    )


    with driver.session() as session:

        results = session.run(
            query
        )


        for record in results:

            print(
                f"{record['type']:<12} "
                f": {record['count']}"
            )


# =========================================================
# Category 확인
# =========================================================

def show_categories():

    query = """
    MATCH (c:Category)

    OPTIONAL MATCH
        (p:Product)
        -[:BELONGS_TO]->
        (c)

    RETURN
        c.name AS category,
        count(p) AS products

    ORDER BY
        products DESC,
        category

    LIMIT 30
    """


    print()
    print(
        "===================================="
    )

    print(
        "CATEGORY 확인"
    )

    print(
        "===================================="
    )


    with driver.session() as session:

        results = session.run(
            query
        )


        for record in results:

            print(
                f"{record['category']:<25} "
                f"{record['products']}개"
            )


# =========================================================
# NaN Category 확인
# =========================================================

def check_bad_categories():

    query = """
    MATCH (c:Category)

    WHERE
        c.name IS NULL

        OR trim(c.name) = ''

        OR toLower(
            trim(c.name)
        ) = 'nan'

    RETURN count(c) AS count
    """


    with driver.session() as session:

        result = (
            session
            .run(query)
            .single()
        )


    count = result[
        "count"
    ]


    print()
    print(
        "===================================="
    )

    print(
        f"잘못된 Category : {count}개"
    )

    print(
        "===================================="
    )


    if count > 0:

        raise RuntimeError(
            "Neo4j에 잘못된 "
            "Category가 존재합니다."
        )


# =========================================================
# Product 수 검증
# =========================================================

def check_product_count(
    expected_count: int,
):

    query = """
    MATCH (p:Product)

    RETURN
        count(p) AS count
    """


    with driver.session() as session:

        result = (
            session
            .run(query)
            .single()
        )


    neo4j_count = int(
        result["count"]
    )


    print()
    print(
        "===================================="
    )

    print(
        "PRODUCT 검증"
    )

    print(
        "===================================="
    )

    print(
        f"PostgreSQL : "
        f"{expected_count}개"
    )

    print(
        f"Neo4j      : "
        f"{neo4j_count}개"
    )


    if neo4j_count != expected_count:

        raise RuntimeError(
            "PostgreSQL과 Neo4j의 "
            "Product 수가 다릅니다."
        )


    print(
        "Product 수 일치"
    )


# =========================================================
# 샘플 확인
# =========================================================

def show_sample():

    query = """
    MATCH
        (p:Product)
        -[:BELONGS_TO]->
        (c:Category)

    OPTIONAL MATCH
        (p)-[:MADE_BY]->
        (b:Brand)

    RETURN
        p.product_id AS product_id,
        p.product_name AS product,
        c.name AS category,
        b.name AS brand

    LIMIT 10
    """


    print()
    print(
        "===================================="
    )

    print(
        "GRAPH SAMPLE"
    )

    print(
        "===================================="
    )


    with driver.session() as session:

        results = session.run(
            query
        )


        for record in results:

            print()
            print(
                "상품:",
                record[
                    "product"
                ],
            )

            print(
                "카테고리:",
                record[
                    "category"
                ],
            )

            print(
                "브랜드:",
                record[
                    "brand"
                ],
            )


# =========================================================
# MAIN
# =========================================================

def main():

    try:

        print()
        print(
            "===================================="
        )

        print(
            "KOREAN AMAZON → NEO4J"
        )

        print(
            "===================================="
        )


        # -------------------------------------------------
        # 연결
        # -------------------------------------------------

        check_connection()


        # -------------------------------------------------
        # PostgreSQL
        # -------------------------------------------------

        products = get_products()

        reviews = get_reviews()


        print()
        print(
            f"PostgreSQL Products : "
            f"{len(products)}개"
        )

        print(
            f"PostgreSQL Reviews  : "
            f"{len(reviews)}개"
        )


        # -------------------------------------------------
        # Neo4j 초기화
        # -------------------------------------------------

        clear_graph()

        create_constraints()


        # -------------------------------------------------
        # Graph 생성
        # -------------------------------------------------

        print()
        print(
            "Product / Category / Brand "
            "생성 시작"
        )

        create_products(
            products
        )


        print()
        print(
            "User / Review 관계 "
            "생성 시작"
        )

        create_reviews(
            reviews
        )


        # -------------------------------------------------
        # 검증
        # -------------------------------------------------

        check_product_count(
            len(products)
        )

        check_bad_categories()

        show_nodes()

        show_relationships()

        show_categories()

        show_sample()


        print()
        print(
            "===================================="
        )

        print(
            "Neo4j Graph 재구축 완료"
        )

        print(
            "===================================="
        )


    finally:

        driver.close()


if __name__ == "__main__":
    main()