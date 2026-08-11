import os
import shutil

from fastapi import APIRouter, File, HTTPException, UploadFile

from rag.core.config import settings
from rag.schemas.rag import IngestResponse, QueryRequest, QueryResponse
from rag.services.rag_service import rag_service

router = APIRouter()


@router.post("/query", response_model=QueryResponse)
async def query_rag(request: QueryRequest):
    try:
        result = rag_service.query(request.question)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ingest", response_model=IngestResponse)
async def upload_and_ingest(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    # Save incoming file to local documents folder
    os.makedirs(settings.DOCUMENTS_DIR, exist_ok=True)
    file_path = os.path.join(settings.DOCUMENTS_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        chunks_count = rag_service.ingest_single_file(file_path)
        return IngestResponse(
            status="success",
            message=f"File {file.filename} ingested successfully.",
            chunks_added=chunks_count,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to process document: {str(e)}"
        )
