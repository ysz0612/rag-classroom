import os

from fastapi import FastAPI

from app.auth.router import (
    router as auth_router,
)

from app.db.neo4j import check_neo4j
from app.db.postgres import check_postgres
from app.db.redis import check_redis

from app.rag.graph.router import (
    router as graph_router,
)

from app.rag.keyword.router import (
    router as keyword_router,
)

from app.rag.vector.router import (
    router as vector_router,
)

from app.voice.router import (
    router as voice_router,
)

from fastapi.middleware.cors import CORSMiddleware

from app.rag.compare.router import (
    router as compare_router,
)

# ==========================================
# FastAPI
# ==========================================

app = FastAPI(
    title="RAG Learning API",
)


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 기본 API
# ==========================================

@app.get("/")
def root():
    return {
        "message": "RAG Learning Backend"
    }


# ==========================================
# Health Check
# ==========================================

@app.get("/health")
def health():

    postgres_status = False
    neo4j_status = False
    redis_status = False

    try:
        postgres_status = check_postgres()

    except Exception as e:
        print(
            "PostgreSQL error:",
            e,
        )

    try:
        neo4j_status = check_neo4j()

    except Exception as e:
        print(
            "Neo4j error:",
            e,
        )

    try:
        redis_status = check_redis()

    except Exception as e:
        print(
            "Redis error:",
            e,
        )

    return {
        "backend": "ok",

        "postgres": (
            "connected"
            if postgres_status
            else "error"
        ),

        "neo4j": (
            "connected"
            if neo4j_status
            else "error"
        ),

        "redis": (
            "connected"
            if redis_status
            else "error"
        ),
    }


# ==========================================
# Router
# ==========================================

app.include_router(
    auth_router
)

app.include_router(
    keyword_router
)

app.include_router(
    vector_router
)

app.include_router(
    graph_router
)
app.include_router(
    voice_router,
)
app.include_router(
    compare_router
)
