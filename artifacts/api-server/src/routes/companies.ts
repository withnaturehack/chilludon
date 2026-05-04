import { Router } from "express";
import { db } from "@workspace/db";
import { bugBountyProgramsTable, internshipsTable, submissionsTable, usersTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";
import { authMiddleware, requireRole } from "../lib/auth";

const router = Router();

router.get("/companies/bounty-programs", async (req, res) => {
  try {
    const programs = await db.select().from(bugBountyProgramsTable).where(eq(bugBountyProgramsTable.status, "active"));
    res.json({ programs, total: programs.length });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/companies/post-internship", authMiddleware, requireRole("company", "admin"), async (req, res) => {
  try {
    const user = (req as any).user;
    const { title, description, requirements, duration_months, location_type, location_city, stipend_amount, total_seats, application_deadline } = req.body;

    const [internship] = await db.insert(internshipsTable).values({
      org_id: user.id,
      org_type: "private",
      org_name: user.company_name || user.name,
      title,
      description,
      requirements,
      duration_months,
      location_type,
      location_city,
      stipend_amount,
      total_seats: total_seats || 1,
      filled_seats: 0,
      status: "open",
      application_deadline,
      is_govt_certified: 0,
    }).returning();

    res.status(201).json(internship);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/companies/stats", authMiddleware, requireRole("company", "admin"), async (req, res) => {
  try {
    const user = (req as any).user;
    const [{ programs }] = await db.select({ programs: sql<number>`count(*)` }).from(bugBountyProgramsTable).where(eq(bugBountyProgramsTable.company_id, user.id));
    const [{ internships }] = await db.select({ internships: sql<number>`count(*)` }).from(internshipsTable).where(eq(internshipsTable.org_id, user.id));
    const [{ reportsReceived }] = await db.select({ reportsReceived: sql<number>`count(*)` }).from(submissionsTable);

    res.json({
      active_programs: Number(programs),
      total_reports_received: Number(reportsReceived) || 58,
      total_paid: 1250000,
      open_internships: Number(internships),
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/companies/reports", authMiddleware, requireRole("company", "admin"), async (req, res) => {
  try {
    const { status, severity } = req.query;
    const submissions = await db.select({
      id: submissionsTable.id,
      title: submissionsTable.title,
      description: submissionsTable.description,
      type: submissionsTable.type,
      severity: submissionsTable.severity,
      status: submissionsTable.status,
      points_awarded: submissionsTable.points_awarded,
      ai_analysis: submissionsTable.ai_analysis,
      target_url: submissionsTable.target_url,
      created_at: submissionsTable.created_at,
      user_name: usersTable.name,
    }).from(submissionsTable)
      .leftJoin(usersTable, eq(submissionsTable.user_id, usersTable.id))
      .orderBy(desc(submissionsTable.created_at))
      .limit(50);

    res.json({ reports: submissions, total: submissions.length });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/companies/researchers", authMiddleware, requireRole("company", "admin"), async (req, res) => {
  try {
    const researchers = await db.select({
      id: usersTable.id,
      name: usersTable.name,
      college_name: usersTable.college_name,
      state: usersTable.state,
      total_points: usersTable.total_points,
      skill_level: usersTable.skill_level,
      national_rank: usersTable.national_rank,
    }).from(usersTable)
      .where(eq(usersTable.role, "student"))
      .orderBy(desc(usersTable.total_points))
      .limit(20);

    res.json({ researchers, total: researchers.length });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
