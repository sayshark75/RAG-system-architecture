import { Markdown } from "./Markdown";
import type { QueryResponse } from "@/types/rag";

export function AnswerPanel({ result }: { result: QueryResponse }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">Answer</h2>
        <span className="font-mono text-[11px] text-muted-foreground">
          {result.sources.length} chunk{result.sources.length === 1 ? "" : "s"} retrieved
        </span>
      </div>

      {result.question && (
        <p className="mt-2 font-mono text-[11px] text-muted-foreground">Q: {result.question}</p>
      )}

      <div className="mt-4">
        <Markdown content={result.answer || "The backend returned an empty answer."} />
      </div>

      <p className="mt-5 border-t border-border pt-3 font-mono text-[11px] text-muted-foreground">
        Generated from local document context · verify against the sources below
      </p>
    </section>
  );
}
