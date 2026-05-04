import { Router } from "express";
import { db } from "@workspace/db";
import { cyberAlertsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/alerts", async (req, res) => {
  try {
    const { severity, limit = 20 } = req.query;
    const alerts = await db.select().from(cyberAlertsTable)
      .where(eq(cyberAlertsTable.is_active, 1))
      .orderBy(desc(cyberAlertsTable.created_at))
      .limit(Number(limit));
    res.json({ alerts, total: alerts.length });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
