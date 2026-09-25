import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db, leadsTable, companiesTable } from "@workspace/db";
const router: IRouter = Router();

function deriveSeniority(title: string): string {
  const t = title.toLowerCase();
  if (
    /(chief|ceo|cfo|coo|cto|cmo|founder|president|\bvp\b|vice president)/.test(
      t,
    )
  )
    return "Executive";
  if (/(director|head of|principal)/.test(t)) return "Senior";
  if (/(manager|lead)/.test(t)) return "Mid";
  return "Junior";
}

function deriveScore(seniority: string): number {
  const map: Record<string, number> = {
    Executive: 95,
    Senior: 85,
    Mid: 75,
    Junior: 65,
  };
  return map[seniority] ?? 70;
}

router.get("/", async (_req, res) => {
  try {
    const countResult = await db
      .select({ value: sql<number>`count(*)` })
      .from(leadsTable);
    const leadsCount = Number(countResult[0]?.value ?? 0);

    const allLeads = await db
      .select({ title: leadsTable.title, email: leadsTable.email })
      .from(leadsTable);
    let avgLeadQuality = 0;
    if (allLeads.length > 0) {
      const totalScore = allLeads.reduce((sum, lead) => {
        const seniority = deriveSeniority(lead.title || "");
        return sum + deriveScore(seniority);
      }, 0);
      avgLeadQuality = Math.round((totalScore / allLeads.length) * 10) / 10;
    }
    const verifiedEmailPercent =
      allLeads.length > 0
        ? Math.round(
            (allLeads.filter((l) => l.email && l.email.trim() !== "").length /
              allLeads.length) *
              100,
          )
        : 0;

    const decisionMakerPercent =
      allLeads.length > 0
        ? Math.round(
            (allLeads.filter((l) => {
              const s = deriveSeniority(l.title || "");
              return s === "Executive" || s === "Senior";
            }).length /
              allLeads.length) *
              100,
          )
        : 0;

    const allCompanies = await db
      .select({ website: companiesTable.website })
      .from(companiesTable);
    const activeWebsitePercent =
      allCompanies.length > 0
        ? Math.round(
            (allCompanies.filter((c) => c.website && c.website.trim() !== "")
              .length /
              allCompanies.length) *
              100,
          )
        : 0;
    const allLeadsForChart = await db
      .select({ createdAt: leadsTable.createdAt })
      .from(leadsTable);
    const chartData: { date: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      chartData.push({ date: d.toISOString().slice(0, 10), count: 0 });
    }
    allLeadsForChart.forEach((lead) => {
      const leadDateStr = new Date(lead.createdAt).toISOString().slice(0, 10);
      const dayEntry = chartData.find((day) => day.date === leadDateStr);
      if (dayEntry) dayEntry.count++;
    });

    return res.json({
      leadsCount,
      avgLeadQuality,
      verifiedEmailPercent,
      decisionMakerPercent,
      activeWebsitePercent,
      chartData,
    });
  } catch (error) {
    console.error("Fetch stats error:", error);
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
