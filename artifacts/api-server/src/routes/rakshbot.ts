import { Router } from "express";
import { db } from "@workspace/db";
import { chatMessagesTable, submissionsTable, userBadgesTable, badgesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { authMiddleware } from "../lib/auth";

const router = Router();

const NVIDIA_BASE = "https://integrate.api.nvidia.com/v1";
const NVIDIA_MODEL = "meta/llama-3.1-8b-instruct";

async function callNvidiaAI(systemPrompt: string, messages: { role: "user" | "assistant"; content: string }[]): Promise<string> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) throw new Error("NVIDIA_API_KEY not configured");

  const payload = {
    model: NVIDIA_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
    max_tokens: 1024,
    temperature: 0.7,
    top_p: 0.95,
    stream: false,
  };

  const res = await fetch(`${NVIDIA_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`NVIDIA API error ${res.status}: ${errText}`);
  }

  const data = await res.json() as any;
  return data.choices?.[0]?.message?.content || "Sorry, I could not generate a response. Please try again.";
}

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

    const systemPrompt = `You are RakshBot, the AI cybersecurity mentor of CyberShield India — India's national cybersecurity platform powered by NVIDIA AI. You are a helpful, knowledgeable, and encouraging cybersecurity expert who speaks Hinglish (mix of Hindi and English naturally).

User Profile:
- Name: ${user.name}
- Role: ${user.role}
- Skill Level: ${user.skill_level || "beginner"}
- Total Points: ${user.total_points || 0}
- National Rank: ${user.national_rank || "unranked"}
- Verified Submissions: ${submissions.filter((s: any) => s.status === "verified").length}
- Badges Earned: ${userBadges.map((b: any) => b.badge?.name).join(", ") || "None yet"}

Your capabilities:
1. Answer cybersecurity questions at the right level for the user's skill tier
2. Review submission drafts and give feedback
3. Explain concepts using Indian examples (IRCTC, BSNL, Aadhaar, UPI, SBI, PayTM, etc.)
4. Give daily cybersecurity tips personalized to their weak areas
5. Help with CTF challenge hints (never give the flag directly)
6. Teach attack techniques through guided conversation
7. Motivate and encourage students with their progress
8. Guide police officers on digital forensics and cyber crime investigation
9. Help companies understand vulnerability severity and remediation

Important rules:
- Always encourage ethical hacking and responsible disclosure
- Never help with actual malicious activities
- Use Indian context (mention Indian government portals, apps, banks when giving examples)
- Be warm, encouraging, and use Hinglish naturally
- Keep responses focused, practical and structured
- Never reveal actual CTF flags
- Use bullet points and clear formatting when explaining technical topics
- Ownership: This platform is owned by Kartik Chilkoti`;

    // Build message history for context
    const messages: { role: "user" | "assistant"; content: string }[] = history
      .reverse()
      .map((h: any) => ({ role: h.role as "user" | "assistant", content: h.content }));

    messages.push({ role: "user", content: message });

    // Save user message
    await db.insert(chatMessagesTable).values({
      user_id: user.id,
      role: "user",
      content: message,
    });

    const assistantMessage = await callNvidiaAI(systemPrompt, messages);

    // Save assistant message
    const [saved] = await db.insert(chatMessagesTable).values({
      user_id: user.id,
      role: "assistant",
      content: assistantMessage,
    }).returning();

    res.json({ response: assistantMessage, message_id: saved.id });
  } catch (error: any) {
    req.log.error({ error }, "RakshBot NVIDIA error");
    res.status(500).json({
      error: "Internal server error",
      response: "Yaar, RakshBot abhi thoda busy hai! Please try again in a moment. 🤖",
    });
  }
});

router.post("/rakshbot/analyze", authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;
    const { title, description, type, severity, target_url } = req.body;

    const systemPrompt = `You are RakshBot, a cybersecurity AI analyst for CyberShield India. Analyze vulnerability reports submitted to the platform and provide structured analysis.

Respond with a JSON object containing:
{
  "summary": "Brief 1-2 sentence summary of the vulnerability",
  "risk_assessment": "Critical/High/Medium/Low with brief reason",
  "attack_vector": "How an attacker could exploit this",
  "impact": "Potential business and user impact",
  "suggested_fix": "Concrete remediation steps",
  "cvss_estimate": "Estimated CVSS score 0-10",
  "tags": ["relevant", "security", "tags"]
}

Be accurate, technical, and use OWASP/CVE terminology where appropriate.`;

    const userMsg = `Analyze this vulnerability report:
Title: ${title}
Type: ${type}
Severity: ${severity}
Target URL: ${target_url || "Not specified"}
Description: ${description}`;

    const rawResponse = await callNvidiaAI(systemPrompt, [{ role: "user", content: userMsg }]);

    let analysis: any = {};
    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) analysis = JSON.parse(jsonMatch[0]);
      else analysis = { summary: rawResponse };
    } catch {
      analysis = { summary: rawResponse };
    }

    res.json({ analysis });
  } catch (error: any) {
    req.log.error({ error }, "RakshBot analyze error");
    res.status(500).json({ error: "Analysis failed" });
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
