import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Header } from "@/components/localcontext/Header";
import { IngestionCard } from "@/components/localcontext/IngestionCard";
import { QueryPanel } from "@/components/localcontext/QueryPanel";
import { AnswerPanel } from "@/components/localcontext/AnswerPanel";
import { SourcesList } from "@/components/localcontext/SourcesList";
import { EmptyState, QueryLoading } from "@/components/localcontext/States";
import { askQuestion } from "@/lib/api/query";
import { API_BASE_URL, ApiError } from "@/lib/api/client";
import type { QueryResponse } from "@/types/rag";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LocalContext — Local RAG Document Context" },
      {
        name: "description",
        content:
          "Ingest PDFs into your local RAG backend and ask natural-language questions with full source attribution.",
      },
      { property: "og:title", content: "LocalContext — Local RAG Document Context" },
      {
        property: "og:description",
        content:
          "A local-first developer tool for ingesting documents and querying your own RAG pipeline.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const query = useMutation<QueryResponse, Error, string>({
    mutationFn: askQuestion,
  });

  const queryError =
    query.error instanceof ApiError
      ? query.error.message
      : query.isError
        ? "The query failed. Please try again."
        : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-5 pt-10 pb-20">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Your documents. Your context.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Ingest PDFs into your local RAG pipeline, then ask questions and inspect the exact
            chunks behind every answer.
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <IngestionCard />
          <QueryPanel
            onAsk={(question) => query.mutate(question)}
            isPending={query.isPending}
            errorMessage={queryError}
          />
        </div>

        <div className="mt-8 space-y-5">
          {query.isPending && !query.data && <QueryLoading />}
          {!query.isPending && !query.data && <EmptyState />}
          {query.data && (
            <>
              {query.isPending && <QueryLoading />}
              <AnswerPanel result={query.data} />
              <SourcesList sources={query.data.sources} />
            </>
          )}
        </div>

        <p className="mt-12 border-t border-border pt-5 font-mono text-[11px] leading-relaxed text-muted-foreground">
          Designed for local document workflows. Your documents are sent to the configured local RAG
          server at {API_BASE_URL}. Embeddings, retrieval and generation all happen in the backend.
        </p>
      </main>
    </div>
  );
}
