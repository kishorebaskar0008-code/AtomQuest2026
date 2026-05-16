# Project Context

## What This Project Does
A Goal Setting & Tracking Portal for managing employee goals, approvals, and quarterly check-ins.

## Tech Stack
- Frontend: Next.js 14, Tailwind CSS, shadcn/ui
- Backend: Next.js App Router (Server Actions/API Routes)
- Database: Supabase (PostgreSQL)
- Auth: Supabase Auth

## Project Structure
- /app — Next.js App Router
- /components — Reusable UI components
- /lib — Supabase client and utilities
- /hooks — Custom React hooks
- /api — Backend API routes (if needed alongside Server Actions)

## What Is Already Done
- Project initialization with Next.js 14+ (App Router)
- Git configuration and initial commit (clean history fixed)
- README and Context documentation
- Core dependencies installed (Supabase, Recharts, SheetJS, shadcn/ui)
- Theme colors configured (Black & Yellow)
- Basic shadcn/ui components added (Button, Input, Card, Label, Sonner, etc.)
- Supabase credentials configured in .env.local
- Supabase Database Schema applied (9 tables, triggers, enums)
- Authentication system with role-based redirection
- Middleware for session management and route protection
- Demo users seeded (Admin, Managers, Employees)
- Role-specific layouts and dashboard shells created
- **Phase 2: Employee Goal Creation implemented**
- **Weightage validation and live visual bar integrated**
- **Active Cycle seeded in DB**

## What Is In Progress
- Phase 3: Goal Approval Workflow

## What Is Remaining / Next Steps
- Set up Supabase schema and triggers
- Implement Authentication (Phase 1)
- Seed demo data

## Known Bugs or Issues
- None

## Important Decisions Made
- Use Next.js 14 App Router as the foundation.
- Use #FDB813 (Yellow) and #000000 (Black) as the primary theme.
- Follow the 10-phase build order from the project document.

## Last Git Commit
- feat: complete phase 0 - project setup with next.js, tailwind 4, and shadcn

## Environment Variables Needed
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_SITE_URL (default: http://localhost:3000)
- RESEND_API_KEY (for Phase 8)

## Repository
- https://github.com/kishorebaskar0008-code/AtomQuest2026
