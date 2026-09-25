import { unsaveLeadApi, unsaveCompanyApi } from "@/api/saved";
import { Bookmark, Download, Trash2 } from "lucide-react";
import { Link } from "wouter";
import type { ReactNode } from "react";
import type { Company, Lead } from "@/data";

type Notice = { message: string; kind?: "success" | "default" };
type Detail =
  { kind: "lead"; item: Lead } | { kind: "company"; item: Company } | null;

function Avatar({
  initials,
  tone = "teal",
  size = "md",
}: {
  initials: string;
  tone?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div
      data-testid={`avatar-${initials}`}
      className={`avatar avatar-${size} avatar-${tone}`}
    >
      {initials}
    </div>
  );
}

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

function EmptySaved({ type }: { type: "people" | "companies" }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="empty-icon">
        <Bookmark size={19} />
      </div>
      <h3 className="mt-4 text-[14px] font-extrabold">No saved {type} yet</h3>
      <p className="mt-1 max-w-xs text-[11px] leading-5 text-[hsl(var(--muted-foreground))]">
        Use the bookmark on a discovery result to keep a promising{" "}
        {type === "people" ? "lead" : "company"} close.
      </p>
      <Link
        href="/search"
        data-testid={`link-empty-saved-${type}`}
        className="btn-outline mt-4"
      >
        Discover {type}
      </Link>
    </div>
  );
}

function downloadCsv(
  filename: string,
  rows: Record<string, string | number>[],
) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const csv = [
    keys.join(","),
    ...rows.map((row) =>
      keys
        .map((key) => `"${String(row[key] ?? "").replaceAll('"', '""')}"`)
        .join(","),
    ),
  ].join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function SavedPage({
  savedLeadIds,
  setSavedLeadIds,
  savedCompanyIds,
  setSavedCompanyIds,
  notify,
  onOpen,
  allLeads,
  allCompanies,
}: {
  savedLeadIds: string[];
  setSavedLeadIds: (ids: string[]) => void;
  savedCompanyIds: string[];
  setSavedCompanyIds: (ids: string[]) => void;
  notify: (notice: Notice) => void;
  onOpen: (detail: Detail) => void;
  allLeads: Lead[];
  allCompanies: Company[];
}) {
  const savedLeads = allLeads.filter((lead) => savedLeadIds.includes(lead.id));
  const savedCompanies = allCompanies.filter((company) =>
    savedCompanyIds.includes(company.id),
  );
  const removeLead = async (id: string) => {
    try {
      await unsaveLeadApi(id);
      setSavedLeadIds(savedLeadIds.filter((item) => item !== id));
      notify({ message: "Lead removed from saved", kind: "success" });
    } catch (error) {
      notify({
        message:
          error instanceof Error ? error.message : "Failed to remove lead",
      });
    }
  };

  const removeCompany = async (id: string) => {
    try {
      await unsaveCompanyApi(id);
      setSavedCompanyIds(savedCompanyIds.filter((item) => item !== id));
      notify({ message: "Company removed from saved", kind: "success" });
    } catch (error) {
      notify({
        message:
          error instanceof Error ? error.message : "Failed to remove company",
      });
    }
  };
  return (
    <div className="animate-rise">
      <SectionHeader
        eyebrow="Your shortlist"
        title="Saved for later."
        description="Keep the people and companies worth a closer look within easy reach."
        action={
          <button
            data-testid="button-export-saved"
            className="btn-outline flex items-center gap-2"
            onClick={() =>
              downloadCsv(
                "leadpilot-saved.csv",
                savedLeads.map((lead) => ({
                  Name: lead.name,
                  Title: lead.title,
                  Company: lead.companyName,
                  Email: lead.email,
                  Location: lead.location,
                })),
              )
            }
          >
            <Download size={14} /> Export leads
          </button>
        }
      />
      <div className="mb-5 flex gap-6 border-b border-[hsl(var(--border))]">
        <div className="pb-3 text-[12px] font-extrabold text-[hsl(var(--primary))]">
          People{" "}
          <span className="ml-1 rounded-full bg-[hsl(var(--primary)/.1)] px-1.5 py-0.5 text-[10px]">
            {savedLeads.length}
          </span>
        </div>
        <div className="pb-3 text-[12px] font-semibold text-[hsl(var(--muted-foreground))]">
          Companies{" "}
          <span className="ml-1 rounded-full bg-[hsl(var(--muted))] px-1.5 py-0.5 text-[10px]">
            {savedCompanies.length}
          </span>
        </div>
      </div>
      <section className="card overflow-hidden">
        {savedLeads.length ? (
          savedLeads.map((lead) => (
            <div key={lead.id} className="result-row">
              <div className="min-w-0 flex-1">
                <button
                  data-testid={`button-saved-lead-${lead.id}`}
                  className="flex min-w-0 items-center gap-3 text-left"
                  onClick={() => onOpen({ kind: "lead", item: lead })}
                >
                  <Avatar initials={lead.initials} tone="teal" />
                  <span className="min-w-0">
                    <span className="block truncate text-[12px] font-extrabold">
                      {lead.name}
                    </span>
                    <span className="mt-1 block truncate text-[11px] text-[hsl(var(--muted-foreground))]">
                      {lead.title} / {lead.companyName}
                    </span>
                  </span>
                </button>
                <a
                  data-testid={`link-saved-lead-email-${lead.id}`}
                  className="mt-1.5 block truncate pl-12 text-[10px] text-[hsl(var(--primary))] hover:underline"
                  href={`mailto:${lead.email}`}
                >
                  {lead.email}
                </a>
              </div>
              <button
                data-testid={`button-remove-saved-lead-${lead.id}`}
                className="save-button saved"
                onClick={() => removeLead(lead.id)}
                aria-label={`Remove ${lead.name}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        ) : (
          <EmptySaved type="people" />
        )}
      </section>
      <div className="mt-8 mb-4 flex items-end justify-between">
        <div>
          <p className="eyebrow">Company watchlist</p>
          <h2 className="mt-1 text-[18px] font-extrabold">Saved companies</h2>
        </div>
        {savedCompanies.length > 0 && (
          <button
            data-testid="button-export-saved-companies"
            className="btn-quiet flex items-center gap-2"
            onClick={() =>
              downloadCsv(
                "leadpilot-saved-companies.csv",
                savedCompanies.map((company) => ({
                  Company: company.name,
                  Industry: company.industry,
                  Location: company.location,
                  Website: company.website,
                })),
              )
            }
          >
            <Download size={13} /> Export companies
          </button>
        )}
      </div>
      <section className="card overflow-hidden">
        {savedCompanies.length ? (
          savedCompanies.map((company) => (
            <div key={company.id} className="result-row">
              <button
                data-testid={`button-saved-company-${company.id}`}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
                onClick={() => onOpen({ kind: "company", item: company })}
              >
                <div className="company-mark">{company.initials}</div>
                <span className="min-w-0">
                  <span className="block truncate text-[12px] font-extrabold">
                    {company.name}
                  </span>
                  <span className="mt-1 block truncate text-[11px] text-[hsl(var(--muted-foreground))]">
                    {company.industry} / {company.location}
                  </span>
                </span>
              </button>
              <button
                data-testid={`button-remove-saved-company-${company.id}`}
                className="save-button saved"
                onClick={() => removeCompany(company.id)}
                aria-label={`Remove ${company.name}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        ) : (
          <EmptySaved type="companies" />
        )}
      </section>
    </div>
  );
}
