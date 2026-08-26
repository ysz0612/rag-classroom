from sqlalchemy import text

from app.db.postgres import engine


def add_embedding_column():
    sql = text("""
        ALTER TABLE products
        ADD COLUMN IF NOT EXISTS embedding vector(1536);
    """)

    with engine.begin() as conn:
        conn.execute(sql)

    print("products.embedding 컬럼 준비 완료")


if __name__ == "__main__":
    add_embedding_column()