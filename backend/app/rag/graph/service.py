import os

from dotenv import load_dotenv
from neo4j import GraphDatabase
from openai import OpenAI


load_dotenv()


# ==========================================
# OpenAI
# ==========================================

client = OpenAI(
    api_key=os.getenv(
        "OPENAI_API_KEY"
    )
)

CHAT_MODEL = "gpt-4o-mini"


# ==========================================
# Neo4j
# ==========================================

driver = GraphDatabase.driver(
    os.getenv(
        "NEO4J_URI",
        "bolt://localhost:7687",
    ),
    auth=(
        os.getenv(
            "NEO4J_USER",
            "neo4j",
        ),
        os.getenv(
            "NEO4J_PASSWORD",
            "rag12345",
        ),
    ),
)


# ==========================================
# Graph Path 종류
# ==========================================

USER_PRODUCTS = "user_products"

SAME_BRAND = "same_brand"

SAME_CATEGORY = "same_category"

RELATED_USERS = "related_users"

UNSUPPORTED = "unsupported"


# ==========================================
# 질문 → Graph 경로 선택
# ==========================================

def classify_graph_question(
    question: str,
) -> str:

    q = question.lower().strip()


    # --------------------------------------
    # 다른 사용자
    # --------------------------------------

    user_words = [
        "다른 사용자",
        "다른 사람",
        "누가 좋아",
        "누가 평가",
        "같이 좋아",
        "비슷한 사용자",
        "다른 고객",
    ]

    if any(
        word in q
        for word in user_words
    ):
        return RELATED_USERS


    # --------------------------------------
    # 현재 사용자의 평점·평가 질문
    # 어순이 달라도 USER_PRODUCTS로 분류합니다.
    # 예: "내가 가장 평점을 높게 준 상품"
    # --------------------------------------

    has_current_user = any(
        word in q
        for word in [
            "내가",
            "나는",
            "나의",
            "내 평점",
            "내 별점",
            "내 리뷰",
        ]
    )

    has_rating_or_review = any(
        word in q
        for word in [
            "평점",
            "별점",
            "평가",
            "리뷰",
        ]
    )

    has_high_rating = any(
        word in q
        for word in [
            "높게",
            "높은",
            "가장 높",
            "최고",
            "좋게",
        ]
    )

    if (
        has_current_user
        and has_rating_or_review
        and has_high_rating
    ):
        return USER_PRODUCTS


    # --------------------------------------
    # 카테고리
    # --------------------------------------

    category_words = [
        "카테고리",
        "분류",
        "같은 종류",
        "같은 유형",
        "비슷한 종류",
    ]

    if any(
        word in q
        for word in category_words
    ):
        return SAME_CATEGORY


    # --------------------------------------
    # 브랜드
    # --------------------------------------

    brand_words = [
        "브랜드",
        "같은 회사",
        "같은 브랜드",
        "제조사",
    ]

    if any(
        word in q
        for word in brand_words
    ):
        return SAME_BRAND

    recommendation_words = [
        "추천",
        "추천해줘",
        "추천해주세요",
        "좋아할 만한",
        "좋아할만한",
        "비슷한 상품",
        "관련 상품",
    ]

    if any(
        word in q
        for word in recommendation_words
    ):
        return SAME_CATEGORY


    # --------------------------------------
    # 사용자가 평가·리뷰한 상품
    # --------------------------------------

    reviewed_product_words = [
        "내가 평가",
        "내가 리뷰",
        "내가 좋아",
        "내가 구매",
        "평가한 상품",
        "리뷰한 상품",
        "높게 평가",
        "평점을 높게 준",
        "평점을 가장 높게 준",
        "가장 높은 평점",
        "최고 평점",
        "별점을 높게 준",
        "좋아한 상품",
        "구매한 상품",
    ]

    if any(
        word in q
        for word in reviewed_product_words
    ):
        return USER_PRODUCTS


    # 관계 표현이 없는 일반 상품 질문을
    # 임의의 사용자 리뷰 경로로 보내지 않습니다.
    return UNSUPPORTED


