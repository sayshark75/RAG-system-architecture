from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Production RAG Service"

    # Ollama Config
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    LLM_MODEL: str = "qwen3.5:4b"
    EMBEDDING_MODEL: str = "nomic-embed-text"

    # RAG Config
    DOCUMENTS_DIR: str = "./documents"
    CHROMA_PERSIST_DIR: str = "./chroma_db"
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 100
    RETRIEVAL_K: int = 3
    SCORE_THRESHOLD: float = 0.6

    class Config:
        env_file = ".env"


settings = Settings()
