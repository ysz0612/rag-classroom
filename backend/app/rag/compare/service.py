from app.db.neo4j import driver

from app.rag.graph.service import (
    build_visualization,
    graph_search,
)


def get_compare_users(
    limit: int = 20,
):
    """리뷰 관계가 있는 사용자를 발표용 별칭으로 반환합니다."""

    with driver.session() as session:
        records = session.run(
            """
            MATCH (u:User)-[r:REVIEWED]->(:Product)
            WHERE u.user_id IS NOT NULL
              AND toFloat(r.rating) >= 4.0
            RETURN u.user_id AS user_id,
                   count(r) AS review_count
            ORDER BY review_count DESC, user_id
            LIMIT $limit
            """,
            limit=limit,
        )

        return [
            {
                "alias": f"user{index}",
                "user_id": record["user_id"],
                "review_count": record["review_count"],
            }
            for index, record in enumerate(
                records,
                start=1,
            )
        ]

from app.rag.keyword.service import (
    search_products_keyword,
)

from app.rag.vector.product_service import (
    search_products_vector,
)


def compare_product_search(
    question: str,
    user_id: str,
    min_rating: float = 4.0,
    limit: int = 5,
):
    """
    같은 질문을 세 검색 방식에 전달합니다.

    Keyword:
        PostgreSQL products.search_text_ko의
        정확한 단어 포함 여부를 검색합니다.

    Vector:
        PostgreSQL products.embedding의
        의미 유사도를 검색합니다.

    Graph:
        Neo4j의 사용자·상품·브랜드·카테고리
        관계를 탐색합니다.

    한 검색 방식에서 오류가 발생해도
    다른 검색 결과는 반환합니다.
    """

    # ======================================
    # Keyword RAG
    # ======================================

    try:
        keywords, keyword_results = (
            search_products_keyword(
                question=question,
                limit=limit,
            )
        )

        keyword_response = {
            "status": "success",
            "search_type": "exact_word_match",

            "count":
                len(keyword_results),

            "keywords":
                keywords,

            "path_type":
                None,

            "path":
                None,

            "retrieved":
                keyword_results,

            "nodes": [],
            "relationships": [],

            "error":
                None,
        }

    except Exception as error:
        print(
            "[COMPARE KEYWORD ERROR]",
            repr(error),
        )

        keyword_response = {
            "status": "error",
            "search_type": "exact_word_match",

            "count": 0,
            "keywords": [],

            "path_type": None,
            "path": None,

            "retrieved": [],
            "nodes": [],
            "relationships": [],

            "error":
                "Keyword 검색 중 오류가 발생했습니다.",
        }

    # ======================================
    # Vector RAG
    # ======================================

    try:
        vector_results = (
            search_products_vector(
                question=question,
                limit=limit,
            )
        )

        vector_response = {
            "status": "success",
            "search_type": "semantic_similarity",

            "count":
                len(vector_results),

            "keywords": [],

            "path_type":
                None,

            "path":
                None,

            "retrieved":
                vector_results,

            "nodes": [],
            "relationships": [],

            "error":
                None,
        }

    except Exception as error:
        print(
            "[COMPARE VECTOR ERROR]",
            repr(error),
        )

        vector_response = {
            "status": "error",
            "search_type": "semantic_similarity",

            "count": 0,
            "keywords": [],

            "path_type": None,
            "path": None,

            "retrieved": [],
            "nodes": [],
            "relationships": [],

            "error": repr(error),
        }

    # ======================================
    # Graph RAG
    # ======================================

    try:
        (
            path_type,
            path,
            graph_results,
        ) = graph_search(
            question=question,
            user_id=user_id,
            min_rating=min_rating,
            limit=limit,
        )

        (
            nodes,
            relationships,
        ) = build_visualization(
            path_type=path_type,
            results=graph_results,
        )

        graph_response = {
            "status": "success",
            "search_type": "relationship_traversal",

            "count":
                len(graph_results),

            "keywords": [],

            "path_type":
                path_type,

            "path":
                path,

            "retrieved":
                graph_results,

            "nodes":
                nodes,

            "relationships":
                relationships,

            "error":
                None,
        }

    except Exception as error:
        print(
            "[COMPARE GRAPH ERROR]",
            repr(error),
        )

        graph_response = {
            "status": "error",
            "search_type": "relationship_traversal",

            "count": 0,
            "keywords": [],

            "path_type": None,
            "path": None,

            "retrieved": [],
            "nodes": [],
            "relationships": [],

            "error":
                "Graph 검색 중 오류가 발생했습니다.",
        }

    # ======================================
    # 최종 비교 결과
    # ======================================

    return {
        "question":
            question,

        "user_id":
            user_id,

        "limit":
            limit,

        "keyword":
            keyword_response,

        "vector":
            vector_response,

        "graph":
            graph_response,
    }