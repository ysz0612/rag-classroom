from sqlalchemy import text
from sklearn.decomposition import PCA

from app.db.postgres import engine


# ==========================================
# rag_knowledge Embedding 조회
# ==========================================

def get_knowledge_embeddings():
    sql = text("""
        SELECT
            id,
            category,
            concept,
            embedding

        FROM rag_knowledge

        WHERE embedding IS NOT NULL

        ORDER BY id;
    """)

    with engine.connect() as conn:
        rows = conn.execute(
            sql
        ).mappings().all()

    return rows


# ==========================================
# pgvector → Python list 변환
# ==========================================

def vector_to_list(vector_value):
    """
    PostgreSQL pgvector 값을
    Python list[float] 형태로 변환
    """

    if vector_value is None:
        return []

    # 문자열 형태:
    # "[0.1,0.2,0.3,...]"
    if isinstance(vector_value, str):

        value = vector_value.strip()

        value = value.strip(
            "[]"
        )

        if not value:
            return []

        return [
            float(item)
            for item in value.split(",")
        ]

    # 이미 list / tuple이면 그대로 변환
    if isinstance(
        vector_value,
        (list, tuple),
    ):
        return [
            float(value)
            for value in vector_value
        ]

    # numpy array, pgvector 객체 등
    try:
        return [
            float(value)
            for value in vector_value
        ]

    except TypeError:
        raise ValueError(
            f"지원하지 않는 embedding 타입입니다: "
            f"{type(vector_value)}"
        )

# ==========================================
# Knowledge PCA
# ==========================================

def create_knowledge_pca(
    dimensions: int = 3,
):
    rows = get_knowledge_embeddings()

    if len(rows) < dimensions:
        raise ValueError(
            "PCA를 실행하기 위한 데이터가 부족합니다."
        )

    vectors = []
    metadata = []

    for row in rows:
        vector = vector_to_list(
            row["embedding"]
        )

        if not vector:
            continue

        vectors.append(
            vector
        )

        metadata.append(
            {
                "id": row["id"],
                "category": row["category"],
                "concept": row["concept"],
            }
        )

    if len(vectors) < dimensions:
        raise ValueError(
            "Embedding 데이터가 부족합니다."
        )

    # ======================================
    # PCA 실행
    # ======================================

    pca = PCA(
        n_components=dimensions
    )

    reduced = pca.fit_transform(
        vectors
    )

    points = []

    for index, coords in enumerate(
        reduced
    ):
        point = {
            **metadata[index],
            "x": round(
                float(coords[0]),
                6,
            ),
            "y": round(
                float(coords[1]),
                6,
            ),
        }

        if dimensions >= 3:
            point["z"] = round(
                float(coords[2]),
                6,
            )

        points.append(
            point
        )

    explained_ratio = [
        round(
            float(value),
            6,
        )
        for value in pca.explained_variance_ratio_
    ]

    return {
        "type": "knowledge",
        "dimensions": dimensions,
        "count": len(points),
        "explained_variance_ratio": explained_ratio,
        "points": points,
    }

# ==========================================
# Product Embedding 조회
# ==========================================

def get_product_embeddings():
    sql = text("""
        SELECT
            product_id,
            product_name,
            category,
            brand,
            embedding

        FROM products

        WHERE embedding IS NOT NULL

        ORDER BY product_id;
    """)

    with engine.connect() as conn:
        rows = conn.execute(
            sql
        ).mappings().all()

    return rows


# ==========================================
# Product PCA
# ==========================================

def create_product_pca(
    dimensions: int = 3,
):
    rows = get_product_embeddings()

    if len(rows) < dimensions:
        raise ValueError(
            "PCA를 실행하기 위한 상품 데이터가 부족합니다."
        )

    vectors = []
    metadata = []

    for row in rows:

        vector = vector_to_list(
            row["embedding"]
        )

        if not vector:
            continue

        vectors.append(
            vector
        )

        metadata.append(
            {
                "product_id": row["product_id"],
                "product_name": row["product_name"],
                "category": row["category"],
                "brand": row["brand"],
            }
        )

    if len(vectors) < dimensions:
        raise ValueError(
            "Embedding된 상품 데이터가 부족합니다."
        )

    # ======================================
    # PCA
    # ======================================

    pca = PCA(
        n_components=dimensions
    )

    reduced = pca.fit_transform(
        vectors
    )

    points = []

    for index, coords in enumerate(
        reduced
    ):

        point = {
            **metadata[index],

            "x": round(
                float(coords[0]),
                6,
            ),

            "y": round(
                float(coords[1]),
                6,
            ),
        }

        if dimensions >= 3:

            point["z"] = round(
                float(coords[2]),
                6,
            )

        points.append(
            point
        )

    explained_ratio = [
        round(
            float(value),
            6,
        )
        for value in pca.explained_variance_ratio_
    ]

    return {
        "type": "products",
        "dimensions": dimensions,
        "count": len(points),
        "explained_variance_ratio": explained_ratio,
        "points": points,
    }