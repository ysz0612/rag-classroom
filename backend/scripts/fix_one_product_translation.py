from sqlalchemy import text

from app.db.postgres import engine


PRODUCT_ID = "B07DWMKCFD"


PRODUCT_NAME_KO = (
    "angel3292 빈티지 인조 진주 조개 펜던트 "
    "후크 귀걸이 여성용 선물 연회 액세서리"
)


DESCRIPTION_KO = (
    "조개 모양 디자인에 인조 진주를 사용한 빈티지 스타일 여성용 귀걸이입니다. "
    "독특한 디자인으로 일상 착용이나 생일, 밸런타인데이, 우정 선물 등에 적합합니다. "
    "합금과 인조 진주 소재로 제작되었으며 결혼식, 저녁 파티, 연회, 데이트, 클럽 등 "
    "다양한 장소에서 사용할 수 있습니다. 크기는 약 1.9cm x 2.5cm입니다. "
    "조명과 화면 설정에 따라 실제 색상이 사진과 다르게 보일 수 있으며, "
    "수동 측정으로 인해 크기에 약간의 오차가 있을 수 있습니다. "
    "구성품은 귀걸이 1쌍입니다."
)


CATEGORY_KO = (
    "패션 / 코스튬 액세서리"
)


BRAND = "Angel3292"


SEARCH_TEXT_KO = " ".join(
    [
        PRODUCT_NAME_KO,
        DESCRIPTION_KO,
        BRAND,
        CATEGORY_KO,
    ]
)


def main():

    sql = text(
        """
        UPDATE products
        SET
            product_name_ko = :product_name_ko,
            description_ko = :description_ko,
            category_ko = :category_ko,
            search_text_ko = :search_text_ko
        WHERE product_id = :product_id
        """
    )


    with engine.begin() as conn:

        result = conn.execute(
            sql,
            {
                "product_id":
                    PRODUCT_ID,

                "product_name_ko":
                    PRODUCT_NAME_KO,

                "description_ko":
                    DESCRIPTION_KO,

                "category_ko":
                    CATEGORY_KO,

                "search_text_ko":
                    SEARCH_TEXT_KO,
            },
        )


    print()
    print("=" * 60)

    print(
        "누락 상품 한국어 데이터 보정 완료"
    )

    print("=" * 60)

    print(
        f"product_id : {PRODUCT_ID}"
    )

    print(
        f"수정 행 수 : {result.rowcount}"
    )

    print(
        f"상품명     : {PRODUCT_NAME_KO}"
    )

    print(
        f"카테고리   : {CATEGORY_KO}"
    )

    print("=" * 60)


if __name__ == "__main__":
    main()