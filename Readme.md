# Local RAG System

A local-first Retrieval-Augmented Generation (RAG) application to ingest PDF documents, store vector embeddings in ChromaDB, and query them using a local LLM via FastAPI and Ollama.

---

## 📋 Prerequisites

- **Python 3.10+** & **Node.js 22+**
- **[uv](https://docs.astral.sh/uv/)** (Python package manager)
- **[Ollama](https://ollama.com/)** running locally

Pull the required Ollama models:

```bash
ollama pull nomic-embed-text
ollama pull qwen3.5:4b
```

---

## ⚙️ Quickstart

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/RAG-system-architecture.git
cd RAG-system-architecture
```

### 2. Backend Setup (FastAPI + uv)

1. **Install dependencies:**

   ```bash
   uv sync
   ```

2. **Configure environment variables:** Create a `.env` file in the root directory:

   ```env
   PROJECT_NAME=RAG System
   OLLAMA_BASE_URL=http://localhost:11434
   LLM_MODEL=qwen3.5:4b
   EMBEDDING_MODEL=nomic-embed-text
   DOCUMENTS_DIR=documents
   CHROMA_PERSIST_DIR=chroma
   CHUNK_SIZE=500
   CHUNK_OVERLAP=100
   RETRIEVAL_K=3
   ```

3. **Start the FastAPI server:**

   ```bash
   uv run fastapi dev ./src/backend/main.py
   ```

   - Backend API: `http://127.0.0.1:8000`
   - Swagger Docs: `http://127.0.0.1:8000/docs`

---

### 3. Frontend Setup

In a new terminal window:

```bash
# Install frontend dependencies
npm install

# Start the dev server
npm run dev
```

Open the printed localhost URL in your browser to start uploading PDFs and asking questions.

### 📅 15 Aug 2026

**Update:** Improved concurrent request handling by using LangChain's async APIs for query operations and AnyIO worker threads for blocking file I/O and PDF ingestion operations.

The following experiment compares the behavior with and without async APIs and worker-thread offloading:

| Run 1 — Async + Worker Thread Offloading                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Run 2 — Without Async/Thread Offloading                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `getting a retriever for the database query for top 5 chunks.`<br>`the template is ready to serve information to LLM`<br>`generating a prompt object instance...`<br>`retrieving the docs relevant to the question`<br><br>`Ingesting user-info-15-pages.pdf ...`<br>`checking the /document directory...`<br>`file path..../documents\user-info-15-pages.pdf`<br>`opening file handlers...`<br>`Loading the PDF file...`<br>`found 15 pages in the file...`<br>`generating the chunks...`<br>`Adding 70 chunks to the vector store...`<br><br>`found 5 chunks...`<br>`On the rag chain pipeline`<br>`▕ 127.0.0.1:61236 - "POST /api/v1/ingest HTTP/1.1" 200`<br>`Performed LCEL chain...`<br>`▕ 127.0.0.1:59313 - "POST /api/v1/query HTTP/1.1" 200` | `getting a retriever for the database query for top 5 chunks.`<br>`the template is ready to serve information to LLM`<br>`generating a prompt object instance...`<br>`retrieving the docs relevant to the question`<br>`found 5 chunks...`<br>`On the rag chain pipeline`<br>`Performed LCEL chain...`<br>`▕ 127.0.0.1:58672 - "POST /api/v1/query HTTP/1.1" 200`<br><br>`Ingesting user-info-15-pages.pdf ...`<br>`checking the /document directory...`<br>`file path..../documents\user-info-15-pages.pdf`<br>`opening file handlers...`<br>`Loading the PDF file...`<br>`found 15 pages in the file...`<br>`generating the chunks...`<br>`Adding 70 chunks to the vector store...`<br>`▕ 127.0.0.1:56151 - "POST /api/v1/ingest HTTP/1.1" 200` |

**Observation:** In Run 1, the query and ingestion operations were able to make progress concurrently. In Run 2, without async APIs and worker-thread offloading, the blocking operations progressed sequentially.

### Concurrency decision checklist

- Is this function blocking?
- Does it have an async version?
- If not, should I offload it to a worker thread?
- Is the workload I/O-bound or CPU-bound?
- Is a thread enough, or do I need a queue/worker system?
