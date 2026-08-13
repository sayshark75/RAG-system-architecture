from typing import Any

from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    question: str = Field(..., examples=["What is risk management?"])


class DocumentSource(BaseModel):
    content: str
    metadata: dict[str, Any]


class QueryResponse(BaseModel):
    question: str
    answer: str
    sources: list[DocumentSource]


class IngestResponse(BaseModel):
    status: str
    message: str
    chunks_added: int
