Here is a professional, production-ready `README.md` file tailored to the project you just built. You can save this directly into the root directory of your repository.

---

# 🚀 Local Production-Ready RAG API

A modular, production-ready **Retrieval-Augmented Generation (RAG)** backend built with **FastAPI**, **LangChain (LCEL)**, **ChromaDB**, and **Ollama**.

This application runs completely offline on local hardware using `qwen2.5` for text generation and `nomic-embed-text` for vector embeddings.

---

## 📌 Features

- ⚡ **FastAPI Framework:** Asynchronous, high-performance API with built-in OpenAPI/Swagger documentation.
- 🤖 **100% Local Execution:** Uses **Ollama** for privacy-focused, zero-cost LLM generation and embeddings.
- 🔄 **Automatic Startup Ingestion:** Auto-loads, chunks, and indexes all PDFs inside the `./documents` folder upon server launch.
- 📂 **Dynamic Ingestion Endpoint:** Upload and index new PDF documents on the fly via HTTP.
- 🔍 **Context-Grounded QA Endpoint:** Retrieves top matching chunks and returns source metadata alongside generated answers to prevent hallucinations.
- 🧱 **Modular Clean Architecture:** Designed with separation of concerns (Config, Schemas, Services, Endpoints) similar to NestJS/Express enterprise patterns.

---

## 🏗️ Architecture Overview

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│                 │       │                  │       │                 │
│   PDF Upload    ├──────►│ Recursive Text   ├──────►│  Ollama Embed   │
│  / Startup Docs │       │    Splitter      │       │(nomic-embed-text)
│                 │       │                  │       │                 │
└─────────────────┘       └──────────────────┘       └────────┬────────┘
                                                              │
                                                              ▼
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│                 │       │                  │       │                 │
│   FastAPI QA    │◄──────┤   Ollama LLM     │◄──────┤  Chroma Vector  │
│    Response     │       │   (qwen2.5:3b)   │       │    Database     │
│                 │       │                  │       │                 │
└─────────────────┘       └──────────────────┘       └─────────────────┘
```

---

## 📁 Project Structure

```text
rag-backend/
├── app/
│   ├── api/
│   │   └── endpoints/
│   │       └── rag.py          # HTTP API routes (/ingest, /query)
│   ├── core/
│   │   └── config.py       # Pydantic environment configurations
│   ├── schemas/
│   │   └── rag.py          # Input/Output validation models
│   ├── services/
│   │   └── rag_service.py  # Core RAG engine logic (LangChain + Chroma)
│   └── main.py             # FastAPI entrypoint & startup lifespan hooks
├── documents/              # Directory for PDFs auto-indexed on startup
├── chroma_db/              # Persistent local vector database store
├── .env                    # Environment settings
├── requirements.txt        # Python dependency list
└── README.md
```

---

## 🛠️ Prerequisites

1. **Python 3.10+** installed on your system.
2. **Ollama** installed and running locally. Download from [ollama.com](https://ollama.com).

Pull the required local models before starting the application:

```bash
# Pull the embedding model
ollama pull nomic-embed-text

# Pull the text generation model
ollama pull qwen2.5:3b
```

---

## ⚙️ Setup & Installation

### 1. Clone the Repository & Navigate to Directory

```bash
git clone <your-repo-url>
cd rag-backend
```

### 2. Set Up Python Virtual Environment

```bash
# macOS/Linux
python3 -m venv venv
source venv/bin/activate

# Windows (PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Create Requirements File (if creating from scratch)

Ensure your `requirements.txt` contains:

```text
fastapi
uvicorn
pydantic-settings
langchain
langchain-community
langchain-ollama
langchain-chroma
pypdf
python-multipart
```

### 5. Add Initial Documents

Place any initial PDF files you want pre-indexed into the `./documents` folder.

---

## 🚀 Running the Server

Start the FastAPI application:

```bash
python -m app.main
```

Or run using `uvicorn` directly:

```bash
uvicorn app.main:app --reload --port 8000
```

Once running, access the interactive API docs at:

- **Interactive Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Documentation:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 📡 API Endpoints & Usage

### 1. Query the RAG System

- **Endpoint:** `POST /api/v1/query`
- **Content-Type:** `application/json`

**Request Body:**

```json
{
  "question": "What is risk management?"
}
```

**Response Example:**

```json
{
  "question": "What is risk management?",
  "answer": "Risk management is the process of identifying, assessing, and controlling financial, legal, strategic, and security risks to an organization's capital and earnings.",
  "sources": [
    {
      "content": "Risk management involves evaluating potential loss scenarios...",
      "metadata": {
        "source": "documents/insurance_guide.pdf",
        "page": 4
      }
    }
  ]
}
```

---

### 2. Ingest New Documents Dynamically

- **Endpoint:** `POST /api/v1/ingest`
- **Content-Type:** `multipart/form-data`

**cURL Example:**

```bash
curl -X 'POST' \
  'http://localhost:8000/api/v1/ingest' \
  -H 'accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@/path/to/document.pdf'
```

**Response Example:**

```json
{
  "status": "success",
  "message": "File document.pdf ingested successfully.",
  "chunks_added": 24
}
```

---

## ⚙️ Configuration Variables

You can customize parameters by creating a `.env` file in the root folder:

```env
PROJECT_NAME="Production Local RAG Service"
OLLAMA_BASE_URL="http://localhost:11434"
LLM_MODEL="qwen2.5:3b"
EMBEDDING_MODEL="nomic-embed-text"
DOCUMENTS_DIR="./documents"
CHROMA_PERSIST_DIR="./chroma_db"
CHUNK_SIZE=500
CHUNK_OVERLAP=100
RETRIEVAL_K=3
```

---

## 🔮 Future Enhancements Roadmap

- [ ] Add Redis/Celery for handling large PDF ingestion as background tasks.
- [ ] Add cross-encoder reranking (`bge-reranker-large`) for higher retrieval precision.
- [ ] Add chat session memory support for multi-turn conversations.
- [ ] Integrate LangFuse / Phoenix tracing for observability.
