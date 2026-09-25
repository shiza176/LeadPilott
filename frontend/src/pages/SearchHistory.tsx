import { Clock3, History, RotateCcw, Trash2 } from "lucide-react";
import { Link } from "wouter";
import type { ReactNode } from "react";
import type { SearchRecord } from "@/data";

type Notice = { message: string; kind?: "success" | "default" };

function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="eyebrow mb-2">{eyebrow}</p>
        <h1 className="text-[27px] font-extrabold tracking-[-.045em] text-[hsl(var(--foreground))] md:text-[31px]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-xl text-[13px] leading-6 text-[hsl(var(--muted-foreground))]">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function HistoryPage({ searches, notify, onRerun, onDelete }: { searches: SearchRecord[]; notify: (notice: Notice) => void; onRerun: (record: SearchRecord) => void; onDelete: (id: string) => void }) {
  return (
    <div className="animate-rise">
      <SectionHeader
        eyebrow="Research trail"
        title="Search history."
        description="A record of the questions you have asked, so useful research never disappears."
        action={
          <span className="tag">
            <History size={12} /> {searches.length} saved searches
          </span>
        }
      />
      <section className="card overflow-hidden">
        <div className="history-head">
          <span>Question</span>
          <span>Filters</span>
          <span className="hidden md:block">Run date</span>
          <span className="hidden sm:block">Results</span>
          <span />
        </div>
        {searches.length ? (
          searches.map((record) => (
            <div
              className="history-row"
              key={record.id}
              data-testid={`row-history-${record.id}`}
            >
              <div className="min-w-0">
                <p className="truncate text-[12px] font-extrabold">
                  {record.query}
                </p>
                <p className="mt-1 flex items-center gap-1 text-[10px] text-[hsl(var(--muted-foreground))] md:hidden">
                  <Clock3 size={10} /> {formatDate(record.createdAt)}
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                {[
                  record.filters.industry,
                  record.filters.location,
                  record.filters.companySize,
                  record.filters.title,
                ]
                  .filter(Boolean)
                  .map((filter) => (
                    <span className="tag px-1.5 py-0.5 text-[9px]" key={filter}>
                      {filter}
                    </span>
                  ))}
              </div>
              <div className="hidden text-[11px] font-semibold text-[hsl(var(--muted-foreground))] md:block">
                {formatDate(record.createdAt)}
              </div>
              <div className="hidden font-mono text-[11px] font-bold sm:block">
                {record.resultCount}
              </div>
              <div className="flex items-center justify-end gap-1">
                <button
                  data-testid={`button-rerun-search-${record.id}`}
                  className="btn-quiet flex items-center gap-1 px-2 text-[10px] text-[hsl(var(--primary))]"
                  onClick={() => onRerun(record)}
                >
                  <RotateCcw size={12} /> Rerun
                </button>
                <button
                  data-testid={`button-delete-history-${record.id}`}
                  className="btn-quiet p-2"
                  aria-label={`Delete search ${record.query}`}
                  onClick={() => onDelete(record.id)}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-14 text-center">
            <p className="text-[13px] font-bold">
              Your research trail is clear.
            </p>
            <Link
              href="/search"
              data-testid="link-empty-history"
              className="btn-primary mt-4 inline-flex"
            >
              Run your first discovery
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
