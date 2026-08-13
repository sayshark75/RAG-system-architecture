export function EmptyState() {
  return (
    <section className="rounded-xl border border-dashed border-border bg-card/40 p-8 text-center">
      <h2 className="text-sm font-semibold tracking-tight text-foreground">
        Your document context starts here.
      </h2>
      <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-muted-foreground">
        Ingest a PDF, then ask questions about its contents. Everything is designed to work with
        your local RAG backend.
      </p>
      <div className="mx-auto mt-6 flex max-w-md flex-wrap items-center justify-center gap-2 font-mono text-[11px] text-muted-foreground">
        {["Frontend", "Local API", "RAG Pipeline", "Vector DB"].map((step, index) => (
          <span key={step} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden>→</span>}
            <span className="rounded-md border border-border bg-background px-2 py-1">{step}</span>
          </span>
        ))}
      </div>
    </section>
  );
}

export function QueryLoading() {
  const stages = ["Searching documents", "Retrieving relevant context", "Generating answer"];
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <span className="size-3 animate-spin rounded-full border-2 border-border border-t-primary" aria-hidden />
        <p className="text-sm font-medium text-foreground">Searching your local knowledge…</p>
      </div>
      <ul className="mt-4 space-y-2">
        {stages.map((stage, index) => (
          <li
            key={stage}
            className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground"
            style={{ animation: `pulse 1.6s ease-in-out ${index * 0.25}s infinite` }}
          >
            <span className="size-1 rounded-full bg-primary/70" aria-hidden />
            {stage}
          </li>
        ))}
      </ul>
    </section>
  );
}
