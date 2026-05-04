import { Router } from "express";
import { db } from "@workspace/db";
import { bugBountyProgramsTable, internshipsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
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

    res.json({
      active_programs: Number(programs),
      total_reports_received: 58,
      total_paid: 1250000,
      open_internships: Number(internships),
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
