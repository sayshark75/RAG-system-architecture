import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { formatBytes, ingestDocument, validatePdf } from "@/lib/api/ingest";
import { ApiError } from "@/lib/api/client";

export function IngestionCard() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const ingestion = useMutation({
    mutationFn: (selected: File) => ingestDocument(selected),
  });

  function select(next: File | undefined | null) {
    if (!next) return;
    const error = validatePdf(next);
    ingestion.reset();
    if (error) {
      setValidationError(error);
      setFile(null);
      return;
    }
    setValidationError(null);
    setFile(next);
  }

  function clear() {
    setFile(null);
    setValidationError(null);
    ingestion.reset();
    if (inputRef.current) inputRef.current.value = "";
  }

  const errorMessage =
    ingestion.error instanceof ApiError
      ? ingestion.error.message
      : ingestion.isError
        ? "Ingestion failed. Please try again."
        : null;

  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Document Ingestion
        </h2>
        <span className="font-mono text-[11px] text-muted-foreground">POST /ingest</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        PDFs are chunked and embedded by your backend. Larger documents take longer.
      </p>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          select(event.dataTransfer.files?.[0]);
        }}
        className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-10 text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          dragging
            ? "border-primary bg-primary/5"
            : "border-border bg-background hover:border-muted-foreground/50"
        }`}
      >
        <p className="text-sm font-medium text-foreground">Drop your PDF here</p>
        <p className="mt-1 text-xs text-muted-foreground">or click to browse · PDF only</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(event) => select(event.target.files?.[0])}
        />
      </div>

      {validationError && (
        <p className="mt-3 text-xs text-destructive">{validationError}</p>
      )}

      {file && (
        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="truncate font-mono text-xs text-foreground">{file.name}</p>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              {formatBytes(file.size)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={clear}
              disabled={ingestion.isPending}
              className="rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
            >
              Remove
            </button>
            <button
              type="button"
              onClick={() => ingestion.mutate(file)}
              disabled={ingestion.isPending}
              className="rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-60"
            >
              {ingestion.isPending ? "Ingesting…" : "Ingest Document"}
            </button>
          </div>
        </div>
      )}

      {ingestion.isPending && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="size-1.5 animate-pulse rounded-full bg-primary" aria-hidden />
          Ingesting document — extracting text, chunking and creating embeddings.
        </div>
      )}

      {ingestion.isSuccess && (
        <p className="mt-3 text-xs text-primary">✓ Document ingested successfully</p>
      )}

      {errorMessage && (
        <div className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs whitespace-pre-line text-destructive">
          {errorMessage}
        </div>
      )}
    </section>
  );
}
