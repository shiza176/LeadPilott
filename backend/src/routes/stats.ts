import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db, leadsTable } from "@workspace/db";

const router: IRouter = Router();

function deriveSeniority(title: string): string {
  const t = title.toLowerCase();
  if (/(chief|ceo|cfo|coo|cto|cmo|founder|president|\bvp\b|vice president)/.test(t)) return "Executive";
  if (/(director|head of|principal)/.test(t)) return "Senior";
  if (/(manager|lead)/.test(t)) return "Mid";
  return "Junior";
}

function deriveScore(seniority: string): number {
  const map: Record<string, number> = { Executive: 95, Senior: 85, Mid: 75, Junior: 65 };
  return map[seniority] ?? 70;
}

router.get("/", async (_req, res) => {
  try {
    const countResult = await db
      .select({ value: sql<number>`count(*)` })
      .from(leadsTable);
    const leadsCount = Number(countResult[0]?.value ?? 0);

    const allLeads = await db.select({ title: leadsTable.title }).from(leadsTable);
    let avgLeadQuality = 0;
    if (allLeads.length > 0) {
      const totalScore = allLeads.reduce((sum, lead) => {
        const seniority = deriveSeniority(lead.title || "");
        return sum + deriveScore(seniority);
      }, 0);
      avgLeadQuality = Math.round((totalScore / allLeads.length) * 10) / 10;
    }

    return res.json({ leadsCount, avgLeadQuality });
  } catch (error) {
    console.error("Fetch stats error:", error);
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;