import { Router } from "express";
import { db } from "@workspace/db";
import { badgesTable, userBadgesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { authMiddleware } from "../lib/auth";

const router = Router();

router.get("/badges", async (req, res) => {
  try {
    const badges = await db.select().from(badgesTable);
    res.json({ badges });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/badges/my-badges", authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;
    const userBadges = await db.select({
      badge: badgesTable,
      earned_at: userBadgesTable.earned_at,
    }).from(userBadgesTable)
      .leftJoin(badgesTable, eq(userBadgesTable.badge_id, badgesTable.id))
      .where(eq(userBadgesTable.user_id, user.id));

    const badges = userBadges.map(ub => ({ badge: ub.badge, earned_at: ub.earned_at }));
    res.json({ badges, total_earned: badges.length });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
