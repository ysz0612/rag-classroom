import json
import os
import time

from dotenv import load_dotenv
from openai import OpenAI
from sqlalchemy import text

from app.db.postgres import engine


# =========================================================
# ENV
# =========================================================

load_dotenv()

OPENAI_API_KEY = os.getenv(
    "OPENAI_API_KEY"
)

if not OPENAI_API_KEY:
    raise RuntimeError(
        "OPENAI_API_KEY가 .env에 없습니다."
    )


client = OpenAI(
    api_key=OPENAI_API_KEY,
)


MODEL = "gpt-4o-mini"

# 한 번에 번역할 리뷰 수
BATCH_SIZE = 20

# API 요청 사이 간격
REQUEST_DELAY = 0.2


# =========================================================
# 1. 한국어 컬럼 준비
# =========================================================

def prepare_column():

    sql = text(
        """
        ALTER TABLE reviews
        ADD COLUMN IF NOT EXISTS review_text_ko TEXT;
        """
    )

    with engine.begin() as conn:
        conn.execute(sql)

    print(
        "reviews.review_text_ko 컬럼 준비 완료"
    )


# =========================================================
# 2. 번역이 필요한 리뷰 조회
# =========================================================

def get_reviews():

    sql = text(
        """
        SELECT
            id,
            product_id,
            user_id,
            review_text,
            review_text_ko

        FROM reviews

        WHERE
            review_text IS NOT NULL

            AND TRIM(
                review_text
            ) <> ''

            AND (
                review_text_ko IS NULL

                OR TRIM(
                    review_text_ko
                ) = ''
            )

        ORDER BY id
        """
    )

    with engine.connect() as conn:

        return (
            conn
            .execute(sql)
            .mappings()
            .all()
        )


# =========================================================
# 3. 텍스트 정리
# =========================================================

def clean_text(
    value,
) -> str:

    if value is None:
        return ""

    value = str(
        value
    ).strip()

    if value.lower() in {
        "nan",
        "none",
        "null",
    }:
        return ""

    return value


# =========================================================
# 4. 리뷰 Batch 번역
# =========================================================

