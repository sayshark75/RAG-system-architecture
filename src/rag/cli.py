from typer import Typer

from rag.services.rag_service import rag_service

cli = Typer()


@cli.command("ingest")
def ingest():
    print("Document ingestion is in progress...")
    chunks = rag_service.ingest_directory()
    print(f"Ingested {chunks} chunks")


@cli.command("test")
def test():
    print("CLI - Ping - Pong ...")
