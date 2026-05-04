import { Router } from "express";
import { db } from "@workspace/db";
import { coursesTable, courseEnrollmentsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { authMiddleware } from "../lib/auth";

const router = Router();

router.get("/courses", async (req, res) => {
  try {
    const { level, category, is_free } = req.query;
    const courses = await db.select().from(coursesTable).orderBy(coursesTable.enrolled_count);
    res.json({ courses, total: courses.length });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/courses/my-courses", authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;
    const enrollments = await db.select({
      enrollment: courseEnrollmentsTable,
      course: coursesTable,
    }).from(courseEnrollmentsTable)
      .leftJoin(coursesTable, eq(courseEnrollmentsTable.course_id, coursesTable.id))
      .where(eq(courseEnrollmentsTable.user_id, user.id));

    const courses = enrollments.map(e => ({ course: e.course, enrollment: e.enrollment }));
    res.json({ courses });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/courses/:id/enroll", authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const existing = await db.select().from(courseEnrollmentsTable)
      .where(eq(courseEnrollmentsTable.user_id, user.id));

    const alreadyEnrolled = existing.find(e => e.course_id === id);
    if (alreadyEnrolled) {
      res.json(alreadyEnrolled);
      return;
    }

    const [enrollment] = await db.insert(courseEnrollmentsTable).values({
      user_id: user.id,
      course_id: id,
      progress_percent: 0,
    }).returning();

    await db.update(coursesTable)
      .set({ enrolled_count: sql`enrolled_count + 1` })
      .where(eq(coursesTable.id, id));

    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
