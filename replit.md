# CyberShield India — Workspace

## Overview

pnpm workspace monorepo using TypeScript. Full-stack national cybersecurity platform for India, owned by Kartik Chilkoti.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Mobile**: Expo (React Native) with expo-router v6
- **AI**: NVIDIA NIM API (meta/llama-3.1-8b-instruct) via NVIDIA_API_KEY secret

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Mobile App: CyberShield India

### User Roles & Routing
- **Student** → `/(student)/` tabs: Home, Submit, CTF, RakshBot, More
- **Police** → `/(police)/` tabs: Dashboard, Review, Cases, Intel (+ hidden: analytics)
- **Company** → `/(company)/` tabs: Dashboard, Bounty, Internships, Researchers (+ hidden: reports)
- **Citizen** → `/(citizen)/` tabs: Safety (Dashboard), Alerts, Report, News
- **Admin** → treated as student role

### Test Accounts
- Student: `arjun@student.in` / `Student@123`
- Police: `police@cybershield.in` / `Police@123`
- Company: `company@cybershield.in` / `Company@123`
- Citizen: `citizen@cybershield.in` / `Citizen@123` (auto-created by seed on startup)

### Login / Auth Navigation
- `AuthContext.login()` and `AuthContext.register()` both return `User` object
- `login.tsx` and `register.tsx` call `navigateByRole(user.role)` after success — handles all 5 roles including citizen
- Navigation happens directly in the auth screens, not relying on `useEffect` in `index.tsx`
- **Logout fix**: All dashboards (student more.tsx, police/index.tsx, company/index.tsx, citizen/index.tsx) now call `logout()` then `router.replace("/auth/login")` — navigation always works

### Citizen Role Features
- **Safety Dashboard**: Greeting, threat level indicator, quick actions, live alerts preview, daily safety tips, 1930 helpline card
- **Alerts**: Full cyber alert list with severity filter (critical/high/medium/low), CERT-In verified badges
- **Report Cyber Crime**: 3-step guided form — crime type selection (8 types), description + details, GPS location detection using expo-location
- **News**: Cyber safety news feed with category filter (Scam Alert, Arrest, Safety Tips, Govt Update)
- **API routes**: GET /citizen/alerts, POST /citizen/report, GET /citizen/news, GET /citizen/stats

### RakshBot
- Powered by NVIDIA AI (meta/llama-3.1-8b-instruct via NVIDIA_API_KEY)
- Header now correctly shows "Powered by NVIDIA AI" (was "Claude AI" — fixed)

### App Startup Flow
1. `app/index.tsx` — shows splash, checks auth + AsyncStorage `welcome_seen` flag
2. If first launch (no `welcome_seen`) → `/welcome` (multi-page animated onboarding)
3. If returning user, not logged in → `/auth/login`
4. If logged in → appropriate role dashboard

### Onboarding (`app/welcome.tsx`)
- 4 animated slides: Protecting India, Bug Bounty, RakshBot AI, Join the Mission
- Swipeable horizontal scroll with snap, page dot indicator
- "Skip" button + "Next" / "Get Started" button
- Sets `welcome_seen` in AsyncStorage on completion
- Smooth spring animations on each slide

### Student Stack Screens (all rebuilt with animated dark UI)
- `index.tsx` — Animated dashboard, live stats, quick actions, daily mission
- `submit.tsx` — 3-step form wizard for bug/vulnerability reports
- `rakshbot.tsx` — AI chat UI powered by NVIDIA LLM (meta/llama-3.1-8b-instruct)
- `ctf.tsx` — CTF challenge list with difficulty filter + flag submission modal
- `leaderboard.tsx` — Podium top-3 + full ranked list
- `wallet.tsx` — Balance card + transaction history + UPI withdrawal
- `achievements.tsx` — Badge grid with earned/locked states + progress bar
- `learn.tsx` — Course list with level filter + enrollment
- `internships.tsx` — Internship listings with apply flow
- `submissions.tsx` — My reports with status filter
- `alerts.tsx` — Live threat intel feed from CERT-In
- `profile.tsx` — User profile with skill level progress
- `more.tsx` — Grouped navigation menu

### Police Screens
- `index.tsx` — Stats dashboard with 6 stat cards + quick actions
- `review.tsx` — Submission queue with review modal (verify/reject/escalate/fraud)
- `cases.tsx` — Escalated cases list
- `intelligence.tsx` — CERT-In alerts, suspicious IPs, malware tracker, state-wise incidents (4 tabs)
- `analytics.tsx` — Crime analytics: KPIs, monthly bar chart, crime category breakdown, performance metrics

### Company Screens
- `index.tsx` — Company dashboard with stats + quick links + platform stats
- `bounty.tsx` — Bug bounty programs with reward ranges
- `internships.tsx` — Internship management with post form
- `researchers.tsx` — Hall of Fame: top 3 podium + full leaderboard with bounty earned
- `reports.tsx` — Vulnerability reports received: severity filter, triage view

### Design System
- **Always dark mode forced** — `useColors()` always returns dark palette
- Background: `#0B1120` (navy), Card: `#0F1A2E`, Primary: `#3B82F6`, Accent: `#06B6D4`
- Police accent: `#FCD34D` (gold), Company accent: `#06B6D4` (cyan)
- All screens use `LinearGradient` headers, `Animated.Value` fade+slide on mount
- `expo-linear-gradient`, `expo-haptics`, `@expo/vector-icons` (Feather + MaterialCommunityIcons)

### Workflows
- **API Server**: `PORT=8080 pnpm --filter @workspace/api-server run dev` (port 8080)
- **CyberShield App**: `PORT=21985 pnpm --filter @workspace/cybershield run dev` (port 21985)

### API Base
- `https://${process.env.EXPO_PUBLIC_DOMAIN}/api` — via `useApi.ts`

### All Working Backend Routes
- `/dashboard/stats`, `/submissions`, `/leaderboard`, `/wallet`, `/wallet/withdraw`
- `/police/stats`, `/police/submissions`, `/police/submissions/:id/review`, `/police/cases`
- `/police/intelligence`, `/police/analytics`
- `/companies/stats`, `/companies/bounty-programs`, `/companies/post-internship`
- `/companies/reports`, `/companies/researchers`
- `/rakshbot/chat`, `/rakshbot/analyze`, `/rakshbot/history`
- `/alerts`, `/ctf`, `/ctf/:id/submit`
- `/courses`, `/courses/:id/enroll`, `/courses/my-courses`
- `/internships`, `/internships/:id/apply`, `/internships/my-applications`
- `/badges`, `/badges/my-badges`, `/profile`, `/notifications`

### AI Integration
- **RakshBot**: Powered by NVIDIA NIM API (meta/llama-3.1-8b-instruct)
- Base URL: `https://integrate.api.nvidia.com/v1`
- API Key: `NVIDIA_API_KEY` environment secret
- `/rakshbot/chat` — conversational AI mentor, Hinglish support, Indian context
- `/rakshbot/analyze` — structured JSON vulnerability analysis with CVSS estimate

### Secrets
- `NVIDIA_API_KEY` — NVIDIA NIM API key for RakshBot AI
- `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` — Anthropic integration (provisioned, fallback)
- `AI_INTEGRATIONS_ANTHROPIC_API_KEY` — Anthropic integration key
- `DATABASE_URL` — PostgreSQL connection string
