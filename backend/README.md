<div align="center">

# RAG-system-architecture

Empower your applications with a robust, private, and lightning-fast local RAG system.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/your-username/RAG-system-architecture/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/your-username/RAG-system-architecture/blob/main/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/your-username/RAG-system-architecture/blob/main/CONTRIBUTING.md)
[![GitHub Stars](https://img.shields.io/github/stars/your-username/RAG-system-architecture?style=social)](https://github.com/your-username/RAG-system-architecture/stargazers)

</div>

---

## The Strategic "Why"

> Traditional RAG deployments often wrestle with data privacy concerns, prohibitive cloud costs, and complex setup processes, hindering rapid development and local experimentation. Relying on external APIs can introduce latency, data sovereignty issues, and unpredictable expenses, making it challenging to build truly secure and responsive AI applications.

This project offers a complete, local-first RAG architecture, leveraging FastAPI and LangChain to provide a secure, cost-effective, and highly performant solution right on your machine. It simplifies the complex orchestration of LLMs, vector stores, and data ingestion, allowing developers to focus on innovation rather than infrastructure.

## Key Features

- ⚡️ **Local-First Processing**: Keep your sensitive data private and minimize latency by running the entire RAG pipeline securely on your own infrastructure.
- 🚀 **High-Performance API**: Built with FastAPI for blazing-fast, asynchronous request handling, providing a clean and efficient RESTful interface for your RAG system.
- 🧩 **Modular LangChain Pipeline**: Easily customize and extend your Retrieval Augmented Generation workflow with LangChain's powerful and flexible orchestration capabilities.
- 🛠️ **Simplified Setup**: Get up and running in minutes with clear installation steps, modern dependency management using `uv`, and a well-structured project.
- 🔄 **Scalable Design**: Architected for extensibility, allowing seamless integration of new LLMs, vector stores, data loaders, and retrieval strategies as your needs evolve.
- 📈 **Developer-Friendly**: Features automatic API documentation (Swagger UI/ReDoc) and a clear codebase, making development and collaboration smooth and efficient.

## Technical Architecture

This project leverages a modern Python tech stack to deliver a robust and efficient RAG system.

| Technology    | Purpose                                   | Key Benefit                                                                                       |
| :------------ | :---------------------------------------- | :------------------------------------------------------------------------------------------------ |
| **Python**    | Primary programming language              | Versatility, extensive AI/ML ecosystem, large community support                                   |
| **FastAPI**   | Web framework for API endpoints           | High performance, asynchronous capabilities, automatic interactive API documentation              |
| **LangChain** | LLM orchestration framework               | Simplifies complex RAG workflows, integrates various components (LLMs, vector stores, retrievers) |
| **Uvicorn**   | ASGI server                               | Production-ready, fast server for running FastAPI applications                                    |
| **uv**        | Modern Python package manager             | Extremely fast and reliable dependency resolution and package installation                        |
| **Poetry**    | Dependency management & project structure | Ensures consistent project environments and simplifies package distribution                       |

### Directory Structure

```
RAG-system-architecture/
├── 📁 src/
│   ├── 📁 api/                      # FastAPI endpoints and API models
│   │   └── 📄 endpoints.py
│   ├── 📁 core/                     # Core configurations and utility functions
│   │   └── 📄 config.py
│   ├── 📁 ingestion/                # Data loading and processing for vector store population
│   │   └── 📄 data_loader.py
│   ├── 📁 rag_pipeline/             # LangChain-based RAG chain definition and components
│   │   ├── 📄 chain.py
│   │   └── 📄 prompt_templates.py
│   ├── 📁 vector_store/             # Management of the vector database (e.g., Chroma, FAISS)
│   │   └── 📄 store_manager.py
│   └── 📄 main.py                   # Main FastAPI application entry point
├── 📄 .gitignore                    # Specifies intentionally untracked files to ignore
├── 📄 .python-version               # Defines the required Python version (e.g., via `pyenv`)
├── 📄 pyproject.toml                # Project metadata and dependency definitions (Poetry)
├── 📄 uv.lock                       # Lock file generated by `uv` for reproducible environments
└── 📄 README.md                     # Project README file
```

## Operational Setup

### Prerequisites

Ensure you have the following installed on your system:

- **Python 3.9+**: Recommended to use a version manager like `pyenv` or `conda`.
  ```bash
  pyenv install 3.10.12 # Or your preferred version
  pyenv local 3.10.12
  ```
- **uv**: A fast Python package installer and resolver.
  ```bash
  pip install uv
  ```

### Installation

Follow these steps to get your RAG system up and running locally:

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/your-username/RAG-system-architecture.git
    cd RAG-system-architecture
    ```

2.  **Install dependencies**:
    This project uses `uv` for dependency management, as indicated by `uv.lock` and `pyproject.toml`.
    ```bash
    uv sync
    ```
3.  **Ingest the initial documents**
    Run the command in the root directory of your forked project

    ```bash
    python ./src/backend/main.py ingest
    ```

    it will detect the /documents directory, and load all the PDF documents and convert them into chunks and then make their embeddings then store it in the ChromaDB.

4.  **Run the application**:
    Start the FastAPI server.
    ```bash
    uv run fastapi dev ./src/backend/main.py
    ```
    Your RAG API will now be accessible at `http://localhost:8000`. You can view the interactive API documentation (Swagger UI) at `http://localhost:8000/docs`.

## Community & Governance

### Contributing

We welcome contributions from the community! If you'd like to improve this project, please follow these steps:

1.  **Fork** the repository on GitHub.
2.  **Clone** your forked repository to your local machine.
3.  **Create a new branch** for your feature or bug fix: `git checkout -b feature/your-feature-name` or `git checkout -b bugfix/issue-description`.
4.  **Make your changes** and ensure your code adheres to the project's coding standards.
5.  **Write clear, concise commit messages**.
6.  **Push your branch** to your forked repository.
7.  **Open a Pull Request** against the `main` branch of this repository, describing your changes in detail.

Please ensure your pull requests are focused, well-tested, and include any necessary documentation updates.

### License

This project is licensed under the **MIT License**.

The MIT License is a permissive free software license originating at the Massachusetts Institute of Technology (MIT). It allows for reuse within proprietary software provided that all copies of the software include a copy of the MIT License terms and the copyright notice.
