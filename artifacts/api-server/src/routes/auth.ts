import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { generateToken, authMiddleware } from "../lib/auth";

const router = Router();

router.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password, role = "student", college_name, college_city, state, station_name, badge_number, company_name } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: "Bad request", message: "Name, email and password are required" });
      return;
    }

    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (existing.length > 0) {
      res.status(400).json({ error: "Bad request", message: "Email already registered" });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(usersTable).values({
      name,
      email,
      password_hash,
      role,
      college_name,
      college_city,
      state,
      station_name,
      badge_number,
      company_name,
      skill_level: "beginner",
      total_points: 0,
      wallet_balance: 0,
    }).returning();

    const token = generateToken(user.id, user.role);
    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    req.log.error({ error }, "Register error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Bad request", message: "Email and password required" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!user) {
      res.status(401).json({ error: "Unauthorized", message: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: "Unauthorized", message: "Invalid credentials" });
      return;
    }

    await db.update(usersTable).set({ last_login: new Date() }).where(eq(usersTable.id, user.id));

    const token = generateToken(user.id, user.role);
    res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    req.log.error({ error }, "Login error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/auth/me", authMiddleware, (req, res) => {
  const user = (req as any).user;
  res.json(sanitizeUser(user));
});

function sanitizeUser(user: any) {
  const { password_hash, ...rest } = user;
  return rest;
}

export default router;
