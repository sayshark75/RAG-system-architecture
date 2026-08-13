<div align="center">

# RAG System Architecture

> A local-first Retrieval-Augmented Generation (RAG) system for ingesting PDF documents, converting them into vector embeddings, retrieving semantically relevant context, and generating grounded answers using a locally running LLM.

This project is built to understand and implement the **complete RAG pipeline from document ingestion to user-facing question answering**.

Instead of sending private documents to external AI APIs, the system keeps the RAG workflow local by using **FastAPI, LangChain, ChromaDB, and Ollama**. A modern **Next.js frontend** provides an interface for ingesting documents and asking questions about their contents.

The project focuses on understanding the architecture behind production-style RAG systems while keeping the entire stack modular, replaceable, and easy to run locally.

</div>

---

## ✨ What This Project Does

The system allows users to:

- 📄 Ingest PDF documents
- ✂️ Split documents into manageable chunks
- 🧠 Generate vector embeddings for each chunk
- 🗄️ Store embeddings in ChromaDB
- 🔎 Perform semantic similarity search
- 🤖 Retrieve relevant document context
- 💬 Ask natural-language questions
- 🧩 Pass retrieved context to a local LLM
- 📚 Return the generated answer along with source chunks
- 🌐 Interact with the RAG system through a Next.js frontend

The application is intentionally **domain-agnostic**.

It can be used with:

- Technical documentation
- Research papers
- Books
- Project documentation
- Manuals
- Notes
- Internal documents
- Knowledge bases
- Any other supported PDF-based knowledge source

This is **not** a resume analyzer or HR chatbot. It is a general-purpose **document context provider**.

---

# 🧠 RAG Architecture

The core architecture follows the standard Retrieval-Augmented Generation pipeline:

```text
                         DOCUMENT INGESTION
                                │
                                ▼
                        ┌───────────────┐
                        │   PDF Files   │
                        └───────┬───────┘
                                │
                                ▼
                     ┌─────────────────────┐
                     │  Document Loader    │
                     │    (LangChain)      │
                     └──────────┬──────────┘
                                │
                                ▼
                     ┌─────────────────────┐
                     │   Text Chunking     │
                     │                     │
                     │ Chunk Size: 500     │
                     │ Overlap: 100        │
                     └──────────┬──────────┘
                                │
                                ▼
                     ┌─────────────────────┐
                     │ Embedding Model     │
                     │  Ollama Embeddings  │
                     └──────────┬──────────┘
                                │
                                ▼
                     ┌─────────────────────┐
                     │     ChromaDB        │
                     │   Vector Database   │
                     └──────────┬──────────┘
                                │
                                │
══════════════════════════════════════════════════════════
                                │
                         USER QUESTION
                                │
                                ▼
                     ┌─────────────────────┐
                     │    User Query      │
                     └──────────┬──────────┘
                                │
                                ▼
                     ┌─────────────────────┐
                     │ Query Embedding     │
                     └──────────┬──────────┘
                                │
                                ▼
                     ┌─────────────────────┐
                     │ Semantic Retrieval  │
                     │     ChromaDB        │
                     └──────────┬──────────┘
                                │
                                ▼
                     ┌─────────────────────┐
                     │ Relevant Chunks     │
                     └──────────┬──────────┘
                                │
                                ▼
                     ┌─────────────────────┐
                     │ Prompt Construction │
                     │                     │
                     │ Question + Context │
                     └──────────┬──────────┘
                                │
                                ▼
                     ┌─────────────────────┐
                     │     Ollama LLM      │
                     └──────────┬──────────┘
                                │
                                ▼
                     ┌─────────────────────┐
                     │ Answer + Sources    │
                     └─────────────────────┘
```

---

# 🔄 RAG Workflow

## 1. Document Ingestion

The user uploads a PDF through the frontend.

```text
PDF
 ↓
FastAPI /ingest
 ↓
LangChain Document Loader
```

The backend extracts the textual content and associated metadata such as:

- Page number
- Source file
- Total pages
- Creation date
- Modification date
- PDF metadata

---

## 2. Document Chunking

Large documents are divided into smaller chunks using a text splitter.

Example configuration:

```python
chunk_size = 500
chunk_overlap = 100
```

The overlap helps preserve contextual continuity between neighboring chunks.

For example:

```text
Chunk 1
────────────────────
A B C D E F G H I J
              │
              │ overlap
              ▼
Chunk 2
────────────────────
              F G H I J K L M N O
```

---

## 3. Embedding Generation

Each document chunk is converted into a numerical vector representation using a local embedding model.

Example:

```text
Document Chunk
      ↓
Embedding Model
      ↓
Vector
```

The vector represents the semantic meaning of the chunk.

This allows the system to search based on **meaning rather than exact keyword matching**.

