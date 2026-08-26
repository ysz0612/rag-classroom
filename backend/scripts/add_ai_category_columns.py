from sqlalchemy import text

from app.db.postgres import engine


def add_ai_category_columns():
    sql = text("""
        ALTER TABLE products
        ADD COLUMN IF NOT EXISTS ai_category TEXT;

        ALTER TABLE products
        ADD COLUMN IF NOT EXISTS ai_category_confidence TEXT;
    """)

    with engine.begin() as conn:
        conn.execute(sql)

    print("products.ai_category 컬럼 준비 완료")
    print("products.ai_category_confidence 컬럼 준비 완료")


if __name__ == "__main__":
    add_ai_category_columns()