from pathlib import Path
import os

import pandas as pd
import psycopg
from dotenv import load_dotenv


# =========================================================
# 프로젝트 경로
# =========================================================

# scripts/load_rag_knowledge.py
#         ↓ parent = scripts
#         ↓ parent.parent = 프로젝트 루트

BASE_DIR = Path(__file__).resolve().parent.parent

CSV_PATH = BASE_DIR / "data" / "rag_knowledge_expanded.csv"

ENV_PATH = BASE_DIR / ".env"

load_dotenv(ENV_PATH)


# =========================================================
# DB 환경 변수
# =========================================================

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "ragdb")
DB_USER = os.getenv("DB_USER", "ysz0612")
DB_PASSWORD = os.getenv("DB_PASSWORD", "12345")


# =========================================================
# PostgreSQL 연결
# =========================================================

def get_connection():
    return psycopg.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
    )


# =========================================================
# rag_knowledge 테이블 준비
# =========================================================

def create_table(conn):

    with conn.cursor() as cur:

        cur.execute("""
            CREATE TABLE IF NOT EXISTS rag_knowledge (
                id BIGSERIAL PRIMARY KEY,
                category VARCHAR(100) NOT NULL,
                concept VARCHAR(200) NOT NULL UNIQUE,
                content TEXT NOT NULL,
                keywords TEXT,
                related_concepts TEXT,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
        """)

    conn.commit()


# =========================================================
# CSV 읽기
# =========================================================

