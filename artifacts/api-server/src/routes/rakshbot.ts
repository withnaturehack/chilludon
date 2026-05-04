import { Router } from "express";
import { db } from "@workspace/db";
import { chatMessagesTable, submissionsTable, userBadgesTable, badgesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { authMiddleware } from "../lib/auth";
import { anthropic } from "@workspace/integrations-anthropic-ai";

const router = Router();

router.post("/rakshbot/chat", authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;
    const { message } = req.body;

    if (!message) {
      res.status(400).json({ error: "Message required" });
      return;
    }

    // Get user context
    const submissions = await db.select().from(submissionsTable).where(eq(submissionsTable.user_id, user.id)).limit(5);
    const userBadges = await db.select({ badge: badgesTable }).from(userBadgesTable)
      .leftJoin(badgesTable, eq(userBadgesTable.badge_id, badgesTable.id))
      .where(eq(userBadgesTable.user_id, user.id)).limit(5);

    // Get recent chat history
    const history = await db.select().from(chatMessagesTable)
      .where(eq(chatMessagesTable.user_id, user.id))
      .orderBy(desc(chatMessagesTable.created_at))
      .limit(20);

    const systemPrompt = `You are RakshBot, the AI cybersecurity mentor of CyberShield India — India's national cybersecurity platform. You are a helpful, knowledgeable, and encouraging cybersecurity expert who speaks Hinglish (mix of Hindi and English naturally).

User Profile:
- Name: ${user.name}
- Skill Level: ${user.skill_level || "beginner"}
- Total Points: ${user.total_points || 0}
- National Rank: ${user.national_rank || "unranked"}
- Verified Submissions: ${submissions.filter(s => s.status === "verified").length}
- Badges Earned: ${userBadges.map(b => b.badge?.name).join(", ") || "None yet"}

Your capabilities:
1. Answer cybersecurity questions at the right level for the user's skill tier
2. Review submission drafts and give feedback
3. Explain concepts using Indian examples (IRCTC, BSNL, Aadhaar, UPI, etc.)
4. Give daily cybersecurity tips personalized to their weak areas
5. Help with CTF challenge hints (never give the flag directly)
6. Teach attack techniques through guided conversation
7. Motivate and encourage students

Important rules:
- Always encourage ethical hacking and responsible disclosure
- Never help with actual malicious activities
- Use Indian context (mention Indian government portals, apps, banks when giving examples)
- Be warm, encouraging, and use Hinglish naturally
- Keep responses focused and practical
- Never reveal actual CTF flags
- Ownership: This platform is owned by Kartik Chilkoti`;

    // Build message history for context
    const messages: { role: "user" | "assistant"; content: string }[] = history
      .reverse()
      .map(h => ({ role: h.role as "user" | "assistant", content: h.content }));
    
    messages.push({ role: "user", content: message });

    // Save user message
    await db.insert(chatMessagesTable).values({
      user_id: user.id,
      role: "user",
      content: message,
    });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: systemPrompt,
      messages,
    });

    const assistantMessage = response.content[0].type === "text" ? response.content[0].text : "";

    // Save assistant message
    const [saved] = await db.insert(chatMessagesTable).values({
      user_id: user.id,
      role: "assistant",
      content: assistantMessage,
    }).returning();

    res.json({ response: assistantMessage, message_id: saved.id });
  } catch (error) {
    req.log.error({ error }, "RakshBot error");
    res.status(500).json({ error: "Internal server error", response: "Sorry, RakshBot is temporarily unavailable. Please try again later." });
  }
});

router.get("/rakshbot/history", authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;
    const { limit = 30 } = req.query;

    const messages = await db.select().from(chatMessagesTable)
      .where(eq(chatMessagesTable.user_id, user.id))
      .orderBy(chatMessagesTable.created_at)
      .limit(Number(limit));

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