# ==========================================
# 1.
# User → REVIEWED → Product
# ==========================================

def search_user_products(
    user_id: str,
    min_rating: float,
    limit: int,
):

    cypher = """
    MATCH (u:User {
        user_id: $user_id
    })
    -[r:REVIEWED]->
    (p:Product)

    WHERE r.rating >= $min_rating

    OPTIONAL MATCH
        (p)-[:MADE_BY]->(b:Brand)

    OPTIONAL MATCH
        (p)-[:BELONGS_TO]->(c:Category)

    RETURN
        u.user_id AS user_id,

        p.product_id AS product_id,
        p.product_name AS product_name,

        r.rating AS rating,

        b.name AS brand,
        c.name AS category,

        null AS related_product_id,
        null AS related_product,

        null AS related_user_id

    ORDER BY
        r.rating DESC

    LIMIT $limit
    """

    return run_query(
        cypher=cypher,
        params={
            "user_id": user_id,
            "min_rating": min_rating,
            "limit": limit,
        },
    )


# ==========================================
# 2.
# User
# → REVIEWED
# → Product
# → Brand
# → Product
# ==========================================

def search_same_brand_products(
    user_id: str,
    min_rating: float,
    limit: int,
):

    cypher = """
    MATCH (u:User {
        user_id: $user_id
    })
    -[r:REVIEWED]->
    (p:Product)

    WHERE r.rating >= $min_rating

    MATCH
        (p)-[:MADE_BY]->(b:Brand)

    MATCH
        (other:Product)-[:MADE_BY]->(b)

    WHERE
        other.product_id
        <> p.product_id

    OPTIONAL MATCH
        (p)-[:BELONGS_TO]->(c:Category)

    RETURN
        u.user_id AS user_id,

        p.product_id AS product_id,
        p.product_name AS product_name,

        r.rating AS rating,

        b.name AS brand,
        c.name AS category,

        other.product_id
            AS related_product_id,

        other.product_name
            AS related_product,

        null AS related_user_id

    ORDER BY
        r.rating DESC,
        other.product_name ASC

    LIMIT $limit
    """

    return run_query(
        cypher=cypher,
        params={
            "user_id": user_id,
            "min_rating": min_rating,
            "limit": limit,
        },
    )


# ==========================================
# 3.
# User
# → REVIEWED
# → Product
# → Category
# → Product
# ==========================================

def search_same_category_products(
    user_id: str,
    min_rating: float,
    limit: int,
):

    cypher = """
    MATCH (u:User {
        user_id: $user_id
    })
    -[r:REVIEWED]->
    (p:Product)

    WHERE r.rating >= $min_rating

    MATCH
        (p)-[:BELONGS_TO]->(c:Category)

    MATCH
        (other:Product)-[:BELONGS_TO]->(c)

    WHERE
        other.product_id
        <> p.product_id

        AND NOT EXISTS {
            MATCH (u)-[:REVIEWED]->(other)
        }

    OPTIONAL MATCH
        (p)-[:MADE_BY]->(b:Brand)

    OPTIONAL MATCH
        (:User)-[other_r:REVIEWED]->(other)

    WITH
        u,
        p,
        r,
        b,
        c,
        other,
        avg(toFloat(other_r.rating))
            AS recommendation_score,
        count(other_r)
            AS recommendation_review_count

    RETURN DISTINCT
        u.user_id AS user_id,

        p.product_id AS product_id,
        p.product_name AS product_name,

        r.rating AS rating,

        b.name AS brand,
        c.name AS category,

        other.product_id
            AS related_product_id,

        other.product_name
            AS related_product,

        recommendation_score,
        recommendation_review_count,

        null AS related_user_id

    ORDER BY
        r.rating DESC,
        recommendation_score DESC,
        recommendation_review_count DESC,
        other.product_name ASC

    LIMIT $limit
    """

    return run_query(
        cypher=cypher,
        params={
            "user_id": user_id,
            "min_rating": min_rating,
            "limit": limit,
        },
    )


# ==========================================
# 4.
# User
# → REVIEWED
# → Product
# ← REVIEWED
# ← Other User
# ==========================================

