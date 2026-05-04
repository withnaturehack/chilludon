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

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Mobile App: CyberShield India

### User Roles & Routing
- **Student** → `/(student)/` tabs: Home, Submit, CTF, RakshBot, More
- **Police** → `/(police)/` tabs: Dashboard, Review, Cases, Alerts
- **Company** → `/(company)/` tabs: Dashboard, Bounty, Internships
- **Admin** → `/(admin)/` (Admin panel)

### Test Accounts
- Student: `arjun@student.in` / `Student@123`
- Police: `police@cybershield.in` / `Police@123`
- Company: `company@cybershield.in` / `Company@123`

### Student Stack Screens (all rebuilt with animated dark UI)
- `index.tsx` — Animated dashboard, live stats, quick actions, daily mission
- `submit.tsx` — 3-step form wizard for bug/vulnerability reports
- `rakshbot.tsx` — AI chat UI powered by Anthropic Claude
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

### Police Screens (all rebuilt)
- `index.tsx` — Stats dashboard with 6 stat cards
- `review.tsx` — Submission queue with review modal (verify/reject/escalate/fraud)
- `cases.tsx` — Escalated cases list
- `alerts.tsx` — National threat alerts with live pulse indicator

### Company Screens (all rebuilt)
- `index.tsx` — Company dashboard with stats + quick links
- `bounty.tsx` — Bug bounty programs with reward ranges
- `internships.tsx` — Internship management with post form

### Design System
- **Always dark mode forced** — `useColors()` always returns dark palette
- Background: `#0B1120` (navy), Card: `#0F1A2E`, Primary: `#3B82F6`, Accent: `#06B6D4`
- All screens use `LinearGradient` headers, `Animated.Value` fade+slide on mount
- `expo-linear-gradient`, `expo-haptics`, `@expo/vector-icons` (Feather + MaterialCommunityIcons)

### API Base
- `https://${process.env.EXPO_PUBLIC_DOMAIN}/api` — via `useApi.ts`

### All Working Backend Routes
- `/dashboard/stats`, `/submissions`, `/leaderboard`, `/wallet`, `/wallet/withdraw`
- `/police/stats`, `/police/submissions`, `/police/submissions/:id/review`, `/police/cases`
- `/companies/stats`, `/companies/bounty-programs`, `/companies/post-internship`
- `/rakshbot/chat`, `/alerts`, `/ctf`, `/ctf/:id/submit`
- `/courses`, `/courses/:id/enroll`, `/courses/my-courses`
- `/internships`, `/internships/:id/apply`, `/internships/my-applications`
- `/badges`, `/badges/my-badges`, `/profile`, `/notifications`
