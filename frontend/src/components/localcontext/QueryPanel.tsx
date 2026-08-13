import { useState, type KeyboardEvent } from "react";

const SUGGESTIONS = [
  "Summarize this document",
  "What are the main topics?",
  "What technologies are mentioned?",
  "Who is mentioned in the document?",
  "What are the key findings?",
];

export function QueryPanel({
  onAsk,
  isPending,
  errorMessage,
}: {
  onAsk: (question: string) => void;
  isPending: boolean;
  errorMessage: string | null;
}) {
  const [question, setQuestion] = useState("");
  const [validation, setValidation] = useState<string | null>(null);

  function submit(value?: string) {
    const text = (value ?? question).trim();
    if (!text) {
      setValidation("Enter a question about your ingested documents.");
      return;
    }
    setValidation(null);
    setQuestion(text);
    onAsk(text);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Ask your documents
        </h2>
        <span className="font-mono text-[11px] text-muted-foreground">POST /query</span>
      </div>

      <textarea
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={3}
        placeholder="Ask anything about your ingested documents..."
        disabled={isPending}
        className="mt-4 w-full resize-y rounded-lg border border-border bg-background px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-60"
      />

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-[11px] text-muted-foreground">
          Enter to send · Shift + Enter for newline
        </p>
        <button
          type="button"
          onClick={() => submit()}
          disabled={isPending}
          className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-60"
        >
          {isPending ? "Searching…" : "Ask →"}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTIONS.map((item) => (
          <button
            key={item}
            type="button"
            disabled={isPending}
            onClick={() => {
              setQuestion(item);
              submit(item);
            }}
            className="rounded-full border border-border bg-background px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
          >
            {item}
          </button>
        ))}
      </div>

      {validation && <p className="mt-3 text-xs text-destructive">{validation}</p>}
      {errorMessage && (
        <div className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs whitespace-pre-line text-destructive">
          {errorMessage}
        </div>
      )}
    </section>
  );
}
