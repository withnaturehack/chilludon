import { Router } from "express";
import { db } from "@workspace/db";
import { internshipsTable, internshipApplicationsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { authMiddleware } from "../lib/auth";

const router = Router();

router.get("/internships", async (req, res) => {
  try {
    const internships = await db.select().from(internshipsTable)
      .where(eq(internshipsTable.status, "open"))
      .orderBy(internshipsTable.created_at);
    res.json({ internships, total: internships.length });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/internships/my-applications", authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;
    const applications = await db.select({
      application: internshipApplicationsTable,
      internship: internshipsTable,
    }).from(internshipApplicationsTable)
      .leftJoin(internshipsTable, eq(internshipApplicationsTable.internship_id, internshipsTable.id))
      .where(eq(internshipApplicationsTable.user_id, user.id));

    res.json({ applications: applications.map(a => ({ application: a.application, internship: a.internship })) });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/internships/:id/apply", authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { cover_letter } = req.body;

    const existing = await db.select().from(internshipApplicationsTable)
      .where(eq(internshipApplicationsTable.internship_id, id));
    const alreadyApplied = existing.find(a => a.user_id === user.id);
    if (alreadyApplied) {
      res.json(alreadyApplied);
      return;
    }

    const [application] = await db.insert(internshipApplicationsTable).values({
      internship_id: id,
      user_id: user.id,
      cover_letter,
      status: "applied",
    }).returning();

    await db.update(internshipsTable).set({ filled_seats: sql`filled_seats + 1` }).where(eq(internshipsTable.id, id));

    res.json(application);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
