import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { authMiddleware } from "../lib/auth";

const router = Router();

router.get("/notifications", authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;
    const notifications = await db.select().from(notificationsTable)
      .where(eq(notificationsTable.user_id, user.id))
      .orderBy(desc(notificationsTable.created_at))
      .limit(30);

    const [{ unread }] = await db.select({ unread: sql<number>`count(*)` }).from(notificationsTable)
      .where(eq(notificationsTable.user_id, user.id));

    res.json({ notifications, unread_count: Number(unread) });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/notifications/:id/read", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const [notification] = await db.update(notificationsTable).set({ is_read: 1 }).where(eq(notificationsTable.id, id)).returning();
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
