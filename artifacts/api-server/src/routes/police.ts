import { Router } from "express";
import { db } from "@workspace/db";
import { submissionsTable, policeCasesTable, usersTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { authMiddleware, requireRole } from "../lib/auth";

const router = Router();

router.get("/police/submissions", authMiddleware, requireRole("police", "admin"), async (req, res) => {
  try {
    const { status, severity } = req.query;

    const submissions = await db.select({
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
      .orderBy(desc(submissionsTable.created_at))
      .limit(100);

    res.json({ submissions, total: submissions.length });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/police/submissions/:id/review", authMiddleware, requireRole("police", "admin"), async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { status, reviewer_notes, points_awarded = 0 } = req.body;

    const [submission] = await db.update(submissionsTable).set({
      status,
      reviewer_notes,
      points_awarded: Number(points_awarded),
      reviewer_id: user.id,
      reviewed_at: new Date(),
    }).where(eq(submissionsTable.id, id)).returning();

    if (!submission) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    // Award points to student if verified
    if (status === "verified" && points_awarded > 0 && submission.user_id) {
      const [student] = await db.select().from(usersTable).where(eq(usersTable.id, submission.user_id));
      if (student) {
        await db.update(usersTable).set({
          total_points: (student.total_points || 0) + Number(points_awarded),
          wallet_balance: (student.wallet_balance || 0) + Number(points_awarded),
          total_earned: (student.total_earned || 0) + Number(points_awarded),
        }).where(eq(usersTable.id, submission.user_id));
      }
    }

    // Create police case for escalated submissions
    if (status === "escalated") {
      const caseNumber = `CS-${Date.now()}`;
      await db.insert(policeCasesTable).values({
        submission_id: id,
        police_station_id: user.id,
        case_number: caseNumber,
        status: "open",
        priority: submission.severity === "critical" ? "critical" : "high",
      }).onConflictDoNothing();
    }

    const [result] = await db.select({
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
      .where(eq(submissionsTable.id, id));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/police/cases", authMiddleware, requireRole("police", "admin"), async (req, res) => {
  try {
    const cases = await db.select({
      id: policeCasesTable.id,
      submission_id: policeCasesTable.submission_id,
      case_number: policeCasesTable.case_number,
      status: policeCasesTable.status,
      priority: policeCasesTable.priority,
      fir_number: policeCasesTable.fir_number,
      notes: policeCasesTable.notes,
      created_at: policeCasesTable.created_at,
    }).from(policeCasesTable).orderBy(desc(policeCasesTable.created_at)).limit(50);

    const casesWithSubmissions = await Promise.all(cases.map(async (c) => {
      const [submission] = await db.select({
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
        .where(eq(submissionsTable.id, c.submission_id!));
      return { ...c, submission: submission || null };
    }));

    res.json({ cases: casesWithSubmissions, total: casesWithSubmissions.length });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/police/stats", authMiddleware, requireRole("police", "admin"), async (req, res) => {
  try {
    const [{ pending }] = await db.select({ pending: sql<number>`count(*)` }).from(submissionsTable).where(eq(submissionsTable.status, "pending"));
    const [{ verified }] = await db.select({ verified: sql<number>`count(*)` }).from(submissionsTable).where(eq(submissionsTable.status, "verified"));
    const [{ openCases }] = await db.select({ openCases: sql<number>`count(*)` }).from(policeCasesTable).where(eq(policeCasesTable.status, "open"));
    const [{ critical }] = await db.select({ critical: sql<number>`count(*)` }).from(submissionsTable).where(eq(submissionsTable.severity, "critical"));
    const [{ total }] = await db.select({ total: sql<number>`count(*)` }).from(submissionsTable);
    const [{ fraud }] = await db.select({ fraud: sql<number>`count(*)` }).from(submissionsTable).where(eq(submissionsTable.status, "fraud"));

    res.json({
      pending_review: Number(pending),
      verified_today: Number(verified),
      open_cases: Number(openCases),
      critical_submissions: Number(critical),
      total_submissions: Number(total),
      fraud_flagged: Number(fraud),
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
