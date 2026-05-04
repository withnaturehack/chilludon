import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, submissionsTable, userBadgesTable, badgesTable, cyberAlertsTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";
import { authMiddleware } from "../lib/auth";

const router = Router();

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;
    const { password_hash, ...safeUser } = user;

    const [{ submCount }] = await db.select({ submCount: sql<number>`count(*)` }).from(submissionsTable).where(eq(submissionsTable.user_id, user.id));
    const [{ verCount }] = await db.select({ verCount: sql<number>`count(*)` }).from(submissionsTable).where(eq(submissionsTable.user_id, user.id));
    const [{ badgeCount }] = await db.select({ badgeCount: sql<number>`count(*)` }).from(userBadgesTable).where(eq(userBadgesTable.user_id, user.id));

    const recentBadges = await db.select({
      badge: badgesTable,
      earned_at: userBadgesTable.earned_at,
    }).from(userBadgesTable)
      .leftJoin(badgesTable, eq(userBadgesTable.badge_id, badgesTable.id))
      .where(eq(userBadgesTable.user_id, user.id))
      .orderBy(desc(userBadgesTable.earned_at))
      .limit(5);

    const recentSubmissions = await db.select({
      id: submissionsTable.id,
      user_id: submissionsTable.user_id,
      title: submissionsTable.title,
      description: submissionsTable.description,
      type: submissionsTable.type,
      severity: submissionsTable.severity,
      category: submissionsTable.category,
      status: submissionsTable.status,
      points_awarded: submissionsTable.points_awarded,
      ai_analysis: submissionsTable.ai_analysis,
      reviewer_notes: submissionsTable.reviewer_notes,
      target_url: submissionsTable.target_url,
      steps_to_reproduce: submissionsTable.steps_to_reproduce,
      impact_description: submissionsTable.impact_description,
      fix_suggestion: submissionsTable.fix_suggestion,
      escalated_to: submissionsTable.escalated_to,
      created_at: submissionsTable.created_at,
      updated_at: submissionsTable.updated_at,
      user_name: usersTable.name,
    }).from(submissionsTable)
      .leftJoin(usersTable, eq(submissionsTable.user_id, usersTable.id))
      .where(eq(submissionsTable.user_id, user.id))
      .orderBy(desc(submissionsTable.created_at))
      .limit(5);

    res.json({
      user: safeUser,
      submission_count: Number(submCount),
      verified_count: Number(verCount),
      badge_count: Number(badgeCount),
      recent_badges: recentBadges.map(b => ({ badge: b.badge, earned_at: b.earned_at })),
      recent_submissions: recentSubmissions,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/profile", authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;
    const { name, bio, github_url, linkedin_url, state, college_name } = req.body;

    const [updated] = await db.update(usersTable).set({
      name: name || user.name,
      bio,
      github_url,
      linkedin_url,
      state,
      college_name,
    }).where(eq(usersTable.id, user.id)).returning();

    const { password_hash, ...safe } = updated;
    res.json(safe);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/stats", authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;

    const [{ totalSubs }] = await db.select({ totalSubs: sql<number>`count(*)` }).from(submissionsTable).where(eq(submissionsTable.user_id, user.id));
    const [{ verifiedSubs }] = await db.select({ verifiedSubs: sql<number>`count(*)` }).from(submissionsTable).where(eq(submissionsTable.user_id, user.id));
    const [{ badgeCount }] = await db.select({ badgeCount: sql<number>`count(*)` }).from(userBadgesTable).where(eq(userBadgesTable.user_id, user.id));

    const recentSubs = await db.select({
      id: submissionsTable.id,
      user_id: submissionsTable.user_id,
      title: submissionsTable.title,
      description: submissionsTable.description,
      type: submissionsTable.type,
      severity: submissionsTable.severity,
      category: submissionsTable.category,
      status: submissionsTable.status,
      points_awarded: submissionsTable.points_awarded,
      ai_analysis: submissionsTable.ai_analysis,
      reviewer_notes: submissionsTable.reviewer_notes,
      target_url: submissionsTable.target_url,
      steps_to_reproduce: submissionsTable.steps_to_reproduce,
      impact_description: submissionsTable.impact_description,
      fix_suggestion: submissionsTable.fix_suggestion,
      escalated_to: submissionsTable.escalated_to,
      created_at: submissionsTable.created_at,
      updated_at: submissionsTable.updated_at,
      user_name: usersTable.name,
    }).from(submissionsTable)
      .leftJoin(usersTable, eq(submissionsTable.user_id, usersTable.id))
      .where(eq(submissionsTable.user_id, user.id))
      .orderBy(desc(submissionsTable.created_at))
      .limit(3);

    const recentAlerts = await db.select().from(cyberAlertsTable)
      .where(eq(cyberAlertsTable.is_active, 1))
      .orderBy(desc(cyberAlertsTable.created_at))
      .limit(3);

    res.json({
      total_points: user.total_points || 0,
      national_rank: user.national_rank || null,
      verified_submissions: Number(verifiedSubs),
      total_submissions: Number(totalSubs),
      wallet_balance: user.wallet_balance || 0,
      badge_count: Number(badgeCount),
      skill_level: user.skill_level || "beginner",
      recent_alerts: recentAlerts,
      recent_submissions: recentSubs,
    });
  } catch (error) {
    req.log.error({ error }, "Dashboard stats error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