def search_related_users(
    user_id: str,
    min_rating: float,
    limit: int,
):

    cypher = """
    MATCH
        (u:User {
            user_id: $user_id
        })
        -[r:REVIEWED]->
        (p:Product)

    WHERE
        r.rating >= $min_rating

    MATCH
        (other:User)
        -[other_r:REVIEWED]->
        (p)

    WHERE
        other.user_id
        <> u.user_id

        AND other_r.rating
        >= $min_rating

    OPTIONAL MATCH
        (p)-[:MADE_BY]->(b:Brand)

    OPTIONAL MATCH
        (p)-[:BELONGS_TO]->(c:Category)

    RETURN
        u.user_id AS user_id,

        p.product_id AS product_id,
        p.product_name AS product_name,

        r.rating AS rating,

        b.name AS brand,
        c.name AS category,

        null AS related_product_id,
        null AS related_product,

        other.user_id
            AS related_user_id

    ORDER BY
        other_r.rating DESC,
        r.rating DESC

    LIMIT $limit
    """

    return run_query(
        cypher=cypher,
        params={
            "user_id": user_id,
            "min_rating": min_rating,
            "limit": limit,
        },
    )


# ==========================================
# Neo4j Query 실행
# ==========================================

def run_query(
    cypher: str,
    params: dict,
):

    with driver.session() as session:

        result = session.run(
            cypher,
            **params,
        )

        return [
            dict(record)
            for record in result
        ]


# ==========================================
# 질문에 맞는 Graph 검색 실행
# ==========================================

def graph_search(
    question: str,
    user_id: str,
    min_rating: float = 4.0,
    limit: int = 10,
):

    path_type = classify_graph_question(
        question
    )


    # --------------------------------------
    # 사용자 → 상품
    # --------------------------------------

    if path_type == USER_PRODUCTS:

        results = search_user_products(
            user_id=user_id,
            min_rating=min_rating,
            limit=limit,
        )

        path = (
            "User "
            "→ REVIEWED "
            "→ Product"
        )


    # --------------------------------------
    # 브랜드 관계
    # --------------------------------------

    elif path_type == SAME_BRAND:

        results = search_same_brand_products(
            user_id=user_id,
            min_rating=min_rating,
            limit=limit,
        )

        path = (
            "User "
            "→ REVIEWED "
            "→ Product "
            "→ MADE_BY "
            "→ Brand "
            "→ Product"
        )


    # --------------------------------------
    # 카테고리 관계
    # --------------------------------------

    elif path_type == SAME_CATEGORY:

        results = search_same_category_products(
            user_id=user_id,
            min_rating=min_rating,
            limit=limit,
        )

        path = (
            "User "
            "→ REVIEWED "
            "→ Product "
            "→ BELONGS_TO "
            "→ Category "
            "→ Product"
        )


    # --------------------------------------
    # 다른 사용자
    # --------------------------------------

    elif path_type == RELATED_USERS:

        results = search_related_users(
            user_id=user_id,
            min_rating=min_rating,
            limit=limit,
        )

        path = (
            "User "
            "→ REVIEWED "
            "→ Product "
            "← REVIEWED "
            "← User"
        )


    # --------------------------------------
    # Graph 관계 질문이 아님
    # --------------------------------------

    else:

        results = []

        path = (
            "관계 질문 아님"
        )


    return (
        path_type,
        path,
        results,
    )


# ==========================================
# Graph 시각화 데이터 생성
# ==========================================

