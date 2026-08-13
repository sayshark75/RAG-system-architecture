import { API_BASE_URL } from "@/lib/api/client";

export function Header() {
  const host = API_BASE_URL.replace(/^https?:\/\//, "");

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-card font-mono text-sm text-primary">
            LC
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight text-foreground">LocalContext</p>
            <p className="text-[11px] text-muted-foreground">Local RAG Document Context</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <span className="size-1.5 rounded-full bg-primary" aria-hidden />
          <div className="leading-tight">
            <p className="text-[11px] font-medium text-foreground">Local API</p>
            <p className="font-mono text-[11px] text-muted-foreground">{host}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
