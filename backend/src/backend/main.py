from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.cli import cli
from backend.config.settings import settings
from backend.handlers.exception_handlers import registerErrorHandlers
from backend.routes.rag_routes import router

app = FastAPI(title=settings.PROJECT_NAME, docs_url="/docs")

# CORS Middleware (Useful for connecting to a React Frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register the Error Handlers
registerErrorHandlers(app)

# Include RAG Routers
app.include_router(router, prefix="/api/v1", tags=["RAG"])

if __name__ == "__main__":
    cli()
