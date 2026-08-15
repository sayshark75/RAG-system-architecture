import os
import shutil
from typing import Annotated

import anyio
from backend.config.settings import settings
from backend.services.rag_service import rag_service
from backend.types.rag import IngestResponse, QueryRequest, QueryResponse
from fastapi import APIRouter, File, HTTPException, UploadFile

router = APIRouter()


def copyFileUtil(file: UploadFile, file_path: str):
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)


@router.post("/query", response_model=QueryResponse)
async def query_rag(request: QueryRequest):
    result = await rag_service.query(request.question)
    return result


@router.post("/ingest", response_model=IngestResponse)
async def upload_and_ingest(file: Annotated[UploadFile, File(...)]):

    print(f"Ingesting {file.filename} ...")
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    print("checking the /document directory...")
    # Save incoming file to local documents folder
    os.makedirs(settings.DOCUMENTS_DIR, exist_ok=True)
    file_path = os.path.join(settings.DOCUMENTS_DIR, file.filename)
    print(f"file path...{file_path}")
    print("opening file handlers...")
    await anyio.to_thread.run_sync(copyFileUtil, file, file_path)
    chunks_count = await anyio.to_thread.run_sync(
        rag_service.ingest_single_file, file_path
    )
    return IngestResponse(
        status="success",
        message=f"File {file.filename} ingested successfully.",
        chunks_added=chunks_count,
    )
