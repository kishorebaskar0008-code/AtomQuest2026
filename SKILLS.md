# Skills & Context Handoff Instructions

## Purpose
This file helps maintain continuity when switching between AI accounts during development.
Every AI session must read this file first and keep it updated throughout the session.

---

## On Every Session Start — AI Must Do This First
1. Read this entire `SKILLS.md` file
2. Read `CONTEXT.md` if it exists in the project root
3. Understand the current project state before writing any code
4. Ask the user "Should I continue from where we left off?" if anything is unclear

---

## On Every Session End (or when asked to "hand off") — AI Must Do This
Generate and update two things:

### 1. Update `CONTEXT.md` in the project root with this exact structure:

```markdown
# Project Context

## What This Project Does
(1-2 line description of the app)

## Tech Stack
- Frontend: (e.g. React, HTML/CSS/JS, Tailwind)
- Backend: (e.g. Node.js/Express, Python/Flask, Supabase)
- Database: (e.g. PostgreSQL, MongoDB, SQLite)
- Auth: (e.g. JWT, Firebase Auth, None)

## Project Structure
(List key files and what they do)
- /frontend/... — 
- /backend/... — 
- /database/... — 

## What Is Already Done
(Bullet list of completed features)
- 

## What Is In Progress
(What was being worked on when this session ended)
- 

## What Is Remaining / Next Steps
(Bullet list of pending features)
- 

## Known Bugs or Issues
(Any bugs that are known but not yet fixed)
- 

## Important Decisions Made
(Any architecture or design decisions that must not be changed)
- 

## Last Git Commit
(Paste the last commit message and time here)
- 

## Environment Variables Needed
(List all .env variables the project needs, no values — just keys)
- 
```

### 2. Print a Plain English Handoff Summary like this:

```
=== HANDOFF SUMMARY ===
Project: (name)
What it does: (1 line)
Stack: (frontend + backend + db)

Done so far:
- (feature 1)
- (feature 2)

Currently working on:
- (what was in progress)

Next task to pick up:
- (exact next thing to do)

Bugs to be aware of:
- (any known issues)

Last commit: (message)
=======================
```
Tell the user: "Copy this summary and paste it into your next AI session to continue."

---

## Auto-Update Rule (Most Important Rule)
**After EVERY git commit, without being asked, the AI must:**
1. Update `CONTEXT.md` with the latest project state
2. Commit the updated `CONTEXT.md` along with the code:
   ```bash
   git add CONTEXT.md
   git commit -m "chore: update context after (feature name)"
   git push
   ```

This means if tokens run out mid-session, the last commit always has a fresh `CONTEXT.md`.
The new AI account just needs to read that file — no handoff needed from you.

---

## Git Rules (Always Follow)
- Commit before every big change or rewrite
- Only commit working code
- Commit message format: `feat:`, `fix:`, `chore:`
- Push to GitHub after every commit
- Commit at least once every hour

---

## Full Stack Specific Rules

### Frontend
- Keep all frontend files inside `/frontend` folder
- Never hardcode backend API URLs — use a config or `.env` variable like `VITE_API_URL`
- Always handle loading and error states in UI

### Backend
- Keep all backend files inside `/backend` folder
- All API routes must return proper JSON responses with status codes
- Never hardcode secrets — always use `.env` file
- Keep a `routes.md` or comment block listing all API endpoints

### Database
- Keep schema or migration files in `/database` folder
- Never delete data without a confirmation step in the UI

### .env Files
- Never commit `.env` to GitHub — make sure `.gitignore` includes it
- Always maintain a `.env.example` file with all the keys (no values) so the next session knows what's needed

---

## First Message Template for New AI Account
When switching accounts, start the new session with just this:

```
I am continuing a hackathon project. 
Please read SKILLS.md and CONTEXT.md from the project root first, 
then tell me where we left off and continue.
```

No copy-pasting needed. CONTEXT.md always has the latest state because 
it was updated and committed after every single commit in the last session.