def load_csv():

    if not CSV_PATH.exists():

        raise FileNotFoundError(
            "\n"
            "rag_knowledge_expanded.csv 파일을 찾을 수 없습니다.\n"
            "\n"
            f"찾는 경로:\n{CSV_PATH}\n"
            "\n"
            "프로젝트의 data 폴더 안에 넣어주세요."
        )


    df = pd.read_csv(
        CSV_PATH,
        encoding="utf-8-sig",
    )

    df = df.fillna("")


    # -----------------------------------------------------
    # 필수 컬럼 확인
    # -----------------------------------------------------

    required_columns = [
        "category",
        "concept",
        "content",
        "keywords",
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:

        raise ValueError(
            f"CSV에 필요한 컬럼이 없습니다: {missing_columns}"
        )


    # -----------------------------------------------------
    # 필요한 컬럼만 사용
    # -----------------------------------------------------

    df = df[
        [
            "category",
            "concept",
            "content",
            "keywords",
        ]
    ].copy()


    # -----------------------------------------------------
    # 문자열 정리
    # -----------------------------------------------------

    for column in [
        "category",
        "concept",
        "content",
        "keywords",
    ]:

        df[column] = (
            df[column]
            .astype(str)
            .str.strip()
        )


    # -----------------------------------------------------
    # 필수 데이터 없는 행 제거
    # -----------------------------------------------------

    before_empty_remove = len(df)

    df = df[
        (df["category"] != "")
        & (df["concept"] != "")
        & (df["content"] != "")
    ].copy()

    empty_removed = (
        before_empty_remove
        - len(df)
    )


    # -----------------------------------------------------
    # CSV 자체 concept 중복 제거
    # -----------------------------------------------------

    before_duplicate_remove = len(df)

    df = df.drop_duplicates(
        subset=["concept"],
        keep="last",
    )

    duplicate_removed = (
        before_duplicate_remove
        - len(df)
    )


    # -----------------------------------------------------
    # CSV 정보 출력
    # -----------------------------------------------------

    print()
    print("=" * 60)
    print("RAG Knowledge CSV")
    print("=" * 60)

    print(f"CSV 경로 : {CSV_PATH}")
    print(f"최종 지식 개수 : {len(df)}개")
    print(f"빈 데이터 제거 : {empty_removed}개")
    print(f"concept 중복 제거 : {duplicate_removed}개")

    print()

    print("카테고리별 개수")
    print("-" * 60)

    category_counts = (
        df["category"]
        .value_counts()
        .sort_index()
    )

    for category, count in category_counts.items():

        print(
            f"{category:<15} : {count}"
        )

    print()

    return df


# =========================================================
# 기존 DB 지식 개수
# =========================================================

def get_existing_count(conn):

    with conn.cursor() as cur:

        cur.execute("""
            SELECT COUNT(*)
            FROM rag_knowledge;
        """)

        return cur.fetchone()[0]


# =========================================================
# INSERT + UPDATE
# =========================================================

def upsert_data(conn, df):

    inserted = 0
    updated = 0

    inserted_concepts = []
    updated_concepts = []

    with conn.cursor() as cur:

        for _, row in df.iterrows():

            category = row["category"]
            concept = row["concept"]
            content = row["content"]
            keywords = row["keywords"]


            # ------------------------------------------------
            # 기존 concept 존재 여부 확인
            # ------------------------------------------------

            cur.execute(
                """
                SELECT id
                FROM rag_knowledge
                WHERE concept = %s;
                """,
                (concept,),
            )

            existing = cur.fetchone()


            # ------------------------------------------------
            # 기존 데이터 → UPDATE
            # ------------------------------------------------

            if existing:

                cur.execute(
                    """
                    UPDATE rag_knowledge

                    SET
                        category = %s,
                        content = %s,
                        keywords = %s

                    WHERE concept = %s;
                    """,
                    (
                        category,
                        content,
                        keywords,
                        concept,
                    ),
                )

                updated += 1
                updated_concepts.append(concept)


            # ------------------------------------------------
            # 새로운 데이터 → INSERT
            # ------------------------------------------------

            else:

                cur.execute(
                    """
                    INSERT INTO rag_knowledge (
                        category,
                        concept,
                        content,
                        keywords
                    )

                    VALUES (
                        %s,
                        %s,
                        %s,
                        %s
                    );
                    """,
                    (
                        category,
                        concept,
                        content,
                        keywords,
                    ),
                )

                inserted += 1
                inserted_concepts.append(concept)


    conn.commit()

    return (
        inserted,
        updated,
        inserted_concepts,
        updated_concepts,
    )


# =========================================================
# DB 결과 검사
# =========================================================

def check_result(conn):

    with conn.cursor() as cur:


        # -------------------------------------------------
        # 전체 개수
        # -------------------------------------------------

        cur.execute("""
            SELECT COUNT(*)
            FROM rag_knowledge;
        """)

        total_count = cur.fetchone()[0]


        # -------------------------------------------------
        # concept 중복 확인
        # -------------------------------------------------

        cur.execute("""
            SELECT
                concept,
                COUNT(*)

            FROM rag_knowledge

            GROUP BY concept

            HAVING COUNT(*) > 1;
        """)

        duplicates = cur.fetchall()


        # -------------------------------------------------
        # 카테고리별 개수
        # -------------------------------------------------

        cur.execute("""
            SELECT
                category,
                COUNT(*)

            FROM rag_knowledge

            GROUP BY category

            ORDER BY category;
        """)

        categories = cur.fetchall()


        # -------------------------------------------------
        # 샘플
        # -------------------------------------------------

        cur.execute("""
            SELECT
                id,
                category,
                concept

            FROM rag_knowledge

            ORDER BY id

            LIMIT 15;
        """)

        samples = cur.fetchall()


    # =====================================================
    # 출력
    # =====================================================

    print()
    print("=" * 60)
    print("DB 최종 확인")
    print("=" * 60)

    print(
        f"전체 Knowledge : "
        f"{total_count}개"
    )

    print(
        f"concept 중복 : "
        f"{len(duplicates)}개"
    )


    print()
    print("카테고리별 Knowledge")
    print("-" * 60)

    for category, count in categories:

        print(
            f"{category:<15} : "
            f"{count}"
        )


    print()
    print("DB 샘플")
    print("-" * 60)

    for row in samples:

        print(
            f"{row[0]:>3} | "
            f"{row[1]:<15} | "
            f"{row[2]}"
        )


    # -----------------------------------------------------
    # 중복 발생 시 경고
    # -----------------------------------------------------

    if duplicates:

        print()
        print("⚠ 중복 concept")
        print("-" * 60)

        for concept, count in duplicates:

            print(
                f"{concept} : "
                f"{count}개"
            )


# =========================================================
# MAIN
# =========================================================

def main():

    print()
    print("=" * 60)
    print("RAG Knowledge 확장 데이터 적재")
    print("=" * 60)

    print()
    print("프로젝트 루트")
    print(BASE_DIR)

    print()
    print("CSV")
    print(CSV_PATH)


    # -----------------------------------------------------
    # CSV
    # -----------------------------------------------------

    df = load_csv()


    # -----------------------------------------------------
    # PostgreSQL
    # -----------------------------------------------------

    with get_connection() as conn:

        print("PostgreSQL 연결 완료")

        create_table(conn)

        print("rag_knowledge 테이블 준비 완료")


        # -------------------------------------------------
        # 적재 전
        # -------------------------------------------------

        before_count = get_existing_count(conn)

        print()
        print(
            f"적재 전 DB Knowledge : "
            f"{before_count}개"
        )

        print(
            f"이번 CSV Knowledge : "
            f"{len(df)}개"
        )


        # -------------------------------------------------
        # UPSERT
        # -------------------------------------------------

        (
            inserted,
            updated,
            inserted_concepts,
            updated_concepts,
        ) = upsert_data(
            conn,
            df,
        )


        # -------------------------------------------------
        # 적재 후
        # -------------------------------------------------

        after_count = get_existing_count(conn)


        print()
        print("=" * 60)
        print("적재 결과")
        print("=" * 60)

        print(
            f"신규 INSERT : "
            f"{inserted}개"
        )

        print(
            f"기존 UPDATE : "
            f"{updated}개"
        )

        print(
            f"적재 전 DB : "
            f"{before_count}개"
        )

        print(
            f"적재 후 DB : "
            f"{after_count}개"
        )


        # -------------------------------------------------
        # 새로 들어간 concept
        # -------------------------------------------------

        if inserted_concepts:

            print()
            print("새로 추가")
            print("-" * 60)

            for concept in inserted_concepts[:20]:

                print(
                    f"+ {concept}"
                )

            remaining = (
                len(inserted_concepts)
                - 20
            )

            if remaining > 0:

                print(
                    f"... 외 {remaining}개"
                )


        # -------------------------------------------------
        # 업데이트 concept
        # -------------------------------------------------

        if updated_concepts:

            print()
            print("기존 내용 갱신")
            print("-" * 60)

            for concept in updated_concepts[:20]:

                print(
                    f"↻ {concept}"
                )

            remaining = (
                len(updated_concepts)
                - 20
            )

            if remaining > 0:

                print(
                    f"... 외 {remaining}개"
                )


        # -------------------------------------------------
        # 최종 확인
        # -------------------------------------------------

        check_result(conn)


    print()
    print("=" * 60)
    print("RAG Knowledge 적재 완료")
    print("=" * 60)

    print()
    print(
        "다음 단계 → "
        "Knowledge Embedding 재생성"
    )


if __name__ == "__main__":
    main()