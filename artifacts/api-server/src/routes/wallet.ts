import { Router } from "express";
import { db } from "@workspace/db";
import { walletTransactionsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { authMiddleware } from "../lib/auth";

const router = Router();

router.get("/wallet", authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;

    const transactions = await db.select().from(walletTransactionsTable)
      .where(eq(walletTransactionsTable.user_id, user.id))
      .orderBy(desc(walletTransactionsTable.created_at))
      .limit(50);

    res.json({
      balance: user.wallet_balance || 0,
      total_earned: user.total_earned || 0,
      transactions,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/wallet/withdraw", authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;
    const { amount, upi_id } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ error: "Invalid amount" });
      return;
    }

    if (amount > (user.wallet_balance || 0)) {
      res.status(400).json({ error: "Insufficient balance" });
      return;
    }

    const newBalance = (user.wallet_balance || 0) - amount;
    await db.update(usersTable).set({ wallet_balance: newBalance }).where(eq(usersTable.id, user.id));

    const [tx] = await db.insert(walletTransactionsTable).values({
      user_id: user.id,
      type: "withdrawal",
      amount: -amount,
      balance_after: newBalance,
      description: `Withdrawal to UPI: ${upi_id}`,
      status: "completed",
    }).returning();

    res.json(tx);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
