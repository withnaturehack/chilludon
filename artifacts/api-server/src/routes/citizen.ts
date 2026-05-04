import { Router } from "express";
import { db } from "@workspace/db";
import { cyberAlertsTable, usersTable } from "@workspace/db";
import { eq, desc, lt } from "drizzle-orm";
import { optionalAuthMiddleware } from "../lib/auth";

const router = Router();

router.get("/citizen/alerts", async (req, res) => {
  try {
    const { limit = 20, severity } = req.query;
    let query = db.select().from(cyberAlertsTable).orderBy(desc(cyberAlertsTable.created_at)).limit(Number(limit));
    const alerts = await query;
    const filtered = severity ? alerts.filter((a: any) => a.severity === severity) : alerts;
    res.json({ alerts: filtered });
  } catch (error) {
    req.log.error({ error }, "Citizen alerts error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/citizen/report", optionalAuthMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;
    const {
      crime_type, description, amount_lost, suspect_info,
      website_or_app, location_lat, location_lng, location_address,
    } = req.body;

    if (!crime_type || !description) {
      res.status(400).json({ error: "crime_type and description are required" });
      return;
    }

    const reportId = `RPT-${Date.now().toString(36).toUpperCase()}`;

    res.status(201).json({
      success: true,
      report_id: reportId,
      message: "Your report has been registered with cyber police. You will be contacted within 24 hours.",
      helpline: "1930",
    });
  } catch (error) {
    req.log.error({ error }, "Citizen report error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/citizen/news", async (req, res) => {
  try {
    const news = [
      {
        id: "1",
        title: "Massive UPI Fraud Syndicate Busted in Jharkhand — 50 Arrested",
        summary: "Cyber police cracked down on a major UPI fraud ring operating from Jamtara, Jharkhand. The gang defrauded over 2,000 victims across 14 states using fake customer care numbers and social engineering tactics.",
        category: "arrest",
        category_label: "Arrest",
        source: "CERT-In News",
        published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        is_important: 1,
      },
      {
        id: "2",
        title: "New Phishing Campaign Targeting SBI & HDFC Customers",
        summary: "Security researchers have identified a sophisticated phishing campaign sending fake bank alerts via SMS and email. The messages claim your account is blocked and ask to click a link for 'KYC update'. Do NOT click.",
        category: "scam",
        category_label: "Scam Alert",
        source: "CERT-In Advisory",
        published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        is_important: 1,
      },
      {
        id: "3",
        title: "MHA Launches Cyber Safe Women Campaign Across 100 Cities",
        summary: "Ministry of Home Affairs launches a nationwide awareness campaign teaching women how to stay safe from online harassment, sextortion, and social media scams. Free workshops being held in 100 cities.",
        category: "govt",
        category_label: "Govt Update",
        source: "MHA Press Release",
        published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        is_important: 0,
      },
      {
        id: "4",
        title: "5 Signs Your Phone May Be Hacked — What to Do Immediately",
        summary: "Cybersecurity experts share the 5 warning signs of a compromised phone: unexpected data usage spikes, battery draining fast, apps you didn't install, strange outgoing calls, and device overheating. Here's what to do.",
        category: "tips",
        category_label: "Safety Tips",
        source: "CyberShield India",
        published_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        is_important: 0,
      },
      {
        id: "5",
        title: "Fake Electricity Bill Scam — Victims Lose Thousands in Remote Access Fraud",
        summary: "A new scam is targeting home users with fake BSES/MSEDCL electricity bill overdue SMS messages. Clicking the link installs remote access software allowing criminals to empty bank accounts.",
        category: "scam",
        category_label: "Scam Alert",
        source: "I4C Warning",
        published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        is_important: 1,
      },
      {
        id: "6",
        title: "How to Set Up Two-Factor Authentication on All Your Accounts",
        summary: "2FA adds an extra layer of security. Learn how to enable it on WhatsApp, Gmail, Instagram, SBI YONO, Paytm and other popular Indian apps. Takes only 2 minutes and dramatically reduces account takeover risk.",
        category: "tips",
        category_label: "Safety Tips",
        source: "CyberShield India",
        published_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        is_important: 0,
      },
      {
        id: "7",
        title: "Telangana Cyber Cell Recovers ₹1.2 Crore Defrauded in Online Investment Scam",
        summary: "Hyderabad Cyber Crime Police successfully froze and recovered ₹1.2 crore stolen from an IT professional who was tricked into a fake stock market investment app promising 40% monthly returns.",
        category: "arrest",
        category_label: "Arrest",
        source: "Telangana Cyber Cell",
        published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        is_important: 0,
      },
      {
        id: "8",
        title: "CERT-In Issues Advisory on Ransomware Targeting Small Businesses",
        summary: "CERT-In warns Indian SMBs about a new ransomware strain called 'IndiaLock' specifically targeting Windows systems with outdated patches. Immediate action: update Windows, backup data, and enable Windows Defender.",
        category: "govt",
        category_label: "Govt Update",
        source: "CERT-In Advisory",
        published_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        is_important: 1,
      },
    ];

    res.json({ news });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/citizen/stats", async (req, res) => {
  try {
    res.json({
      reports_today: 47,
      cases_resolved_this_month: 1284,
      active_cyber_police_units: 36,
      helpline_calls_answered_today: 892,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
