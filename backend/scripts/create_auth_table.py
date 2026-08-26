from sqlalchemy import text

from app.db.postgres import engine


def create_auth_table():

    sql = text("""
        CREATE TABLE IF NOT EXISTS app_users (
            id BIGSERIAL PRIMARY KEY,

            username VARCHAR(50)
                NOT NULL
                UNIQUE,

            email VARCHAR(255)
                NOT NULL
                UNIQUE,

            password_hash TEXT
                NOT NULL,

            nickname VARCHAR(50),

            is_active BOOLEAN
                NOT NULL
                DEFAULT TRUE,

            created_at TIMESTAMPTZ
                NOT NULL
                DEFAULT CURRENT_TIMESTAMP,

            updated_at TIMESTAMPTZ
                NOT NULL
                DEFAULT CURRENT_TIMESTAMP
        );
    """)

    with engine.begin() as conn:
        conn.execute(sql)

    print("app_users 테이블 생성 완료")


if __name__ == "__main__":
    create_auth_table()