def build_visualization(
    path_type: str,
    results: list[dict],
):

    nodes = {}
    relationships = set()


    def add_node(
        node_id,
        label,
        node_type,
    ):

        if not node_id:
            return

        nodes[node_id] = {
            "id": node_id,
            "label": label or node_id,
            "type": node_type,
        }


    def add_relationship(
        source,
        target,
        relationship_type,
    ):

        if not source or not target:
            return

        relationships.add(
            (
                source,
                target,
                relationship_type,
            )
        )


    for item in results:

        user_id = item.get(
            "user_id"
        )

        product_id = item.get(
            "product_id"
        )

        product_name = item.get(
            "product_name"
        )

        brand = item.get(
            "brand"
        )

        category = item.get(
            "category"
        )

        related_product_id = item.get(
            "related_product_id"
        )

        related_product = item.get(
            "related_product"
        )

        related_user_id = item.get(
            "related_user_id"
        )


        # User
        add_node(
            user_id,
            user_id,
            "User",
        )


        # Product
        add_node(
            product_id,
            product_name,
            "Product",
        )


        add_relationship(
            user_id,
            product_id,
            "REVIEWED",
        )


        # ==================================
        # Brand
        # ==================================

        if (
            path_type == SAME_BRAND
            and brand
        ):

            brand_id = (
                f"brand:{brand}"
            )

            add_node(
                brand_id,
                brand,
                "Brand",
            )

            add_relationship(
                product_id,
                brand_id,
                "MADE_BY",
            )

            if related_product_id:

                add_node(
                    related_product_id,
                    related_product,
                    "Product",
                )

                add_relationship(
                    related_product_id,
                    brand_id,
                    "MADE_BY",
                )


        # ==================================
        # Category
        # ==================================

        elif (
            path_type
            == SAME_CATEGORY
            and category
        ):

            category_id = (
                f"category:{category}"
            )

            add_node(
                category_id,
                category,
                "Category",
            )

            add_relationship(
                product_id,
                category_id,
                "BELONGS_TO",
            )

            if related_product_id:

                add_node(
                    related_product_id,
                    related_product,
                    "Product",
                )

                add_relationship(
                    related_product_id,
                    category_id,
                    "BELONGS_TO",
                )


        # ==================================
        # Related User
        # ==================================

        elif (
            path_type
            == RELATED_USERS
            and related_user_id
        ):

            add_node(
                related_user_id,
                related_user_id,
                "User",
            )

            add_relationship(
                related_user_id,
                product_id,
                "REVIEWED",
            )


    node_list = list(
        nodes.values()
    )


    relationship_list = [
        {
            "source": source,
            "target": target,
            "type": relation_type,
        }

        for (
            source,
            target,
            relation_type,
        )
        in relationships
    ]


    return (
        node_list,
        relationship_list,
    )


# ==========================================
# LLM 최종 답변 생성
# ==========================================

def make_graph_answer(
    question: str,
    path_type: str,
    path: str,
    results: list[dict],
):

    if not results:

        return (
            "현재 그래프 데이터에서는 "
            "질문에 해당하는 관계를 "
            "찾지 못했습니다."
        )


    context_parts = []


    for index, item in enumerate(
        results,
        start=1,
    ):

        context_parts.append(
            f"""
[관계 {index}]

사용자:
{item.get("user_id")}

상품:
{item.get("product_name")}

평점:
{item.get("rating")}

브랜드:
{item.get("brand")}

카테고리:
{item.get("category")}

연결된 상품:
{item.get("related_product")}

연결된 사용자:
{item.get("related_user_id")}
"""
        )


    context = "\n".join(
        context_parts
    )


    response = client.chat.completions.create(
        model=CHAT_MODEL,

        messages=[
            {
                "role": "system",
                "content": (
                    "당신은 Graph RAG를 "
                    "설명하는 AI 강의 도우미입니다. "

                    "반드시 제공된 Neo4j "
                    "탐색 결과만 근거로 "
                    "답변하세요. "

                    "검색 결과에 없는 상품, "
                    "사용자, 관계를 "
                    "추측하지 마세요. "

                    "학생이 Graph RAG의 특징을 "
                    "이해할 수 있도록 "
                    "어떤 관계 경로를 따라 "
                    "정보를 찾았는지 "
                    "간단하게 설명하세요."
                ),
            },

            {
                "role": "user",
                "content": f"""
질문:
{question}

Graph 탐색 유형:
{path_type}

Graph 탐색 경로:
{path}

Neo4j 검색 결과:

{context}

위 Graph 관계 정보만 사용해서
질문에 답해주세요.
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
    )