import { useState } from "react";
import type { QuerySource } from "@/types/rag";

function fileName(source: string | undefined): string {
  if (!source) return "Unknown source";
  return source.split(/[\\/]/).pop() ?? source;
}

const METADATA_LABELS: Record<string, string> = {
  creationdate: "creationdate",
  moddate: "moddate",
  total_pages: "total_pages",
  page_label: "page_label",
};

function SourceCard({ source, index }: { source: QuerySource; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [showMeta, setShowMeta] = useState(false);
  const metadata = source.metadata ?? {};
  const page =
    typeof metadata.page === "number"
      ? metadata.page + 1
      : metadata.page_label
        ? Number(metadata.page_label)
        : null;
  const entries = Object.entries(metadata).filter(([, value]) => value !== null && value !== undefined);
  const content = (source.content ?? "").trim();
  const isLong = content.length > 400;

  return (
    <article className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="font-mono text-[11px] font-semibold text-primary">
          Source {String(index + 1).padStart(2, "0")}
        </span>
        <span className="text-[11px] text-muted-foreground">·</span>
        <span className="truncate font-mono text-[11px] text-muted-foreground">
          {fileName(metadata.source)}
        </span>
        {page !== null && !Number.isNaN(page) && (
          <>
            <span className="text-[11px] text-muted-foreground">·</span>
            <span className="font-mono text-[11px] text-muted-foreground">Page {page}</span>
          </>
        )}
      </div>

      <p
        className={`mt-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground/80 ${
          expanded ? "" : "line-clamp-4"
        }`}
      >
        {content || "No content returned for this chunk."}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="rounded-md border border-border px-2.5 py-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
        {entries.length > 0 && (
          <button
            type="button"
            onClick={() => setShowMeta((value) => !value)}
            className="rounded-md border border-border px-2.5 py-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {showMeta ? "Hide metadata" : "View metadata"}
          </button>
        )}
      </div>

      {showMeta && entries.length > 0 && (
        <dl className="mt-3 grid grid-cols-1 gap-3 rounded-lg border border-border bg-background p-3 sm:grid-cols-2">
          {entries.map(([key, value]) => (
            <div key={key} className="min-w-0">
              <dt className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
                {METADATA_LABELS[key] ?? key}
              </dt>
              <dd className="mt-0.5 truncate font-mono text-[11px] text-foreground/85">
                {String(value)}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </article>
  );
}

export function SourcesList({ sources }: { sources: QuerySource[] }) {
  if (!sources.length) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold tracking-tight text-foreground">
        Sources <span className="font-mono text-muted-foreground">· {sources.length}</span>
      </h2>
      {sources.map((source, index) => (
        <SourceCard key={index} source={source} index={index} />
      ))}
    </section>
  );
}
