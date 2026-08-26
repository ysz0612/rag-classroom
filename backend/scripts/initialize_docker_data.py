"""Docker용 최초 데이터 초기화.

실행:
    docker compose --profile init run --rm init-data

기본 데이터 적재 후 OPENAI_API_KEY가 있으면 상품 번역과 임베딩까지 생성합니다.
이미 생성된 Docker 볼륨에 다시 실행해도 테이블과 상품은 갱신됩니다.
"""

import os
import subprocess
import sys

from sqlalchemy import text

from app.db.postgres import engine


def run(script: str) -> None:
    print(f"\n===== {script} =====", flush=True)
    subprocess.run(
        [sys.executable, f"scripts/{script}"],
        check=True,
        cwd="/app",
        env=os.environ.copy(),
    )


def prepare_extensions_and_columns() -> None:
    with engine.begin() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        conn.execute(
            text(
                """
                ALTER TABLE products ADD COLUMN IF NOT EXISTS product_name_ko TEXT;
                ALTER TABLE products ADD COLUMN IF NOT EXISTS description_ko TEXT;
                ALTER TABLE products ADD COLUMN IF NOT EXISTS category_ko TEXT;
                ALTER TABLE products ADD COLUMN IF NOT EXISTS search_text_ko TEXT;
                """
            )
        )


def prepare_knowledge_embedding() -> None:
    with engine.begin() as conn:
        conn.execute(
            text(
                """
                ALTER TABLE rag_knowledge
                ADD COLUMN IF NOT EXISTS embedding vector(1536);
                """
            )
        )


def main() -> None:
    run("create_tables.py")
    prepare_extensions_and_columns()
    run("create_auth_table.py")
    run("load_data.py")
    run("add_product_embedding_column.py")
    run("load_rag_knowledge.py")
    prepare_knowledge_embedding()

    if not os.getenv("OPENAI_API_KEY"):
        raise RuntimeError(
            "기본 CSV 적재는 완료됐지만 OPENAI_API_KEY가 없어 "
            "한국어 번역과 Vector RAG 임베딩을 만들 수 없습니다. "
            ".env에 키를 넣고 초기화 명령을 다시 실행하세요."
        )

    run("translate_products_ko.py")
    run("embed_products.py")
    run("embed_rag_knowledge.py")
    run("load_neo4j_graph.py")

    print("\n모든 초기 데이터 준비가 완료되었습니다.", flush=True)


if __name__ == "__main__":
    main()

