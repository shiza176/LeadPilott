import { useEffect, useState } from "react";
import { fetchStats } from "@/api/stats";
import {
  ArrowUpRight,
  BarChart3,
  BookmarkCheck,
  ChevronDown,
  ChevronRight,
  Clock3,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { formatDate } from "@/lib/app-utils";
import { Metric, SectionHeader } from "@/components/layout";

type Notice = { message: string; kind?: "success" | "default" };

function Signal({
  label,
  value,
  width,
  color,
}: {
  label: string;
  value: string;
  width: string;
  color: string;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-[11px] font-bold">
        <span>{label}</span>
        <span className="font-mono text-[hsl(var(--muted-foreground))]">
          {value}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-[hsl(var(--muted))]">
        <div
          className={`signal-${color} h-full rounded-full`}
          style={{ width }}
        />
      </div>
    </div>
  );
}
import type { SearchRecord } from "@/data";

export default function Dashboard({
  notify,
  searches,
  savedLeadIds,
  savedCompanyIds,
}: {
  notify: (notice: Notice) => void;
  searches: SearchRecord[];
  savedLeadIds: string[];
  savedCompanyIds: string[];
}) {
  const [, navigate] = useLocation();
  const chart = [34, 51, 43, 64, 58, 76, 68, 84, 73, 92, 88, 100];
  const storedUser = JSON.parse(localStorage.getItem("authUser") || "null");
  const firstName = storedUser?.name?.split(" ")[0] || "there";
  const [leadsCount, setLeadsCount] = useState<number | null>(null);
  const [avgLeadQuality, setAvgLeadQuality] = useState<number | null>(null);
  useEffect(() => {
    fetchStats()
      .then((data) => {
        setLeadsCount(data.leadsCount);
        setAvgLeadQuality(data.avgLeadQuality);
      })
      .catch(() => {
        setLeadsCount(0);
        setAvgLeadQuality(0);
      });
  }, []);
  return (
    <div className="animate-rise">
      <SectionHeader
        eyebrow={new Intl.DateTimeFormat("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        }).format(new Date())}
        title={`Good morning, ${firstName}.`}
        description="A clear view of your prospecting momentum, with the next useful move close at hand."
        action={
          <button
            data-testid="button-dashboard-discover"
            className="btn-primary flex items-center gap-2"
            onClick={() => navigate("/search")}
          >
            <Sparkles size={15} /> Start a discovery <ArrowUpRight size={14} />
          </button>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Leads discovered"
          value={leadsCount === null ? "…" : leadsCount.toString()}
          detail="Total leads found so far"
          icon={Users}
        />
        <Metric
          label="Saved prospects"
          value={(savedLeadIds.length + savedCompanyIds.length).toString()}
          detail="Leads + companies saved"
          icon={BookmarkCheck}
          accent="orange"
        />
        <Metric
          label="Searches run"
          value={searches.length.toString()}
          detail="Total searches so far"
          icon={Search}
          accent="blue"
        />
        <Metric
          label="Avg. lead quality"
          value={avgLeadQuality === null ? "…" : avgLeadQuality.toString()}
          detail="Based on lead seniority"
          icon={BarChart3}
          accent="pink"
        />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <section className="card p-5 md:p-6">
          <div className="mb-7 flex items-start justify-between">
            <div>
              <p className="eyebrow">Discovery activity</p>
              <h2 className="mt-1 text-[16px] font-extrabold tracking-[-.025em]">
                Leads found over time
              </h2>
            </div>
            <button
              data-testid="button-chart-range"
              className="btn-outline flex items-center gap-2 text-[11px]"
            >
              Last 30 days <ChevronDown size={13} />
            </button>
          </div>
          <div className="flex h-[205px] items-end gap-2 border-b border-l border-[hsl(var(--border))] px-3 pb-0 pt-4">
            {chart.map((height, i) => (
              <div
                key={i}
                className="group relative flex h-full flex-1 items-end"
              >
                <div
                  className={`w-full rounded-t-[3px] transition-all duration-300 group-hover:opacity-80 ${i === 9 ? "bg-[hsl(var(--accent))]" : "bg-[hsl(var(--primary)/.72)]"}`}
                  style={{ height: `${height}%` }}
                />
                <span className="absolute -top-5 left-1/2 hidden -translate-x-1/2 rounded bg-[hsl(var(--foreground))] px-1.5 py-0.5 font-mono text-[9px] text-[hsl(var(--background))] group-hover:block">
                  {Math.round(height * 1.4)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between pl-3 text-[10px] font-mono text-[hsl(var(--muted-foreground))]">
            <span>Mar 26</span>
            <span>Apr 02</span>
            <span>Apr 09</span>
            <span>Apr 16</span>
            <span>Apr 24</span>
          </div>
        </section>
        <section className="card overflow-hidden">
          <div className="flex items-start justify-between p-5">
            <div>
              <p className="eyebrow">Recent searches</p>
              <h2 className="mt-1 text-[16px] font-extrabold tracking-[-.025em]">
                Your research trail
              </h2>
            </div>
            <Link
              href="/history"
              data-testid="link-dashboard-history"
              className="text-[11px] font-extrabold text-[hsl(var(--primary))]"
            >
              View all
            </Link>
          </div>
          {searches.slice(0, 3).map((record, i) => (
            <button
              key={record.id}
              data-testid={`button-recent-search-${record.id}`}
              className="flex w-full items-center gap-3 border-t border-[hsl(var(--border))] px-5 py-4 text-left transition-colors hover:bg-[hsl(var(--muted)/.55)]"
              onClick={() => navigate("/search")}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--muted))] font-mono text-[10px] text-[hsl(var(--muted-foreground))]">
                0{i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-bold">
                  {record.query}
                </span>
                <span className="mt-1 flex items-center gap-1 text-[10px] text-[hsl(var(--muted-foreground))]">
                  <Clock3 size={11} /> {record.resultCount} results ·{" "}
                  {formatDate(record.createdAt)}
                </span>
              </span>
              <ChevronRight
                size={15}
                className="text-[hsl(var(--muted-foreground))]"
              />
            </button>
          ))}
        </section>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <section className="card p-5 md:p-6">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <p className="eyebrow">Suggested direction</p>
              <h2 className="mt-1 text-[16px] font-extrabold">
                Where should you look next?
              </h2>
            </div>
            <span className="tag bg-[hsl(var(--accent)/.2)] text-[hsl(var(--foreground))]">
              <Sparkles size={12} /> signal
            </span>
          </div>
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.45)] p-4">
            <p className="text-[13px] font-bold">
              Brand and growth leaders in Pakistan’s retail market
            </p>
            <p className="mt-1 text-[11px] leading-5 text-[hsl(var(--muted-foreground))]">
              You have found 14 apparel leaders recently. Explore adjacent
              retail companies to widen the shortlist.
            </p>
            <button
              data-testid="button-suggested-search"
              className="btn-quiet mt-3 -ml-2 flex items-center gap-1 text-[hsl(var(--primary))]"
              onClick={() => {
                notify({ message: "Discovery brief loaded." });
                navigate("/search");
              }}
            >
              Explore this brief <ArrowUpRight size={13} />
            </button>
          </div>
        </section>
        <section className="card p-5 md:p-6">
          <p className="eyebrow mb-4">Quality signals</p>
          <div className="space-y-4">
            <Signal
              label="Profiles with verified email"
              value="76%"
              width="76%"
              color="teal"
            />
            <Signal
              label="Leads with decision-making titles"
              value="68%"
              width="68%"
              color="orange"
            />
            <Signal
              label="Companies with active websites"
              value="91%"
              width="91%"
              color="blue"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
