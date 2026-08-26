import gzip
import json
from pathlib import Path
from urllib.request import urlopen

import pandas as pd


# ==========================================
# 설정
# ==========================================

CATEGORY = "All_Beauty"

PRODUCT_LIMIT = 1000
REVIEW_LIMIT = 5000

OUTPUT_DIR = Path("../data")
OUTPUT_DIR.mkdir(exist_ok=True)


META_URL = (
    "https://mcauleylab.ucsd.edu/public_datasets/"
    "data/amazon_2023/raw/meta_categories/"
    f"meta_{CATEGORY}.jsonl.gz"
)

REVIEW_URL = (
    "https://mcauleylab.ucsd.edu/public_datasets/"
    "data/amazon_2023/raw/review_categories/"
    f"{CATEGORY}.jsonl.gz"
)


# ==========================================
# gzip JSONL 스트리밍
# ==========================================

def stream_jsonl_gz(url):
    print(f"연결 중 → {url}")

    response = urlopen(url)

    with gzip.GzipFile(fileobj=response) as gz:
        for raw_line in gz:

            line = raw_line.decode(
                "utf-8",
                errors="ignore",
            )

            if not line.strip():
                continue

            yield json.loads(line)


# ==========================================
# 상품
# ==========================================

print()
print("================================")
print("상품 데이터 수집")
print("================================")

product_rows = []

for item in stream_jsonl_gz(META_URL):

    product_id = item.get("parent_asin")
    title = item.get("title")

    if not product_id or not title:
        continue

    description = item.get("description") or []

    if isinstance(description, list):
        description = " ".join(
            str(value)
            for value in description
            if value
        )

    details = item.get("details")

    # description이 없는 상품은
    # features도 활용
    if not description:

        features = item.get("features") or []

        if isinstance(features, list):
            description = " ".join(
                str(value)
                for value in features
                if value
            )

    categories = item.get("categories") or []

    if isinstance(categories, list):

        category = " > ".join(
            str(value)
            for value in categories
            if value
        )

    else:
        category = str(categories)

    product_rows.append(
        {
            "product_id": product_id,
            "product_name": title,
            "description": description,
            "category": category,
            "price": item.get("price"),
            "brand": item.get("store"),
        }
    )

    if len(product_rows) >= PRODUCT_LIMIT:
        break


products_df = pd.DataFrame(product_rows)

products_df = products_df.drop_duplicates(
    subset=["product_id"]
)

selected_product_ids = set(
    products_df["product_id"]
)

print(
    f"상품 {len(products_df):,}개 수집 완료"
)


# ==========================================
# 리뷰
# ==========================================

print()
print("================================")
print("리뷰 데이터 수집")
print("================================")

review_rows = []

for review in stream_jsonl_gz(REVIEW_URL):

    product_id = review.get("parent_asin")

    # 앞에서 가져온 상품만
    if product_id not in selected_product_ids:
        continue

    review_text = review.get("text")

    if not review_text:
        continue

    review_rows.append(
        {
            "user_id": review.get("user_id"),
            "product_id": product_id,
            "rating": review.get("rating"),
            "review_text": review_text,
        }
    )

    if len(review_rows) >= REVIEW_LIMIT:
        break


reviews_df = pd.DataFrame(review_rows)

print(
    f"리뷰 {len(reviews_df):,}개 수집 완료"
)


# ==========================================
# 리뷰 없는 상품 제거
# ==========================================

if not reviews_df.empty:

    reviewed_product_ids = set(
        reviews_df["product_id"]
    )

    products_df = products_df[
        products_df["product_id"].isin(
            reviewed_product_ids
        )
    ].copy()


# ==========================================
# 저장
# ==========================================

products_path = OUTPUT_DIR / "products.csv"
reviews_path = OUTPUT_DIR / "reviews.csv"

products_df.to_csv(
    products_path,
    index=False,
    encoding="utf-8-sig",
)

reviews_df.to_csv(
    reviews_path,
    index=False,
    encoding="utf-8-sig",
)


print()
print("================================")
print("완료!")
print("================================")

print(
    f"상품 : {len(products_df):,}개"
)

print(
    f"리뷰 : {len(reviews_df):,}개"
)

print(
    f"상품 저장 위치 : {products_path}"
)

print(
    f"리뷰 저장 위치 : {reviews_path}"
)