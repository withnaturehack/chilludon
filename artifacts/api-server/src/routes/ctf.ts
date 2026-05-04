import { Router } from "express";
import { db } from "@workspace/db";
import { ctfChallengesTable, ctfSolutionsTable, usersTable, walletTransactionsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { authMiddleware } from "../lib/auth";

const router = Router();

router.get("/ctf", async (req, res) => {
  try {
    const challenges = await db.select({
      id: ctfChallengesTable.id,
      title: ctfChallengesTable.title,
      description: ctfChallengesTable.description,
      category: ctfChallengesTable.category,
      difficulty: ctfChallengesTable.difficulty,
      points: ctfChallengesTable.points,
      hints: ctfChallengesTable.hints,
      solve_count: ctfChallengesTable.solve_count,
      created_at: ctfChallengesTable.created_at,
    }).from(ctfChallengesTable).where(eq(ctfChallengesTable.is_active, 1));

    res.json({ challenges, total: challenges.length });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/ctf/:id/submit", authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { flag } = req.body;

    const [challenge] = await db.select().from(ctfChallengesTable).where(eq(ctfChallengesTable.id, id));
    if (!challenge) {
      res.status(404).json({ error: "Challenge not found" });
      return;
    }

    const existing = await db.select().from(ctfSolutionsTable)
      .where(eq(ctfSolutionsTable.challenge_id, id));
    const alreadySolved = existing.find(s => s.user_id === user.id && s.is_correct);
    if (alreadySolved) {
      res.json({ correct: false, points_earned: 0, message: "You already solved this challenge!" });
      return;
    }

    const correct = flag?.trim() === challenge.flag;

    await db.insert(ctfSolutionsTable).values({
      challenge_id: id,
      user_id: user.id,
      is_correct: correct ? 1 : 0,
    }).onConflictDoNothing();

    if (correct) {
      await db.update(ctfChallengesTable).set({ solve_count: sql`solve_count + 1` }).where(eq(ctfChallengesTable.id, id));
      const newPoints = (user.total_points || 0) + challenge.points;
      const newBalance = (user.wallet_balance || 0) + challenge.points * 0.5;
      await db.update(usersTable).set({
        total_points: newPoints,
        wallet_balance: newBalance,
      }).where(eq(usersTable.id, user.id));

      await db.insert(walletTransactionsTable).values({
        user_id: user.id,
        type: "bonus",
        amount: challenge.points * 0.5,
        balance_after: newBalance,
        description: `CTF Solved: ${challenge.title}`,
        status: "completed",
      });

      res.json({ correct: true, points_earned: challenge.points, message: `Correct! You earned ${challenge.points} points!` });
    } else {
      res.json({ correct: false, points_earned: 0, message: "Wrong flag. Try again!" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
