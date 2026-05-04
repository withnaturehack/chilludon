import { pgTable, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { sql } from "drizzle-orm";

// USERS
export const usersTable = pgTable("users", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  phone: text("phone"),
  password_hash: text("password_hash").notNull(),
  role: text("role").notNull().default("student"),
  college_name: text("college_name"),
  college_city: text("college_city"),
  state: text("state"),
  student_id_url: text("student_id_url"),
  skill_level: text("skill_level").default("beginner"),
  skill_score: integer("skill_score").default(0),
  total_points: integer("total_points").default(0),
  national_rank: integer("national_rank"),
  state_rank: integer("state_rank"),
  total_earned: real("total_earned").default(0),
  wallet_balance: real("wallet_balance").default(0),
  is_verified: integer("is_verified").default(0),
  is_banned: integer("is_banned").default(0),
  fraud_flag_count: integer("fraud_flag_count").default(0),
  avatar_url: text("avatar_url"),
  bio: text("bio"),
  github_url: text("github_url"),
  linkedin_url: text("linkedin_url"),
  station_name: text("station_name"),
  station_id: text("station_id"),
  badge_number: text("badge_number"),
  jurisdiction_state: text("jurisdiction_state"),
  jurisdiction_city: text("jurisdiction_city"),
  company_name: text("company_name"),
  company_website: text("company_website"),
  gst_number: text("gst_number"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  last_login: timestamp("last_login"),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, created_at: true, updated_at: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;

// SUBMISSIONS
export const submissionsTable = pgTable("submissions", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: text("user_id").references(() => usersTable.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  severity: text("severity"),
  category: text("category"),
  proof_files: text("proof_files").default("[]"),
  video_url: text("video_url"),
  screenshots: text("screenshots").default("[]"),
  steps_to_reproduce: text("steps_to_reproduce"),
  impact_description: text("impact_description"),
  fix_suggestion: text("fix_suggestion"),
  target_url: text("target_url"),
  affected_system: text("affected_system"),
  ai_plagiarism_score: real("ai_plagiarism_score").default(0),
  ai_analysis: text("ai_analysis"),
  status: text("status").default("pending"),
  reviewer_id: text("reviewer_id").references(() => usersTable.id),
  reviewer_notes: text("reviewer_notes"),
  reviewed_at: timestamp("reviewed_at"),
  assigned_department: text("assigned_department"),
  escalated_to: text("escalated_to"),
  points_awarded: integer("points_awarded").default(0),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertSubmissionSchema = createInsertSchema(submissionsTable).omit({ id: true, created_at: true, updated_at: true });
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissionsTable.$inferSelect;

// REWARDS
export const rewardsTable = pgTable("rewards", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  submission_id: text("submission_id").references(() => submissionsTable.id),
  user_id: text("user_id").references(() => usersTable.id),
  amount: real("amount").notNull(),
  currency: text("currency").default("INR"),
  source: text("source"),
  source_org: text("source_org"),
  status: text("status").default("pending"),
  frozen_reason: text("frozen_reason"),
  payment_reference: text("payment_reference"),
  approved_by: text("approved_by").references(() => usersTable.id),
  approved_at: timestamp("approved_at"),
  paid_at: timestamp("paid_at"),
  created_at: timestamp("created_at").defaultNow(),
});

export type Reward = typeof rewardsTable.$inferSelect;

// BADGES
export const badgesTable = pgTable("badges", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  category: text("category"),
  points_required: integer("points_required").default(0),
  is_rare: integer("is_rare").default(0),
  color: text("color"),
  emoji: text("emoji"),
});

export type Badge = typeof badgesTable.$inferSelect;

// USER_BADGES
export const userBadgesTable = pgTable("user_badges", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: text("user_id").references(() => usersTable.id),
  badge_id: text("badge_id").references(() => badgesTable.id),
  earned_at: timestamp("earned_at").defaultNow(),
});

export type UserBadge = typeof userBadgesTable.$inferSelect;

// COURSES
export const coursesTable = pgTable("courses", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  thumbnail_url: text("thumbnail_url"),
  instructor_name: text("instructor_name"),
  instructor_org: text("instructor_org"),
  level: text("level"),
  category: text("category"),
  language: text("language").default("English"),
  duration_hours: real("duration_hours"),
  total_lessons: integer("total_lessons").default(0),
  is_free: integer("is_free").default(1),
  price: real("price").default(0),
  is_certified: integer("is_certified").default(0),
  enrolled_count: integer("enrolled_count").default(0),
  rating: real("rating").default(4.5),
  tags: text("tags").default("[]"),
  created_at: timestamp("created_at").defaultNow(),
});

export type Course = typeof coursesTable.$inferSelect;

// COURSE_ENROLLMENTS
export const courseEnrollmentsTable = pgTable("course_enrollments", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: text("user_id").references(() => usersTable.id),
  course_id: text("course_id").references(() => coursesTable.id),
  progress_percent: integer("progress_percent").default(0),
  started_at: timestamp("started_at").defaultNow(),
  completed_at: timestamp("completed_at"),
});

export type CourseEnrollment = typeof courseEnrollmentsTable.$inferSelect;

