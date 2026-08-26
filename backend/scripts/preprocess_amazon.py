from pathlib import Path
import re

import pandas as pd


DATA_DIR = Path("../data")

PRODUCTS_PATH = DATA_DIR / "products.csv"
REVIEWS_PATH = DATA_DIR / "reviews.csv"

CLEAN_PRODUCTS_PATH = DATA_DIR / "products_clean.csv"
CLEAN_REVIEWS_PATH = DATA_DIR / "reviews_clean.csv"


# --------------------------------
# 텍스트 정리 함수
# --------------------------------
def clean_text(value):
    if pd.isna(value):
        return ""

    value = str(value)

    # HTML 태그 제거
    value = re.sub(r"<[^>]+>", " ", value)

    # 줄바꿈 / 탭 제거
    value = value.replace("\n", " ")
    value = value.replace("\r", " ")
    value = value.replace("\t", " ")

    # 공백 여러 개 → 하나
    value = re.sub(r"\s+", " ", value)

    return value.strip()


# --------------------------------
# 상품 데이터
# --------------------------------
products = pd.read_csv(PRODUCTS_PATH)

print("원본 상품:", len(products))


# 중복 제거
products = products.drop_duplicates(
    subset=["product_id"]
)


# 상품명 없는 데이터 제거
products["product_name"] = (
    products["product_name"]
    .apply(clean_text)
)

products = products[
    products["product_name"] != ""
]


# 설명 정리
products["description"] = (
    products["description"]
    .apply(clean_text)
)


# 브랜드 정리
products["brand"] = (
    products["brand"]
    .apply(clean_text)
)


# 카테고리 정리
products["category"] = (
    products["category"]
    .apply(clean_text)
)


# 가격 숫자 변환
products["price"] = pd.to_numeric(
    products["price"],
    errors="coerce",
)


# 비정상 가격 제거
products.loc[
    products["price"] <= 0,
    "price"
] = None


# --------------------------------
# 리뷰 데이터
# --------------------------------
reviews = pd.read_csv(REVIEWS_PATH)

print("원본 리뷰:", len(reviews))


# 필수값 제거
reviews = reviews.dropna(
    subset=[
        "user_id",
        "product_id",
        "review_text",
    ]
)


# 리뷰 텍스트 정리
reviews["review_text"] = (
    reviews["review_text"]
    .apply(clean_text)
)


# 너무 짧은 리뷰 제거
reviews = reviews[
    reviews["review_text"].str.len() >= 20
]


# 평점 숫자 변환
reviews["rating"] = pd.to_numeric(
    reviews["rating"],
    errors="coerce",
)


# 1~5점만
reviews = reviews[
    reviews["rating"].between(
        1,
        5,
        inclusive="both",
    )
]


# 완전히 동일한 리뷰 중복 제거
reviews = reviews.drop_duplicates(
    subset=[
        "user_id",
        "product_id",
        "review_text",
    ]
)


# --------------------------------
# 리뷰 없는 상품 제거
# --------------------------------
reviewed_product_ids = set(
    reviews["product_id"]
)

products = products[
    products["product_id"].isin(
        reviewed_product_ids
    )
]


# 반대로 상품이 없는 리뷰도 제거
valid_product_ids = set(
    products["product_id"]
)

reviews = reviews[
    reviews["product_id"].isin(
        valid_product_ids
    )
]


# --------------------------------
# RAG용 통합 텍스트 생성
# --------------------------------
products["search_text"] = (
    products["product_name"].fillna("")
    + " "
    + products["brand"].fillna("")
    + " "
    + products["category"].fillna("")
    + " "
    + products["description"].fillna("")
)

products["search_text"] = (
    products["search_text"]
    .apply(clean_text)
)


# --------------------------------
# 저장
# --------------------------------
products.to_csv(
    CLEAN_PRODUCTS_PATH,
    index=False,
    encoding="utf-8-sig",
)

reviews.to_csv(
    CLEAN_REVIEWS_PATH,
    index=False,
    encoding="utf-8-sig",
)


print()
print("==============================")
print("전처리 완료")
print("==============================")

print(
    f"상품 : {len(products):,}개"
)

print(
    f"리뷰 : {len(reviews):,}개"
)

print(
    f"상품 → {CLEAN_PRODUCTS_PATH}"
)

print(
    f"리뷰 → {CLEAN_REVIEWS_PATH}"
)