def translate_batch(
    reviews,
) -> dict[int, str]:

    input_reviews = []

    for review in reviews:

        input_reviews.append(
            {
                "id":
                    review["id"],

                "review_text":
                    clean_text(
                        review[
                            "review_text"
                        ]
                    ),
            }
        )


    prompt = f"""
다음은 Amazon 상품 리뷰 데이터입니다.

각 리뷰를 자연스러운 한국어로 번역하세요.

중요 규칙:

1. 원문의 의미를 바꾸지 마세요.
2. 원문에 없는 내용을 추가하지 마세요.
3. 욕설, 불만, 칭찬 등의 표현도 원래 의미를 유지하세요.
4. 상품명이나 브랜드명은 필요하면 원문을 유지하세요.
5. 숫자, 모델명, 단위는 가능한 한 그대로 유지하세요.
6. 지나치게 의역하지 마세요.
7. 리뷰별 id를 절대로 바꾸지 마세요.
8. 반드시 JSON만 반환하세요.
9. 모든 입력 리뷰를 빠짐없이 반환하세요.

입력 리뷰:

{json.dumps(
    input_reviews,
    ensure_ascii=False
)}

반환 형식:

{{
    "reviews": [
        {{
            "id": 1,
            "review_text_ko": "한국어 번역"
        }}
    ]
}}
"""


    response = (
        client.chat.completions.create(
            model=MODEL,

            messages=[
                {
                    "role": "system",
                    "content": (
                        "당신은 전자상거래 상품 리뷰 "
                        "전문 한국어 번역기입니다."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],

            temperature=0,

            response_format={
                "type": "json_object"
            },
        )
    )


    content = (
        response
        .choices[0]
        .message
        .content
    )


    if not content:
        raise RuntimeError(
            "OpenAI 응답이 비어 있습니다."
        )


    data = json.loads(
        content
    )


    translated_reviews = (
        data.get(
            "reviews",
            [],
        )
    )


    result = {}


    for item in translated_reviews:

        review_id = item.get(
            "id"
        )

        review_text_ko = clean_text(
            item.get(
                "review_text_ko"
            )
        )

        if (
            review_id is not None
            and review_text_ko
        ):
            result[
                int(review_id)
            ] = review_text_ko


    return result


# =========================================================
# 5. DB 저장
# =========================================================

def save_batch(
    translations: dict[int, str],
):

    if not translations:
        return


    sql = text(
        """
        UPDATE reviews

        SET
            review_text_ko =
                :review_text_ko

        WHERE id =
            :id
        """
    )


    values = [
        {
            "id":
                review_id,

            "review_text_ko":
                review_text_ko,
        }

        for (
            review_id,
            review_text_ko,
        )
        in translations.items()
    ]


    with engine.begin() as conn:

        conn.execute(
            sql,
            values,
        )


# =========================================================
# 6. 상태 확인
# =========================================================

def show_status():

    sql = text(
        """
        SELECT

            COUNT(*) AS total,

            COUNT(*) FILTER (
                WHERE
                    review_text IS NOT NULL

                    AND TRIM(
                        review_text
                    ) <> ''
            ) AS original_reviews,

            COUNT(*) FILTER (
                WHERE
                    review_text_ko IS NOT NULL

                    AND TRIM(
                        review_text_ko
                    ) <> ''
            ) AS translated_reviews

        FROM reviews
        """
    )


    with engine.connect() as conn:

        result = (
            conn
            .execute(sql)
            .mappings()
            .one()
        )


    print()
    print(
        "========================================"
    )

    print(
        "리뷰 번역 현황"
    )

    print(
        "========================================"
    )

    print(
        f"전체 reviews      : "
        f"{result['total']}"
    )

    print(
        f"원문 있는 reviews : "
        f"{result['original_reviews']}"
    )

    print(
        f"한국어 번역 완료  : "
        f"{result['translated_reviews']}"
    )

    print(
        "========================================"
    )


# =========================================================
# 7. MAIN
# =========================================================

def main():

    print()
    print(
        "========================================"
    )

    print(
        "AMAZON REVIEW KOREAN TRANSLATOR"
    )

    print(
        "========================================"
    )

    print(
        f"Model      : {MODEL}"
    )

    print(
        f"Batch Size : {BATCH_SIZE}"
    )

    print(
        "========================================"
    )


    prepare_column()


    reviews = get_reviews()

    total = len(
        reviews
    )


    if total == 0:

        print(
            "새로 번역할 리뷰가 없습니다."
        )

        show_status()

        return


    print()
    print(
        f"이번 실행 대상: "
        f"{total}개"
    )

    print()


    completed = 0
    failed = 0


    total_batches = (
        total
        +
        BATCH_SIZE
        -
        1
    ) // BATCH_SIZE


    for start in range(
        0,
        total,
        BATCH_SIZE,
    ):

        batch = reviews[
            start:
            start + BATCH_SIZE
        ]


        batch_number = (
            start //
            BATCH_SIZE
        ) + 1


        print(
            f"[Batch "
            f"{batch_number}/"
            f"{total_batches}] "
            f"{len(batch)}개 번역 중..."
        )


        try:

            translations = (
                translate_batch(
                    batch
                )
            )


            # -----------------------------
            # 누락 확인
            # -----------------------------

            expected_ids = {
                int(
                    review["id"]
                )
                for review
                in batch
            }


            returned_ids = set(
                translations.keys()
            )


            missing_ids = (
                expected_ids
                -
                returned_ids
            )


            if missing_ids:

                print(
                    "    일부 번역 누락:"
                )

                print(
                    "    ",
                    sorted(
                        missing_ids
                    ),
                )


            save_batch(
                translations
            )


            completed += len(
                translations
            )


            print(
                f"    저장 완료 "
                f"{completed}/{total}"
            )


        except Exception as error:

            failed += len(
                batch
            )


            print(
                f"    ERROR → "
                f"{error}"
            )

            print(
                "    해당 Batch는 "
                "다음 실행 때 재시도됩니다."
            )


        time.sleep(
            REQUEST_DELAY
        )


    print()
    print(
        "========================================"
    )

    print(
        "리뷰 번역 작업 종료"
    )

    print(
        "========================================"
    )

    print(
        f"이번 실행 번역 성공 : "
        f"{completed}"
    )

    print(
        f"Batch 실패 대상      : "
        f"{failed}"
    )


    show_status()


if __name__ == "__main__":
    main()