---

## 4. Vector Storage

The generated embeddings are stored in **ChromaDB**.

Conceptually:

```text
Chunk
 ├── Content
 ├── Embedding
 └── Metadata
```

ChromaDB becomes the searchable vector knowledge base.

---

# 🔎 Query Workflow

When the user asks a question:

```json
{
  "question": "who is sharuk?"
}
```

the question follows another embedding and retrieval pipeline.

```text
User Question
      ↓
Query Embedding
      ↓
ChromaDB Semantic Search
      ↓
Top-K Relevant Chunks
      ↓
Prompt Construction
      ↓
Local LLM
      ↓
Generated Answer
      +
Source Chunks
```

The system does not simply ask the LLM:

```text
"Who is Sharuk?"
```

Instead, it provides retrieved document context:

```text
Question:
Who is Sharuk?

Relevant Context:
[retrieved document chunks...]

Answer using the provided context.
```

This helps ground the generated response in the user's own documents.

---

# 📡 API

The backend exposes two primary endpoints.

## `POST /ingest`

Used to ingest a PDF document.

The request uses:

```text
multipart/form-data
```

with a PDF file.

The backend performs:

```text
PDF
 ↓
Document Extraction
 ↓
Chunking
 ↓
Embedding Generation
 ↓
ChromaDB Storage
```

---

## `POST /query`

Used to query the vector knowledge base.

Request:

```json
{
  "question": "who is sharuk?"
}
```

Example response:

```json
{
  "question": "who is sharuk?",
  "answer": "Sharuk Sayyed is a Full Stack Developer and AI Product Engineer...",
  "sources": [
    {
      "content": "Relevant document content...",
      "metadata": {
        "page": 0,
        "page_label": "1",
        "source": "./documents/example.pdf",
        "total_pages": 15
      }
    }
  ]
}
```

The response contains both:

- Generated answer
- Retrieved source chunks

This makes the generated response more transparent and allows the user to inspect the context used by the RAG pipeline.

---

# 🖥️ Frontend

The project includes a modern frontend built specifically for interacting with the local RAG backend.

### Frontend Stack

- **Vite.js**
- **TypeScript**
- **Tailwind CSS**
- **TanStack Query**

The frontend provides two primary workflows:

```text
Document Ingestion
        │
        ▼
     /ingest


Question
        │
        ▼
      /query
        │
        ▼
 Answer + Sources
```

---

## Frontend Features

### 📄 PDF Ingestion

Users can:

- Select a PDF
- Drag and drop a PDF
- Validate the file type
- View selected file information
- Start ingestion
- View loading state
- View success/error state

---

### 💬 Document Query

Users can ask natural-language questions such as:

```text
What are the main topics in this document?
```

```text
Summarize the document.
```

```text
What technologies are mentioned?
```

```text
What are the key findings?
```

The frontend sends the question to:

```text
POST /query
```

and renders the returned answer and sources.

---

### 📚 Source Inspection

Every query response can contain retrieved source chunks.

The frontend displays:

- Source number
- File name
- Page
- Relevant content
- Metadata

This allows users to understand **which parts of the document were retrieved to answer the question**.

---

# 🛠️ Technology Stack

| Technology            | Purpose                                      |
| :-------------------- | :------------------------------------------- |
| **Python**            | Backend and RAG implementation               |
| **FastAPI**           | REST API layer                               |
| **LangChain**         | Document processing and RAG orchestration    |
| **Ollama**            | Local LLM and embedding inference            |
| **ChromaDB**          | Local vector database                        |
| **Pydantic Settings** | Configuration management                     |
| **uv**                | Python dependency and environment management |
| **Vite.js**           | Frontend application                         |
| **TypeScript**        | Frontend type safety                         |
| **Tailwind CSS**      | UI styling                                   |
| **TanStack Query**    | Server/API state management                  |

---

# 🤖 Local AI Models

The project is designed around local models through Ollama.

Two different model responsibilities are involved:

### Embedding Model

Used for converting text into vectors.

Example:

```text
nomic-embed-text
```

### Generation Model

Used for generating the final answer.

Example:

```text
qwen3.5:4b
```

The embedding model and generation model serve different purposes and can be replaced independently.

---

# 🔐 Local-First Architecture

One of the main goals of this project is keeping the AI workflow local.

```text
┌─────────────────────────────────────────┐
│              Local Machine              │
│                                         │
│  Vite.js Frontend                       │
│          │                              │
│          ▼                              │
│  FastAPI Backend                        │
│          │                              │
│     ┌────┴─────┐                        │
│     ▼          ▼                        │
│ LangChain    Ollama                     │
│     │          │                        │
│     ▼          ▼                        │
│ ChromaDB    Local LLM                   │
│                                         │
└─────────────────────────────────────────┘
```

