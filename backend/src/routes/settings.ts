import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, userSettingsTable } from "@workspace/db";

const router: IRouter = Router();

const defaults = {
  workspace: "My Workspace",
  role: "Founder",
  defaultLocation: "Pakistan",
  resultsPerPage: 25,
  emailAlerts: true,
};

// GET current user's settings
router.get("/", async (req, res) => {
  const userId = req.userId;
  if (userId === undefined) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const rows = await db
      .select()
      .from(userSettingsTable)
      .where(eq(userSettingsTable.userId, userId))
      .limit(1);

    if (rows.length === 0) {
      return res.json(defaults);
    }

    const row = rows[0];
    return res.json({
      workspace: row.workspace || defaults.workspace,
      role: row.role || defaults.role,
      defaultLocation: row.defaultLocation || defaults.defaultLocation,
      resultsPerPage: row.resultsPerPage ?? defaults.resultsPerPage,
      emailAlerts: row.emailAlerts === 1,
    });
  } catch (error) {
    console.error("Fetch settings error:", error);
    return res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// SAVE (create or update) current user's settings
router.put("/", async (req, res) => {
  const userId = req.userId;
  if (userId === undefined) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { workspace, role, defaultLocation, resultsPerPage, emailAlerts } = req.body ?? {};

    const existing = await db
      .select()
      .from(userSettingsTable)
      .where(eq(userSettingsTable.userId, userId))
      .limit(1);

    const values = {
      workspace: workspace ?? defaults.workspace,
      role: role ?? defaults.role,
      defaultLocation: defaultLocation ?? defaults.defaultLocation,
      resultsPerPage: Number(resultsPerPage) || defaults.resultsPerPage,
      emailAlerts: emailAlerts ? 1 : 0,
      updatedAt: new Date(),
    };

    if (existing.length === 0) {
      await db.insert(userSettingsTable).values({ userId, ...values });
    } else {
      await db
        .update(userSettingsTable)
        .set(values)
        .where(eq(userSettingsTable.userId, userId));
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("Save settings error:", error);
    return res.status(500).json({ error: "Failed to save settings" });
  }
});

export default router;