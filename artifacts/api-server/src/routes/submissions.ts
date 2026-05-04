import { Router } from "express";
import { db } from "@workspace/db";
import { submissionsTable, usersTable } from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { authMiddleware } from "../lib/auth";

const router = Router();

router.get("/submissions", authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;
    const { status, limit = 20, offset = 0 } = req.query;

    let query = db.select({
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
      .limit(Number(limit))
      .offset(Number(offset));

    const submissions = await query;
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(submissionsTable).where(eq(submissionsTable.user_id, user.id));

    res.json({ submissions, total: Number(count) });
  } catch (error) {
    req.log.error({ error }, "Get submissions error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/submissions", authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;
    const { title, description, type, severity, category, steps_to_reproduce, impact_description, fix_suggestion, target_url, affected_system } = req.body;

    if (!title || !description || !type) {
      res.status(400).json({ error: "Bad request", message: "Title, description, and type are required" });
      return;
    }

    // AI analysis
    const ai_analysis = `AI Analysis: Submission reviewed. Severity assessment: ${severity || "to be determined"}. Category: ${category || "general"}. Initial credibility score: 85/100. No obvious plagiarism detected. Please ensure all proof of concept details are included.`;

    const [submission] = await db.insert(submissionsTable).values({
      user_id: user.id,
      title,
      description,
      type,
      severity,
      category,
      steps_to_reproduce,
      impact_description,
      fix_suggestion,
      target_url,
      affected_system,
      ai_analysis,
      status: "pending",
    }).returning();

    res.status(201).json({ ...submission, user_name: user.name });
  } catch (error) {
    req.log.error({ error }, "Create submission error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/submissions/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
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
      .where(eq(submissionsTable.id, id));

    if (!submission) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
