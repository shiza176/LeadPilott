import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, searchHistoryTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(searchHistoryTable)
      .where(eq(searchHistoryTable.userId, req.userId))
      .orderBy(desc(searchHistoryTable.createdAt))
      .limit(50);

    return res.json({
      history: rows.map((row) => ({
        id: String(row.id),
        query: row.query,
        filters: row.filters ?? { industry: [], location: "", companySize: "", title: [] },
        createdAt: row.createdAt.toISOString(),
        resultCount: row.resultCount ?? 0,
      })),
    });
  } catch (error) {
    console.error("History fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch search history" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid id" });

    await db.delete(searchHistoryTable).where(and(
      eq(searchHistoryTable.id, id),
      eq(searchHistoryTable.userId, req.userId),
    ));
    return res.json({ success: true });
  } catch (error) {
    console.error("History delete error:", error);
    return res.status(500).json({ error: "Failed to delete history entry" });
  }
});

export default router;