This architecture can provide:

- Better privacy for local documents
- No mandatory cloud LLM dependency
- Lower API costs during experimentation
- Offline-capable AI workflows when the required models are available locally
- Full control over the RAG pipeline

---

# ⚙️ Operational Setup

## Prerequisites

Make sure the following are installed:

- Python 3.9+
- Node.js
- npm
- uv
- Ollama

---

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/RAG-system-architecture.git

cd RAG-system-architecture
```

---

# 🐍 Backend Setup

Install Python dependencies:

```bash
uv sync
```

Create your environment configuration based on the project's settings.

Example:

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

Make sure Ollama is running and the required models are available locally.

---

# 📥 Document Ingestion

Documents can be ingested through the API or the frontend.

For the API:

```http
POST /ingest
```

The ingestion process performs:

```text
PDF
 ↓
Loader
 ↓
Text Extraction
 ↓
Chunking
 ↓
Embeddings
 ↓
ChromaDB
```

The frontend provides a user-friendly interface for this process.

---

# 🚀 Start the Backend

Run the FastAPI application:

```bash
uv run fastapi dev ./src/backend/main.py
```

The API will be available at:

```text
http://127.0.0.1:8000
```

FastAPI interactive documentation:

```text
http://127.0.0.1:8000/docs
```

---

# 🌐 Start the Frontend

Install frontend dependencies:

```bash
npm install
```

Configure the backend URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at the URL printed by Next.js.

---

# 🧪 Example RAG Flow

After starting both applications:

### Step 1 — Ingest

Upload:

```text
my-document.pdf
```

The backend processes:

```text
PDF
 → Chunks
 → Embeddings
 → ChromaDB
```

### Step 2 — Ask

Enter:

```text
What is this document about?
```

### Step 3 — Retrieve

ChromaDB performs semantic similarity search and returns the most relevant chunks.

### Step 4 — Generate

The retrieved chunks are inserted into the LLM prompt.

### Step 5 — Respond

The frontend displays:

```text
Answer
+
Retrieved Sources
```

---

# 🧱 Design Principles

The project follows several important architectural principles.

### Separation of Concerns

Document processing, retrieval, LLM generation, API handling, and UI logic are separated.

### Model Independence

Embedding and generation models can be replaced without redesigning the entire application.

### Vector Store Independence

The vector store is isolated so that alternatives such as other vector databases can be introduced later.

### Local Development

The complete system can be developed and tested locally.

### Source-Aware Responses

Retrieved source chunks are returned alongside generated answers.

### Configuration Driven

Important values such as:

- LLM model
- Embedding model
- Chunk size
- Chunk overlap
- Retrieval count
- Ollama URL
- Storage locations

are configurable rather than hardcoded.

---

# 🚧 Future Improvements

The current project focuses on understanding and implementing the fundamental RAG architecture.

Potential improvements include:

- Hybrid search
- Metadata filtering
- Reranking
- Multi-query retrieval
- Query rewriting
- Parent-document retrieval
- Context compression
- Better chunking strategies
- Document deduplication
- Incremental ingestion
- Background ingestion jobs
- Streaming LLM responses
- Conversation history
- Multiple document collections
- Authentication
- Evaluation pipelines
- RAG quality metrics
- Retrieval benchmarking
- Observability and tracing
- Production vector database support

---

# 🎯 Learning Goals

This project is primarily an engineering and learning project focused on understanding how modern RAG systems work internally.

The major concepts covered are:

```text
Document Loading
      ↓
Text Splitting
      ↓
Embeddings
      ↓
Vector Storage
      ↓
Semantic Search
      ↓
Retrieval
      ↓
Prompt Construction
      ↓
LLM Generation
      ↓
Grounded Response
```

Alongside the RAG pipeline, the project also explores how to expose the AI system through a proper backend API and consume it from a modern frontend.

---

# 🤝 Contributing

Contributions and improvements are welcome.

To contribute:

1. Fork the repository.
2. Clone your fork.
3. Create a feature branch.

```bash
git checkout -b feature/your-feature-name
```

4. Make your changes.
5. Test the application.
6. Commit your changes.

```bash
git commit -m "feat: add your feature"
```

7. Push the branch.

```bash
git push origin feature/your-feature-name
```

8. Open a Pull Request.

Please keep pull requests focused and include relevant documentation when architectural changes are introduced.

---

# 📄 License

This project is licensed under the **MIT License**.

The MIT License is a permissive open-source license that allows reuse, modification, distribution, and use in private or commercial projects, provided the original copyright and license notice are retained.

---

<div align="center">

### Built to understand RAG from the ground up.

**Documents → Embeddings → Retrieval → Context → LLM → Answer**

</div>
