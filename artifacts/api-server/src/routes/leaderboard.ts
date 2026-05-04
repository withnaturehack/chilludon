import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, submissionsTable, userBadgesTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { authMiddleware } from "../lib/auth";

const router = Router();

router.get("/leaderboard", async (req, res) => {
  try {
    const { limit = 50, state } = req.query;

    const users = await db.select({
      user_id: usersTable.id,
      name: usersTable.name,
      college_name: usersTable.college_name,
      state: usersTable.state,
      total_points: usersTable.total_points,
      skill_level: usersTable.skill_level,
      national_rank: usersTable.national_rank,
      avatar_url: usersTable.avatar_url,
    }).from(usersTable)
      .where(eq(usersTable.role, "student"))
      .orderBy(desc(usersTable.total_points))
      .limit(Number(limit));

    const leaderboard = await Promise.all(users.map(async (user, index) => {
      const [{ count: verifiedCount }] = await db.select({ count: sql<number>`count(*)` })
        .from(submissionsTable)
        .where(eq(submissionsTable.user_id, user.user_id));

      const [{ count: badgeCount }] = await db.select({ count: sql<number>`count(*)` })
        .from(userBadgesTable)
        .where(eq(userBadgesTable.user_id, user.user_id));

      return {
        rank: index + 1,
        ...user,
        verified_submissions: Number(verifiedCount),
        badge_count: Number(badgeCount),
      };
    }));

    const [{ count: totalUsers }] = await db.select({ count: sql<number>`count(*)` })
      .from(usersTable).where(eq(usersTable.role, "student"));

    res.json({ leaderboard, total_users: Number(totalUsers) });
  } catch (error) {
    req.log.error({ error }, "Leaderboard error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