// INTERNSHIPS
export const internshipsTable = pgTable("internships", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  org_id: text("org_id").references(() => usersTable.id),
  org_type: text("org_type"),
  org_name: text("org_name").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  requirements: text("requirements"),
  duration_months: integer("duration_months"),
  location_type: text("location_type"),
  location_city: text("location_city"),
  location_state: text("location_state"),
  stipend_amount: real("stipend_amount"),
  required_min_rank: integer("required_min_rank"),
  required_skill_score: integer("required_skill_score"),
  total_seats: integer("total_seats").default(1),
  filled_seats: integer("filled_seats").default(0),
  status: text("status").default("open"),
  application_deadline: text("application_deadline"),
  start_date: text("start_date"),
  perks: text("perks").default("[]"),
  is_govt_certified: integer("is_govt_certified").default(0),
  logo_url: text("logo_url"),
  created_at: timestamp("created_at").defaultNow(),
});

export type Internship = typeof internshipsTable.$inferSelect;

// INTERNSHIP_APPLICATIONS
export const internshipApplicationsTable = pgTable("internship_applications", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  internship_id: text("internship_id").references(() => internshipsTable.id),
  user_id: text("user_id").references(() => usersTable.id),
  cover_letter: text("cover_letter"),
  status: text("status").default("applied"),
  offer_letter_url: text("offer_letter_url"),
  applied_at: timestamp("applied_at").defaultNow(),
});

export type InternshipApplication = typeof internshipApplicationsTable.$inferSelect;

// POLICE_CASES
export const policeCasesTable = pgTable("police_cases", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  submission_id: text("submission_id").references(() => submissionsTable.id),
  police_station_id: text("police_station_id").references(() => usersTable.id),
  assigned_officer_id: text("assigned_officer_id").references(() => usersTable.id),
  case_number: text("case_number").unique(),
  status: text("status").default("open"),
  evidence_package_url: text("evidence_package_url"),
  fir_number: text("fir_number"),
  notes: text("notes"),
  resolution_notes: text("resolution_notes"),
  priority: text("priority").default("medium"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  resolved_at: timestamp("resolved_at"),
});

export type PoliceCase = typeof policeCasesTable.$inferSelect;

// CYBER_ALERTS
export const cyberAlertsTable = pgTable("cyber_alerts", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  severity: text("severity"),
  category: text("category"),
  affected_states: text("affected_states").default("[]"),
  source: text("source"),
  is_active: integer("is_active").default(1),
  is_verified: integer("is_verified").default(0),
  reported_by: text("reported_by").references(() => usersTable.id),
  created_at: timestamp("created_at").defaultNow(),
});

export type CyberAlert = typeof cyberAlertsTable.$inferSelect;

// CTF_CHALLENGES
export const ctfChallengesTable = pgTable("ctf_challenges", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  difficulty: text("difficulty"),
  points: integer("points").default(100),
  flag: text("flag"),
  hints: text("hints").default("[]"),
  attachment_url: text("attachment_url"),
  is_active: integer("is_active").default(1),
  solve_count: integer("solve_count").default(0),
  created_at: timestamp("created_at").defaultNow(),
});

export type CtfChallenge = typeof ctfChallengesTable.$inferSelect;

// CTF_SOLUTIONS
export const ctfSolutionsTable = pgTable("ctf_solutions", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  challenge_id: text("challenge_id").references(() => ctfChallengesTable.id),
  user_id: text("user_id").references(() => usersTable.id),
  is_correct: integer("is_correct").default(0),
  time_taken_seconds: integer("time_taken_seconds"),
  solved_at: timestamp("solved_at").defaultNow(),
});

export type CtfSolution = typeof ctfSolutionsTable.$inferSelect;

// WALLET_TRANSACTIONS
export const walletTransactionsTable = pgTable("wallet_transactions", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: text("user_id").references(() => usersTable.id),
  type: text("type").notNull(),
  amount: real("amount").notNull(),
  balance_after: real("balance_after"),
  description: text("description"),
  reference_id: text("reference_id"),
  status: text("status").default("completed"),
  created_at: timestamp("created_at").defaultNow(),
});

export type WalletTransaction = typeof walletTransactionsTable.$inferSelect;

// BUG_BOUNTY_PROGRAMS
export const bugBountyProgramsTable = pgTable("bug_bounty_programs", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  company_id: text("company_id").references(() => usersTable.id),
  company_name: text("company_name").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  scope: text("scope"),
  out_of_scope: text("out_of_scope"),
  min_reward: real("min_reward"),
  max_reward: real("max_reward"),
  status: text("status").default("active"),
  total_paid: real("total_paid").default(0),
  total_reports: integer("total_reports").default(0),
  logo_url: text("logo_url"),
  created_at: timestamp("created_at").defaultNow(),
});

export type BugBountyProgram = typeof bugBountyProgramsTable.$inferSelect;

// NOTIFICATIONS
export const notificationsTable = pgTable("notifications", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: text("user_id").references(() => usersTable.id),
  title: text("title").notNull(),
  message: text("message"),
  type: text("type"),
  is_read: integer("is_read").default(0),
  action_url: text("action_url"),
  created_at: timestamp("created_at").defaultNow(),
});

export type Notification = typeof notificationsTable.$inferSelect;

// CHAT_MESSAGES (RakshBot)
export const chatMessagesTable = pgTable("chat_messages", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: text("user_id").references(() => usersTable.id),
  role: text("role").notNull(),
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export type ChatMessage = typeof chatMessagesTable.$inferSelect;
