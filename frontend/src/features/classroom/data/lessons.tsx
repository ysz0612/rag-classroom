import {
    BookOutlined,
    BranchesOutlined,
    CheckCircleOutlined,
    DatabaseOutlined,
    SearchOutlined,
} from "@ant-design/icons";

import type { Lesson } from "../types";

export const lessons: Lesson[] = [
    {
        key: "llm",
        title: "LLM",
        icon: <DatabaseOutlined />,
        pages: ["LLM이란?", "LLM의 한계"],
    },
    {
        key: "rag",
        title: "RAG",
        icon: <BookOutlined />,
        pages: ["RAG란?", "RAG는 어떻게 정보를 찾을까?"],
    },
    {
        key: "keyword",
        title: "Keyword RAG",
        icon: <SearchOutlined />,
        pages: [
            "정확한 명칭에는 어떤 검색이 필요할까?",
            "Keyword RAG의 상품 선택 과정",
            "Keyword RAG의 활용 분야와 한계",
        ],
    },
    {
        key: "vector",
        title: "Vector RAG",
        icon: <BranchesOutlined />,
        pages: [
            "표현이 달라도 의미를 찾으려면?",
            "Vector RAG의 활용 분야와 한계",
        ],
    },
    {
        key: "graph",
        title: "Graph RAG",
        icon: <BranchesOutlined />,
        pages: [
            "질문에 없는 관계는 어디에서 찾을까?",
            "Graph RAG의 상품 선택 과정",
            "Graph RAG의 활용 분야와 한계",
        ],
    },
    {
        key: "summary",
        title: "수업 요약",
        icon: <CheckCircleOutlined />,
        pages: ["RAG 수업 요약"],
    },
];
