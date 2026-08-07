import os
from typing import Any

from langchain_chroma import Chroma
from langchain_community.document_loaders import PyPDFDirectoryLoader, PyPDFLoader
from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_ollama import ChatOllama, OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

from rag.core.config import settings


class RAGService:
    def __init__(self):
        # 1. Initialize Embedding Model via Ollama
        self.embeddings = OllamaEmbeddings(
            base_url=settings.OLLAMA_BASE_URL, model=settings.EMBEDDING_MODEL
        )

        # 2. Initialize LLM via Ollama
        self.llm = ChatOllama(
            base_url=settings.OLLAMA_BASE_URL, model=settings.LLM_MODEL, temperature=0.1
        )

        # 3. Text Splitter Strategy
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE, chunk_overlap=settings.CHUNK_OVERLAP
        )

        # 4. Initialize Vector DB with Persistence
        self.vector_store = Chroma(
            persist_directory=settings.CHROMA_PERSIST_DIR,
            embedding_function=self.embeddings,
        )

    def format_docs(self, docs: list[Document]):
        """Formats retrieved documents into a single text block."""
        return "\n\n".join(doc.page_content for doc in docs)

    def ingest_directory(self) -> int:
        """Reads all PDFs from documents directory and stores vector embeddings."""
        if not os.path.exists(settings.DOCUMENTS_DIR):
            os.makedirs(settings.DOCUMENTS_DIR, exist_ok=True)
            return 0

        loader = PyPDFDirectoryLoader(settings.DOCUMENTS_DIR)
        raw_docs = loader.load()

        if not raw_docs:
            return 0

        chunks = self.text_splitter.split_documents(raw_docs)
        self.vector_store.add_documents(chunks)
        return len(chunks)

    def ingest_single_file(self, file_path: str) -> int:
        """Ingests a single uploaded file."""
        loader = PyPDFLoader(file_path)
        raw_docs = loader.load()
        chunks = self.text_splitter.split_documents(raw_docs)
        self.vector_store.add_documents(chunks)
        return len(chunks)

    def query(self, question: str) -> dict[str, Any]:
        """Performs similarity retrieval and executes LCEL RAG chain."""
        retriever = self.vector_store.as_retriever(
            search_kwargs={
                "k": settings.RETRIEVAL_K,
                "score_threshold": settings.SCORE_THRESHOLD,
            }
        )

        # System Prompt definition
        prompt_template = """You are a helpful and precise assistant. Answer the user's question based strictly on the provided context.
If you do not know the answer or if it's not present in the context, clearly state that you don't know based on the provided documents. Keep answers concise.

Context:
{context}

Question:
{question}

Answer:"""

        prompt = ChatPromptTemplate.from_template(prompt_template)

        # Retrieve docs directly first so we can return metadata back to API client
        retrieved_docs = retriever.invoke(question)

        # Build LCEL (LangChain Expression Language) Pipeline
        rag_chain = (
            {
                "context": lambda x: self.format_docs(retrieved_docs),
                "question": RunnablePassthrough(),
            }
            | prompt
            | self.llm
            | StrOutputParser()
        )

        response_text = rag_chain.invoke(question)

        sources = [
            {"content": doc.page_content, "metadata": doc.metadata}
            for doc in retrieved_docs
        ]

        return {"question": question, "answer": response_text, "sources": sources}


# Global Singleton Service instance
rag_service = RAGService()
