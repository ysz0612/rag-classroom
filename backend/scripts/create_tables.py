from sqlalchemy import text
from app.db.postgres import engine


def create_tables():
    with engine.begin() as conn:

        conn.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS products (
                    product_id TEXT PRIMARY KEY,
                    product_name TEXT NOT NULL,
                    description TEXT,
                    category TEXT,
                    price DOUBLE PRECISION,
                    brand TEXT,
                    search_text TEXT
                );
                """
            )
        )

        conn.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS reviews (
                    id BIGSERIAL PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    product_id TEXT NOT NULL,
                    rating DOUBLE PRECISION,
                    review_text TEXT NOT NULL,

                    CONSTRAINT fk_reviews_product
                        FOREIGN KEY (product_id)
                        REFERENCES products(product_id)
                        ON DELETE CASCADE
                );
                """
            )
        )

        conn.execute(
            text(
                """
                CREATE INDEX IF NOT EXISTS idx_reviews_product_id
                ON reviews(product_id);
                """
            )
        )

        conn.execute(
            text(
                """
                CREATE INDEX IF NOT EXISTS idx_reviews_user_id
                ON reviews(user_id);
                """
            )
        )

    print("테이블 생성 완료")


if __name__ == "__main__":
    create_tables()