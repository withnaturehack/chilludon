import { db } from "@workspace/db";
import {
  usersTable,
  badgesTable,
  userBadgesTable,
  coursesTable,
  submissionsTable,
  internshipsTable,
  bugBountyProgramsTable,
  ctfChallengesTable,
  cyberAlertsTable,
  walletTransactionsTable,
} from "@workspace/db";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { logger } from "./logger";

async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function seedDatabase() {
  try {
    const existing = await db.select().from(usersTable).limit(1);
    if (existing.length > 0) {
      logger.info("Database already seeded, skipping.");
      return;
    }

    logger.info("Seeding database...");

    // Admin
    const adminHash = await hashPassword("Admin@123");
    const [admin] = await db.insert(usersTable).values({
      name: "CyberShield Admin",
      email: "admin@cybershield.in",
      password_hash: adminHash,
      role: "admin",
      is_verified: 1,
      total_points: 0,
    }).returning();

    // Police
    const policeHash = await hashPassword("Police@123");
    const [police] = await db.insert(usersTable).values({
      name: "Inspector Ramesh Kumar",
      email: "police@cybershield.in",
      password_hash: policeHash,
      role: "police",
      station_name: "Delhi Cyber Crime Cell",
      station_id: "DL-CYB-001",
      badge_number: "IPS-4521",
      jurisdiction_state: "Delhi",
      jurisdiction_city: "New Delhi",
      is_verified: 1,
    }).returning();

    // Company
    const companyHash = await hashPassword("Company@123");
    const [company] = await db.insert(usersTable).values({
      name: "TechCorp Security",
      email: "company@cybershield.in",
      password_hash: companyHash,
      role: "company",
      company_name: "TechCorp India Pvt. Ltd.",
      company_website: "https://techcorp.in",
      is_verified: 1,
    }).returning();

    // Students
    const studentHash = await hashPassword("Student@123");
    const studentData = [
      { name: "Arjun Sharma", email: "arjun@student.in", college_name: "IIT Delhi", college_city: "Delhi", state: "Delhi", total_points: 2450, national_rank: 1, skill_level: "advanced", skill_score: 890 },
      { name: "Priya Patel", email: "priya@student.in", college_name: "NIT Surat", college_city: "Surat", state: "Gujarat", total_points: 2100, national_rank: 2, skill_level: "advanced", skill_score: 820 },
      { name: "Rohit Verma", email: "rohit@student.in", college_name: "VIT Vellore", college_city: "Vellore", state: "Tamil Nadu", total_points: 1850, national_rank: 3, skill_level: "intermediate", skill_score: 750 },
      { name: "Sneha Reddy", email: "sneha@student.in", college_name: "IIIT Hyderabad", college_city: "Hyderabad", state: "Telangana", total_points: 1600, national_rank: 4, skill_level: "intermediate", skill_score: 680 },
      { name: "Amit Kumar", email: "amit@student.in", college_name: "DTU Delhi", college_city: "Delhi", state: "Delhi", total_points: 1420, national_rank: 5, skill_level: "intermediate", skill_score: 610 },
      { name: "Kavya Nair", email: "kavya@student.in", college_name: "NIT Calicut", college_city: "Calicut", state: "Kerala", total_points: 1280, national_rank: 6, skill_level: "intermediate", skill_score: 540 },
      { name: "Vikram Singh", email: "vikram@student.in", college_name: "BITS Pilani", college_city: "Pilani", state: "Rajasthan", total_points: 1150, national_rank: 7, skill_level: "intermediate", skill_score: 480 },
      { name: "Divya Menon", email: "divya@student.in", college_name: "Amrita University", college_city: "Coimbatore", state: "Kerala", total_points: 980, national_rank: 8, skill_level: "beginner", skill_score: 410 },
      { name: "Rahul Gupta", email: "rahul@student.in", college_name: "Jadavpur University", college_city: "Kolkata", state: "West Bengal", total_points: 820, national_rank: 9, skill_level: "beginner", skill_score: 340 },
      { name: "Ananya Iyer", email: "ananya@student.in", college_name: "Anna University", college_city: "Chennai", state: "Tamil Nadu", total_points: 650, national_rank: 10, skill_level: "beginner", skill_score: 280 },
    ];

    const students = [];
    for (const s of studentData) {
      const [student] = await db.insert(usersTable).values({
        ...s,
        password_hash: studentHash,
        role: "student",
        is_verified: 1,
        wallet_balance: Math.floor(Math.random() * 5000) + 500,
        total_earned: Math.floor(Math.random() * 20000) + 2000,
      }).returning();
      students.push(student);
    }

    const [arjun, priya, rohit, sneha, amit, kavya, vikram, divya, rahul, ananya] = students;

    // Badges
    const badgeData = [
      { name: "First Blood", description: "Submitted first verified vulnerability", emoji: "🩸", category: "finding", color: "#ef4444", is_rare: 0 },
      { name: "Zero Day Hunter", description: "Discovered unpatched zero-day", emoji: "⚡", category: "finding", color: "#f97316", is_rare: 1 },
      { name: "Gov Guardian", description: "Reported government portal bug", emoji: "🛡️", category: "government", color: "#3b82f6", is_rare: 1 },
      { name: "Bank Buster", description: "Found financial system vulnerability", emoji: "🏦", category: "finding", color: "#10b981", is_rare: 1 },
      { name: "Eagle Eye", description: "10 verified findings in one month", emoji: "👁️", category: "finding", color: "#8b5cf6", is_rare: 0 },
      { name: "Patch Master", description: "Fix suggestion was officially adopted", emoji: "🔧", category: "fixing", color: "#06b6d4", is_rare: 0 },
      { name: "Bug Doctor", description: "Helped fix 50+ vulnerabilities", emoji: "💊", category: "fixing", color: "#ec4899", is_rare: 1 },
      { name: "CTF Warrior", description: "Won 5 CTF challenges", emoji: "⚔️", category: "learning", color: "#f59e0b", is_rare: 0 },
      { name: "Knowledge Seeker", description: "Completed 10 skill modules", emoji: "📚", category: "learning", color: "#84cc16", is_rare: 0 },
      { name: "CERT-In Recognized", description: "Officially recognized by CERT-In", emoji: "🏆", category: "government", color: "#f97316", is_rare: 1 },
      { name: "Integrity Hero", description: "Caught fraudulent submission", emoji: "✅", category: "special", color: "#10b981", is_rare: 1 },
      { name: "National Cyber Hero", description: "Lifetime national contributor", emoji: "⭐", category: "government", color: "#fbbf24", is_rare: 1 },
      { name: "Rapid Responder", description: "Fixed critical bug within 24hrs", emoji: "⏱️", category: "fixing", color: "#ef4444", is_rare: 0 },
      { name: "Dark Web Spotter", description: "Identified data in dark web breach", emoji: "🌑", category: "finding", color: "#7c3aed", is_rare: 1 },
      { name: "Team Player", description: "Won a team CTF challenge", emoji: "👥", category: "special", color: "#0ea5e9", is_rare: 0 },
    ];

    const badges: any[] = [];
    for (const b of badgeData) {
      const [badge] = await db.insert(badgesTable).values(b).returning();
      badges.push(badge);
    }

    const [firstBlood, zeroDayHunter, govGuardian, bankBuster, eagleEye, patchMaster, bugDoctor, ctfWarrior, knowledgeSeeker, certInRecognized, integrityHero, nationalHero, rapidResponder, darkWebSpotter, teamPlayer] = badges;

    // Assign badges to students
    const badgeAssignments: { userId: string; badgeId: string }[] = [
      // Arjun
      { userId: arjun.id, badgeId: firstBlood.id },
      { userId: arjun.id, badgeId: eagleEye.id },
      { userId: arjun.id, badgeId: zeroDayHunter.id },
      { userId: arjun.id, badgeId: ctfWarrior.id },
      { userId: arjun.id, badgeId: certInRecognized.id },
      // Priya
      { userId: priya.id, badgeId: firstBlood.id },
      { userId: priya.id, badgeId: govGuardian.id },
      { userId: priya.id, badgeId: patchMaster.id },
      // Rohit
      { userId: rohit.id, badgeId: firstBlood.id },
      { userId: rohit.id, badgeId: ctfWarrior.id },
      { userId: rohit.id, badgeId: knowledgeSeeker.id },
      // Sneha
      { userId: sneha.id, badgeId: firstBlood.id },
      { userId: sneha.id, badgeId: bankBuster.id },
      { userId: sneha.id, badgeId: rapidResponder.id },
      // Amit
      { userId: amit.id, badgeId: firstBlood.id },
      { userId: amit.id, badgeId: teamPlayer.id },
      // Others - first blood only
      { userId: kavya.id, badgeId: firstBlood.id },
      { userId: vikram.id, badgeId: firstBlood.id },
      { userId: divya.id, badgeId: firstBlood.id },
      { userId: rahul.id, badgeId: firstBlood.id },
      { userId: ananya.id, badgeId: firstBlood.id },
    ];

    for (const { userId, badgeId } of badgeAssignments) {
      await db.insert(userBadgesTable).values({ user_id: userId, badge_id: badgeId }).onConflictDoNothing();
    }

    // Courses
    const courseData = [
      { title: "Ethical Hacking Fundamentals", description: "Complete beginner's guide to ethical hacking and penetration testing", instructor_name: "Rajesh Kumar", instructor_org: "CERT-In", level: "beginner", category: "web", duration_hours: 8, total_lessons: 24, is_free: 1, price: 0, is_certified: 1, enrolled_count: 1240, rating: 4.8, tags: '["beginner","ethical hacking","basics"]' },
      { title: "Web Application Security — OWASP Top 10", description: "Deep dive into the OWASP Top 10 vulnerabilities with hands-on labs", instructor_name: "Dr. Priya Sharma", instructor_org: "IIT Delhi", level: "intermediate", category: "web", duration_hours: 15, total_lessons: 42, is_free: 1, price: 0, is_certified: 1, enrolled_count: 980, rating: 4.9, tags: '["owasp","web security","intermediate"]' },
      { title: "Network Penetration Testing", description: "Advanced network hacking techniques for cybersecurity professionals", instructor_name: "Amit Singh", instructor_org: "Lucideus", level: "advanced", category: "network", duration_hours: 20, total_lessons: 58, is_free: 0, price: 999, is_certified: 1, enrolled_count: 542, rating: 4.7, tags: '["network","pentest","advanced"]' },
      { title: "Digital Forensics & Investigation", description: "Learn digital forensics techniques used by law enforcement", instructor_name: "Inspector Suresh Rao", instructor_org: "Cyber Police Mumbai", level: "beginner", category: "forensics", duration_hours: 10, total_lessons: 30, is_free: 1, price: 0, is_certified: 0, enrolled_count: 1680, rating: 4.6, tags: '["forensics","investigation","beginner"]' },
      { title: "Bug Bounty Hunting Masterclass", description: "Find real vulnerabilities and earn money from bug bounty programs", instructor_name: "Mohit Verma", instructor_org: "HackerOne India", level: "intermediate", category: "web", duration_hours: 12, total_lessons: 36, is_free: 1, price: 0, is_certified: 0, enrolled_count: 2100, rating: 4.9, tags: '["bug bounty","hunting","intermediate"]' },
      { title: "Mobile App Security Testing", description: "Security testing for Android and iOS applications", instructor_name: "Kavitha Reddy", instructor_org: "NASSCOM", level: "intermediate", category: "mobile", duration_hours: 14, total_lessons: 40, is_free: 0, price: 799, is_certified: 1, enrolled_count: 678, rating: 4.5, tags: '["mobile","android","ios"]' },
      { title: "OSINT & Reconnaissance Techniques", description: "Open source intelligence gathering for cybersecurity", instructor_name: "Deepak Nair", instructor_org: "CBI Cyber", level: "beginner", category: "osint", language: "Hindi", duration_hours: 8, total_lessons: 24, is_free: 1, price: 0, is_certified: 0, enrolled_count: 1890, rating: 4.7, tags: '["osint","reconnaissance","hindi"]' },
      { title: "Malware Analysis & Reverse Engineering", description: "Advanced malware analysis techniques for security researchers", instructor_name: "Dr. Anand Krishnan", instructor_org: "DRDO", level: "expert", category: "malware", duration_hours: 25, total_lessons: 72, is_free: 0, price: 1499, is_certified: 1, enrolled_count: 334, rating: 4.8, tags: '["malware","reverse engineering","expert"]' },
    ];

    for (const c of courseData) {
      await db.insert(coursesTable).values(c);
    }

    // Submissions
    const submissionData = [
      { user_id: arjun.id, title: "SQL Injection in State Bank Portal Login", description: "Critical SQL injection vulnerability found in SBI login endpoint allowing full admin access", type: "vulnerability", severity: "critical", category: "web", status: "verified", points_awarded: 500, steps_to_reproduce: "1. Go to login page\n2. Enter ' OR 1=1-- in username\n3. Any password\n4. Full admin access", target_url: "sbi.co.in/login", impact_description: "Full database access, 450M customer records at risk", fix_suggestion: "Use parameterized queries, input sanitization" },
      { user_id: priya.id, title: "XSS Stored in IRCTC Profile Section", description: "Persistent XSS vulnerability in IRCTC profile section allows executing malicious scripts", type: "vulnerability", severity: "high", category: "web", status: "verified", points_awarded: 300, target_url: "irctc.co.in" },
      { user_id: rohit.id, title: "Open Redirect in Aadhaar Portal", description: "Open redirect vulnerability in Aadhaar authentication portal", type: "vulnerability", severity: "medium", category: "web", status: "verified", points_awarded: 150 },
      { user_id: sneha.id, title: "UPI Phishing Campaign Targeting SBI Users", description: "Large-scale UPI phishing campaign using fake SBI domains", type: "fraud_report", severity: "high", category: "financial", status: "verified", points_awarded: 250 },
      { user_id: arjun.id, title: "RCE Vulnerability in Indian Railways API", description: "Remote code execution found in Indian Railways booking API", type: "vulnerability", severity: "critical", category: "network", status: "under_review", points_awarded: 0 },
      { user_id: amit.id, title: "Weak Password Policy in Delhi Metro App", description: "Delhi Metro app allows passwords as short as 4 characters with no complexity requirements", type: "vulnerability", severity: "low", category: "mobile", status: "verified", points_awarded: 75 },
      { user_id: priya.id, title: "Exposed AWS S3 Bucket — BSNL Customer Data", description: "Publicly accessible S3 bucket containing BSNL customer PII data", type: "vulnerability", severity: "critical", category: "network", status: "verified", points_awarded: 600 },
      { user_id: kavya.id, title: "CSRF Token Missing in Income Tax Portal", description: "No CSRF protection on critical Income Tax filing endpoints", type: "vulnerability", severity: "medium", category: "web", status: "verified", points_awarded: 200 },
      { user_id: vikram.id, title: "Malware Disguised as Aarogya Setu Update", description: "Fake Aarogya Setu update distributing banking trojan", type: "research", severity: "high", category: "malware", status: "verified", points_awarded: 350 },
      { user_id: rohit.id, title: "Social Engineering Kit Targeting Bank Employees", description: "Sophisticated phishing kit specifically targeting Indian bank employees", type: "fraud_report", severity: "high", category: "social_engineering", status: "pending", points_awarded: 0 },
      { user_id: divya.id, title: "Insecure Direct Object Reference — EPFO Portal", description: "IDOR vulnerability in EPFO portal exposing employee financial records", type: "vulnerability", severity: "high", category: "web", status: "pending", points_awarded: 0 },
      { user_id: rahul.id, title: "Fake UPI QR Code Generator Scam", description: "Web service generating fake UPI QR codes to steal money from victims", type: "fraud_report", severity: "medium", category: "financial", status: "verified", points_awarded: 175 },
      { user_id: arjun.id, title: "Buffer Overflow in DRDO Internal Tool", description: "Critical buffer overflow in DRDO's internal vulnerability scanner", type: "vulnerability", severity: "critical", category: "network", status: "escalated", points_awarded: 0, escalated_to: "DRDO Cyber Division" },
      { user_id: ananya.id, title: "Hardcoded API Keys in Zomato Android App", description: "Production AWS and Stripe API keys hardcoded in Zomato Android APK", type: "vulnerability", severity: "high", category: "mobile", status: "verified", points_awarded: 280 },
      { user_id: amit.id, title: "OTP Bypass in Popular Indian E-commerce Site", description: "OTP bypass allowing account takeover without SMS verification", type: "vulnerability", severity: "high", category: "web", status: "rejected", points_awarded: 0, reviewer_notes: "Could not reproduce the issue with provided steps" },
    ];

    for (const s of submissionData) {
      await db.insert(submissionsTable).values(s);
    }

    // Internships
    const internshipData = [
      { org_name: "CERT-In", org_type: "government", title: "Vulnerability Research Intern", description: "Work with India's premier cybersecurity agency on critical national infrastructure security", requirements: "Strong knowledge of web security, OWASP Top 10, networking fundamentals", duration_months: 3, location_type: "remote", location_city: "New Delhi", location_state: "Delhi", stipend_amount: 15000, required_min_rank: 20, total_seats: 5, filled_seats: 2, status: "open", is_govt_certified: 1 },
      { org_name: "I4C — Indian Cyber Crime Coordination Centre", org_type: "government", title: "Cyber Investigation Support Intern", description: "Assist with cybercrime investigation and digital forensics", requirements: "Digital forensics knowledge, Python scripting, network analysis", duration_months: 6, location_type: "onsite", location_city: "New Delhi", location_state: "Delhi", stipend_amount: 12000, required_min_rank: 50, total_seats: 3, filled_seats: 1, status: "open", is_govt_certified: 1 },
      { org_name: "Quick Heal Technologies", org_type: "private", title: "Security Analyst Intern", description: "Analyze malware samples and contribute to threat intelligence", requirements: "Malware analysis basics, reverse engineering fundamentals", duration_months: 3, location_type: "hybrid", location_city: "Pune", location_state: "Maharashtra", stipend_amount: 20000, required_min_rank: 100, total_seats: 10, filled_seats: 4, status: "open", is_govt_certified: 0 },
      { org_name: "Razorpay", org_type: "private", title: "Bug Bounty Program Intern", description: "Work with Razorpay's security team on their bug bounty program", requirements: "Bug bounty experience, web application security, API security testing", duration_months: 4, location_type: "remote", location_city: "Bangalore", location_state: "Karnataka", stipend_amount: 25000, required_min_rank: 30, total_seats: 5, filled_seats: 2, status: "open", is_govt_certified: 0 },
      { org_name: "Wipro Cybersecurity", org_type: "private", title: "Penetration Testing Intern", description: "Conduct penetration tests for enterprise clients across India", requirements: "CEH or OSCP preferred, hands-on pentesting experience", duration_months: 6, location_type: "hybrid", location_city: "Bangalore", location_state: "Karnataka", stipend_amount: 18000, required_min_rank: 75, total_seats: 8, filled_seats: 3, status: "open", is_govt_certified: 0 },
      { org_name: "Palo Alto Networks India", org_type: "private", title: "Threat Intelligence Intern", description: "Research emerging cyber threats targeting Indian enterprises", requirements: "OSINT skills, threat analysis, Python/YARA rules", duration_months: 3, location_type: "remote", stipend_amount: 30000, required_min_rank: 25, total_seats: 4, filled_seats: 1, status: "open", is_govt_certified: 0 },
      { org_name: "CBI Cyber Division", org_type: "government", title: "Digital Forensics Intern", description: "Assist CBI's cyber crime wing with digital evidence analysis", requirements: "Digital forensics certification, legal awareness", duration_months: 2, location_type: "onsite", location_city: "New Delhi", location_state: "Delhi", stipend_amount: 8000, required_min_rank: 30, total_seats: 2, filled_seats: 0, status: "open", is_govt_certified: 1 },
      { org_name: "Lucideus (Safe Security)", org_type: "private", title: "Cybersecurity Research Intern", description: "Contribute to cybersecurity research and platform development", requirements: "Research aptitude, security knowledge, good writing skills", duration_months: 4, location_type: "hybrid", location_city: "Delhi", location_state: "Delhi", stipend_amount: 22000, required_min_rank: 40, total_seats: 6, filled_seats: 2, status: "open", is_govt_certified: 0 },
    ];

    for (const i of internshipData) {
      await db.insert(internshipsTable).values(i);
    }

    // Bug Bounty Programs
    const bountyData = [
      { company_id: company.id, company_name: "TechCorp India", title: "TechCorp India — Web Application", description: "Find security vulnerabilities in TechCorp's web applications and APIs", scope: "*.techcorp.in, api.techcorp.in, admin.techcorp.in", min_reward: 500, max_reward: 200000, status: "active", total_paid: 1250000, total_reports: 47 },
      { company_id: company.id, company_name: "Razorpay", title: "Razorpay Security Program", description: "India's leading payment gateway bug bounty program", scope: "*.razorpay.com, dashboard.razorpay.com, api.razorpay.com", min_reward: 1000, max_reward: 500000, status: "active", total_paid: 8500000, total_reports: 183 },
      { company_id: company.id, company_name: "Paytm", title: "Paytm Bug Bounty", description: "Security research program for Paytm's payment and financial services", scope: "*.paytm.com, *.paytmbank.com, Paytm Android/iOS apps", min_reward: 500, max_reward: 300000, status: "active", total_paid: 5200000, total_reports: 124 },
      { company_id: company.id, company_name: "Flipkart", title: "Flipkart Security Research", description: "Help secure India's largest e-commerce platform", scope: "*.flipkart.com, Flipkart Android/iOS apps, api.flipkart.com", min_reward: 1000, max_reward: 250000, status: "active", total_paid: 3800000, total_reports: 96 },
      { company_id: company.id, company_name: "Juspay", title: "Juspay Payment Security", description: "Payment infrastructure security research program", scope: "*.juspay.in, *.juspay.io, payment APIs", min_reward: 2000, max_reward: 400000, status: "active", total_paid: 2100000, total_reports: 58 },
    ];

    for (const b of bountyData) {
      await db.insert(bugBountyProgramsTable).values(b);
    }

    // CTF Challenges
    const ctfData = [
      { title: "Find the Hidden Flag", description: "A simple web challenge to test your reconnaissance skills. The flag is hidden somewhere on this webpage.", category: "web", difficulty: "easy", points: 100, flag: "CTF{w3b_b4s1cs_101}", hints: '["Check the page source","Look for HTML comments"]', is_active: 1, solve_count: 234 },
      { title: "SQL Injection Basics", description: "A vulnerable login form. Can you bypass authentication using SQL injection?", category: "web", difficulty: "easy", points: 150, flag: "CTF{sql_1nj3ct10n_m4st3r}", hints: '["Try single quote in the input","Think about OR statements"]', is_active: 1, solve_count: 198 },
      { title: "Base64 Decode Challenge", description: "An encoded message is waiting for you. Decode it to find the flag.", category: "crypto", difficulty: "easy", points: 100, flag: "CTF{d3c0d3_th3_s3cr3t}", hints: '["Common encoding format","Available in every terminal"]', is_active: 1, solve_count: 312 },
      { title: "Broken Authentication", description: "The login system is poorly implemented. Find a way to access the admin panel.", category: "web", difficulty: "medium", points: 200, flag: "CTF{4uth_brok3n_f1x_m3}", hints: '["Check session tokens","Look at cookie values"]', is_active: 1, solve_count: 87 },
      { title: "Network Packet Analysis", description: "Analyze this PCAP file to find the secret communication.", category: "network", difficulty: "medium", points: 250, flag: "CTF{pcap_4n4lys1s_pr0}", hints: '["Use Wireshark","Filter by protocol"]', is_active: 1, solve_count: 62 },
      { title: "Reverse Engineering 101", description: "Reverse engineer this binary to extract the hidden flag.", category: "reverse", difficulty: "hard", points: 400, flag: "CTF{r3v3rs3_3ng1n33r}", hints: '["Use GDB or IDA","Look for string comparisons"]', is_active: 1, solve_count: 23 },
      { title: "Forensics: Deleted File Recovery", description: "A file was deleted from this disk image. Recover it to find the flag.", category: "forensics", difficulty: "hard", points: 350, flag: "CTF{f0r3ns1cs_m4st3r}", hints: '["Use file carving tools","Autopsy or Foremost"]', is_active: 1, solve_count: 31 },
      { title: "Advanced Web Exploitation", description: "A complex web application with multiple vulnerabilities. Chain them to get RCE.", category: "web", difficulty: "expert", points: 500, flag: "CTF{4dv4nc3d_xpl01t3r}", hints: '["Look for file upload","Check for template injection"]', is_active: 1, solve_count: 8 },
    ];

    for (const c of ctfData) {
      await db.insert(ctfChallengesTable).values(c);
    }

    // Cyber Alerts
    const alertData = [
      { title: "Large-Scale UPI Phishing Campaign", description: "Attackers are sending fake UPI payment requests via SMS impersonating major banks. Over 50,000 potential victims identified.", severity: "critical", category: "financial", affected_states: '["Maharashtra","Delhi","Karnataka","Gujarat"]', source: "CERT-In", is_active: 1, is_verified: 1 },
      { title: "Ransomware Targeting Indian Hospitals", description: "New ransomware strain 'MedLock' specifically targeting hospital management systems across India.", severity: "critical", category: "malware", affected_states: '["All States"]', source: "DRDO Cyber", is_active: 1, is_verified: 1 },
      { title: "Fake Aadhaar Verification Portal", description: "Fraudulent website mimicking UIDAI's Aadhaar verification portal stealing biometric data.", severity: "high", category: "fraud", affected_states: '["All States"]', source: "UIDAI Security", is_active: 1, is_verified: 1 },
      { title: "Government Portal Data Breach — BSNL", description: "BSNL customer database exposed, over 2.9 million records including personal information and call logs.", severity: "high", category: "breach", affected_states: '["All States"]', source: "BSNL", is_active: 1, is_verified: 1 },
      { title: "Mobile Banking Trojan Spreading via WhatsApp", description: "Sophisticated Android banking trojan spreading through WhatsApp targeting Indian banking apps.", severity: "high", category: "malware", affected_states: '["Maharashtra","Delhi","Uttar Pradesh","Bihar"]', source: "Quick Heal Labs", is_active: 1, is_verified: 1 },
      { title: "Cryptocurrency Scam Targeting Young Investors", description: "Fake cryptocurrency investment platforms promising 50% monthly returns targeting college students.", severity: "medium", category: "fraud", affected_states: '["Karnataka","Maharashtra","Gujarat","Tamil Nadu"]', source: "RBI Cyber Cell", is_active: 1, is_verified: 1 },
      { title: "Education Portal Vulnerabilities — Boards", description: "Multiple state education board portals found vulnerable to SQL injection and authentication bypass.", severity: "medium", category: "web", affected_states: '["UP","Bihar","Rajasthan","MP"]', source: "Student Report", is_active: 1, is_verified: 0 },
      { title: "SIM Swap Fraud Surge", description: "Significant increase in SIM swap attacks targeting bank accounts. Attackers bribing telecom employees.", severity: "high", category: "fraud", affected_states: '["Delhi","Mumbai","Hyderabad"]', source: "DoT Security", is_active: 1, is_verified: 1 },
      { title: "Fake Income Tax Refund SMS Campaign", description: "Mass SMS campaign sending fake income tax refund links to harvest banking credentials.", severity: "medium", category: "phishing", affected_states: '["All States"]', source: "IT Department", is_active: 1, is_verified: 1 },
      { title: "VPN Service Data Logging Warning", description: "Popular free VPN services operating in India found to be selling user browsing data to foreign entities.", severity: "low", category: "privacy", affected_states: '["All States"]', source: "MEITY", is_active: 1, is_verified: 0 },
    ];

    for (const a of alertData) {
      await db.insert(cyberAlertsTable).values(a);
    }

    // Add wallet transactions for arjun
    await db.insert(walletTransactionsTable).values([
      { user_id: arjun.id, type: "credit", amount: 5000, balance_after: 5000, description: "Reward: SQL Injection in SBI Portal", status: "completed" },
      { user_id: arjun.id, type: "credit", amount: 3000, balance_after: 8000, description: "Reward: Buffer Overflow DRDO Investigation", status: "completed" },
      { user_id: arjun.id, type: "credit", amount: 2000, balance_after: 10000, description: "CTF Challenge Winner Bonus", status: "completed" },
      { user_id: arjun.id, type: "withdrawal", amount: -5500, balance_after: 4500, description: "Withdrawal to UPI ID", status: "completed" },
      { user_id: arjun.id, type: "bonus", amount: 500, balance_after: 5000, description: "Monthly Top 3 Bonus", status: "completed" },
    ]);

    logger.info("Database seeded successfully!");
  } catch (error) {
    logger.error({ error }, "Error seeding database");
    throw error;
  }
}
