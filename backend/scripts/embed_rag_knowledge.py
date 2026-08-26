import os
import time

from dotenv import load_dotenv
from openai import OpenAI
from sqlalchemy import text

from app.db.postgres import engine


# =========================================================
# 환경 변수
# =========================================================

load_dotenv()


OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise RuntimeError(
        "OPENAI_API_KEY가 .env에 없습니다."
    )


# =========================================================
# OpenAI
# =========================================================

client = OpenAI(
    api_key=OPENAI_API_KEY,
)


EMBEDDING_MODEL = "text-embedding-3-small"


# =========================================================
# Knowledge 전체 조회
# =========================================================

def get_knowledge():
    """
    rag_knowledge 전체 조회

    기존 embedding이 있든 없든 상관없이
    모든 Knowledge를 다시 Embedding한다.
    """

    sql = text("""
        SELECT
            id,
            category,
            concept,
            content,
            keywords

        FROM rag_knowledge

        ORDER BY id;
    """)

    with engine.connect() as conn:

        rows = (
            conn.execute(sql)
            .mappings()
            .all()
        )

    return rows


# =========================================================
# Embedding용 문자열 생성
# =========================================================

def make_embedding_text(
    category: str,
    concept: str,
    content: str,
    keywords: str,
) -> str:
    """
    Knowledge의 여러 정보를 하나의 문자열로 합쳐서
    OpenAI Embedding 입력으로 사용한다.
    """

    category = category or ""
    concept = concept or ""
    content = content or ""
    keywords = keywords or ""

    return (
        f"분류: {category}\n"
        f"개념: {concept}\n"
        f"설명: {content}\n"
        f"핵심 키워드: {keywords}"
    )


# =========================================================
# OpenAI Embedding 생성
# =========================================================

def create_embedding(
    input_text: str,
) -> list[float]:

    response = client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=input_text,
    )

    return response.data[0].embedding


# =========================================================
# PostgreSQL pgvector 저장
# =========================================================

def save_embedding(
    knowledge_id: int,
    embedding: list[float],
):

    embedding_string = (
        "["
        + ",".join(
            str(value)
            for value in embedding
        )
        + "]"
    )

    sql = text("""
        UPDATE rag_knowledge

        SET embedding = CAST(
            :embedding AS vector
        )

        WHERE id = :id;
    """)

    with engine.begin() as conn:

        conn.execute(
            sql,
            {
                "id": knowledge_id,
                "embedding": embedding_string,
            },
        )


# =========================================================
# 기존 DB 상태 확인
# =========================================================

def check_before():

    sql = text("""
        SELECT
            COUNT(*) AS total,

            COUNT(embedding)
            AS embedded,

            COUNT(*) - COUNT(embedding)
            AS missing

        FROM rag_knowledge;
    """)

    with engine.connect() as conn:

        result = (
            conn.execute(sql)
            .mappings()
            .one()
        )

    print()
    print("=" * 60)
    print("Embedding 작업 전 상태")
    print("=" * 60)

    print(
        f"전체 Knowledge   : "
        f"{result['total']}개"
    )

    print(
        f"기존 Embedding   : "
        f"{result['embedded']}개"
    )

    print(
        f"Embedding 없음   : "
        f"{result['missing']}개"
    )

    print()


# =========================================================
# 최종 결과 확인
# =========================================================

def check_result():

    sql = text("""
        SELECT
            COUNT(*) AS total,

            COUNT(embedding)
            AS embedded,

            COUNT(*) - COUNT(embedding)
            AS missing

        FROM rag_knowledge;
    """)

    with engine.connect() as conn:

        result = (
            conn.execute(sql)
            .mappings()
            .one()
        )


    print()
    print("=" * 60)
    print("Embedding 저장 결과")
    print("=" * 60)

    print(
        f"전체 Knowledge   : "
        f"{result['total']}개"
    )

    print(
        f"Embedding 완료   : "
        f"{result['embedded']}개"
    )

    print(
        f"Embedding 누락   : "
        f"{result['missing']}개"
    )


    if result["missing"] == 0:

        print()
        print(
            "✅ 모든 Knowledge에 Embedding이 저장되었습니다."
        )

    else:

        print()
        print(
            "⚠ Embedding이 없는 Knowledge가 있습니다."
        )


# =========================================================
# 실패한 Knowledge 확인
# =========================================================

def check_missing():

    sql = text("""
        SELECT
            id,
            category,
            concept

        FROM rag_knowledge

        WHERE embedding IS NULL

        ORDER BY id;
    """)

    with engine.connect() as conn:

        rows = (
            conn.execute(sql)
            .mappings()
            .all()
        )


    if not rows:
        return


    print()
    print("Embedding 누락 Knowledge")
    print("-" * 60)

    for row in rows:

        print(
            f"{row['id']:>4} | "
            f"{row['category']:<15} | "
            f"{row['concept']}"
        )


# =========================================================
# MAIN
# =========================================================

def main():

    print()
    print("=" * 60)
    print("RAG Knowledge Embedding 전체 재생성")
    print("=" * 60)

    print()

    print(
        f"Embedding Model : "
        f"{EMBEDDING_MODEL}"
    )


    # =====================================================
    # 작업 전 DB 확인
    # =====================================================

    check_before()


    # =====================================================
    # Knowledge 가져오기
    # =====================================================

    rows = get_knowledge()

    total = len(rows)


    if total == 0:

        print(
            "rag_knowledge 데이터가 없습니다."
        )

        return


    print(
        f"Embedding 대상 : "
        f"{total}개"
    )

    print()


    # =====================================================
    # 모든 Knowledge 재생성
    # =====================================================

    success = 0
    failed = 0


    for index, row in enumerate(
        rows,
        start=1,
    ):

        knowledge_id = row["id"]

        category = row["category"]
        concept = row["concept"]
        content = row["content"]
        keywords = row["keywords"]


        embedding_text = (
            make_embedding_text(
                category=category,
                concept=concept,
                content=content,
                keywords=keywords,
            )
        )


        print(
            f"[{index:>3}/{total}] "
            f"{category} / {concept}"
        )


        try:

            embedding = (
                create_embedding(
                    embedding_text
                )
            )


            save_embedding(
                knowledge_id=knowledge_id,
                embedding=embedding,
            )


            success += 1


            print(
                f"      ✓ 저장 완료 "
                f"({len(embedding)}차원)"
            )


        except Exception as e:

            failed += 1


            print(
                f"      ❌ ERROR: {e}"
            )


        # 너무 빠른 연속 요청 방지
        time.sleep(0.05)


    # =====================================================
    # 결과
    # =====================================================

    print()
    print("=" * 60)
    print("이번 실행 결과")
    print("=" * 60)

    print(
        f"성공 : {success}개"
    )

    print(
        f"실패 : {failed}개"
    )


    check_result()

    check_missing()


    print()
    print("=" * 60)

    if failed == 0:

        print(
            "✅ RAG Knowledge Embedding 재생성 완료"
        )

    else:

        print(
            "⚠ 일부 Knowledge Embedding 생성 실패"
        )

    print("=" * 60)


if __name__ == "__main__":
    main()