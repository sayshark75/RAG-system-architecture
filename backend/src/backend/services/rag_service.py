import os
from typing import Any

from backend.config.settings import settings
from langchain_chroma import Chroma
from langchain_community.document_loaders import PyPDFDirectoryLoader, PyPDFLoader
from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_ollama import ChatOllama, OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter


class RAGService:
    def __init__(self):
        # 1. Initialize Embedding Model via Ollama
        self.embeddings = OllamaEmbeddings(
            base_url=settings.OLLAMA_BASE_URL, model=settings.EMBEDDING_MODEL
        )

        # 2. Initialize LLM via Ollama
        self.llm = ChatOllama(
            base_url=settings.OLLAMA_BASE_URL,
            model=settings.LLM_MODEL,
            temperature=0.1,
            reasoning=False,
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
            print("No ./documents directory found, creating one...")
            os.makedirs(settings.DOCUMENTS_DIR, exist_ok=True)
            return 0
        print("initialized PDF loader")
        loader = PyPDFDirectoryLoader(settings.DOCUMENTS_DIR)
        print("Loading PDF pages as list of documents...")
        raw_docs = loader.load()
        print(f"Loaded the list of documents {len(raw_docs)} ")

        if not raw_docs:
            print("No raw documents found...")
            return 0
        print("recursively splitting the documents into chunks...")
        chunks = self.text_splitter.split_documents(raw_docs)
        print("converting all chunks into embeddings and storing into the vector db...")
        self.vector_store.add_documents(chunks)
        return len(chunks)

    def ingest_single_file(self, file_path: str) -> int:
        """Ingests a single uploaded file."""
        print("Loading the PDF file...")
        loader = PyPDFLoader(file_path)
        raw_docs = loader.load()
        print(f"found {len(raw_docs)} pages in the file...")
        print("generating the chunks...")
        chunks = self.text_splitter.split_documents(raw_docs)
        print(f"Adding {len(chunks)} chunks to the vector store...")
        self.vector_store.add_documents(chunks)
        return len(chunks)

    async def query(self, question: str) -> dict[str, Any]:
        print(
            f"getting a retriver for the database query for top {settings.RETRIEVAL_K} chunks."
        )
        """Performs similarity retrieval and executes LCEL RAG chain."""
        retriever = self.vector_store.as_retriever(
            search_kwargs={
                "k": settings.RETRIEVAL_K,
            }
        )

        print("the template is ready to serve information to LLM")

        # System Prompt definition
        prompt_template = """You are a helpful and precise assistant. Answer the user's question based strictly on the provided context.
If you do not know the answer or if it's not present in the context, clearly state that you don't know based on the provided documents. Keep answers concise.

Context:
{context}

Question:
{question}

Answer:"""

        print("generating a prompt object instance...")
        prompt = ChatPromptTemplate.from_template(prompt_template)
        print(" retriving the docs relevant to the question")

        # Retrieve docs directly first so we can return metadata back to API client
        retrieved_docs = await retriever.ainvoke(question)

        print(f"found {len(retrieved_docs)} chunks...")

        # Build LCEL (LangChain Expression Language) Pipeline
        print("On the rag chain pipeline")
        rag_chain = (
            {
                "context": lambda x: self.format_docs(retrieved_docs),
                "question": RunnablePassthrough(),
            }
            | prompt
            | self.llm
            | StrOutputParser()
        )

        response_text = await rag_chain.ainvoke(question)
        print("Performed LCEL chain...")
        sources = [
            {"content": doc.page_content, "metadata": doc.metadata}
            for doc in retrieved_docs
        ]

        return {"question": question, "answer": response_text, "sources": sources}


# Global Singleton Service instance
rag_service = RAGService()
