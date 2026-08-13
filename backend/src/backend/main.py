from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.endpoints import rag
from backend.cli import cli
from backend.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME, docs_url="/docs")

# CORS Middleware (Useful for connecting to a React Frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include RAG Routers
app.include_router(rag.router, prefix="/api/v1", tags=["RAG"])

if __name__ == "__main__":
    cli()
