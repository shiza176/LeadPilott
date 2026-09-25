import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import {
  db,
  companiesTable,
  leadsTable,
  savedCompaniesTable,
  savedLeadsTable,
} from "@workspace/db";

const router: IRouter = Router();

// GET all saved items
router.get("/", async (req, res) => {
  try {
    const savedCompanies = await db
      .select({
        savedId: savedCompaniesTable.id,
        savedAt: savedCompaniesTable.savedAt,
        company: companiesTable,
      })
      .from(savedCompaniesTable)
      .innerJoin(companiesTable, eq(savedCompaniesTable.companyId, companiesTable.id))
      .where(eq(savedCompaniesTable.userId, req.userId));

    const savedLeads = await db
      .select({
        savedId: savedLeadsTable.id,
        savedAt: savedLeadsTable.savedAt,
        lead: leadsTable,
      })
      .from(savedLeadsTable)
      .innerJoin(leadsTable, eq(savedLeadsTable.leadId, leadsTable.id))
      .where(eq(savedLeadsTable.userId, req.userId));

    return res.json({
      savedCompanyIds: savedCompanies.map((c) => String(c.company.id)),
      savedLeadIds: savedLeads.map((l) => String(l.lead.id)),
      companies: savedCompanies.map((c) => ({
        id: String(c.company.id),
        name: c.company.name,
        initials: c.company.name
          .split(/\s+/)
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
        industry: c.company.industry || "Business",
        companyType: "Company",
        location: [c.company.city, c.company.country].filter(Boolean).join(", ") || "Location unavailable",
        size: c.company.size || "Unknown",
        website: c.company.website || "",
        linkedin: "",
        description: c.company.description || `${c.company.name}.`,
        founded: c.company.founded || 0,
        peopleCount: 0,
        relevanceScore: 80,
      })),
      leads: savedLeads.map((l) => ({
        id: String(l.lead.id),
        name: l.lead.name,
        title: l.lead.title || "Professional",
        email: l.lead.email || "",
        linkedin: l.lead.linkedin || "",
        companyId: String(l.lead.companyId),
      })),
    });
  } catch (error) {
    console.error("Fetch saved items error:", error);
    return res.status(500).json({ error: "Failed to fetch saved items" });
  }
});

// SAVE a company
router.post("/companies", async (req, res) => {
  try {
    const rawId = req.body?.companyId;
    const companyId = Number(rawId);
    if (!companyId || Number.isNaN(companyId)) {
      return res.status(400).json({ error: "Valid companyId is required" });
    }

    const existing = await db
      .select()
      .from(savedCompaniesTable)
      .where(and(
        eq(savedCompaniesTable.companyId, companyId),
        eq(savedCompaniesTable.userId, req.userId),
      ))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(savedCompaniesTable).values({ companyId, userId: req.userId });
    }

    return res.json({ success: true, companyId: String(companyId) });
  } catch (error) {
    console.error("Save company error:", error);
    return res.status(500).json({ error: "Failed to save company" });
  }
});

// UNSAVE a company
router.delete("/companies/:id", async (req, res) => {
  try {
    const companyId = Number(req.params.id);
    if (!companyId || Number.isNaN(companyId)) {
      return res.status(400).json({ error: "Invalid company id" });
    }

    await db
      .delete(savedCompaniesTable)
      .where(and(
        eq(savedCompaniesTable.companyId, companyId),
        eq(savedCompaniesTable.userId, req.userId),
      ));

    return res.json({ success: true, companyId: String(companyId) });
  } catch (error) {
    console.error("Delete saved company error:", error);
    return res.status(500).json({ error: "Failed to remove saved company" });
  }
});

// SAVE a lead
router.post("/leads", async (req, res) => {
  try {
    const rawId = req.body?.leadId;
    const leadId = Number(rawId);
    if (!leadId || Number.isNaN(leadId)) {
      return res.status(400).json({ error: "Valid leadId is required" });
    }

    const existing = await db
      .select()
      .from(savedLeadsTable)
      .where(and(
        eq(savedLeadsTable.leadId, leadId),
        eq(savedLeadsTable.userId, req.userId),
      ))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(savedLeadsTable).values({ leadId, userId: req.userId });
    }

    return res.json({ success: true, leadId: String(leadId) });
  } catch (error) {
    console.error("Save lead error:", error);
    return res.status(500).json({ error: "Failed to save lead" });
  }
});

// UNSAVE a lead
router.delete("/leads/:id", async (req, res) => {
  try {
    const leadId = Number(req.params.id);
    if (!leadId || Number.isNaN(leadId)) {
      return res.status(400).json({ error: "Invalid lead id" });
    }

    await db
      .delete(savedLeadsTable)
      .where(and(
        eq(savedLeadsTable.leadId, leadId),
        eq(savedLeadsTable.userId, req.userId),
      ));

    return res.json({ success: true, leadId: String(leadId) });
  } catch (error) {
    console.error("Delete saved lead error:", error);
    return res.status(500).json({ error: "Failed to remove saved lead" });
  }
});

export default router;
