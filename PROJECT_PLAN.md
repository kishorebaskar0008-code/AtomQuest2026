# GoalTrack — Project Implementation Plan 🚀

This document outlines the official 10-phase build order and core business rules for the GoalTrack platform.

---

## 📅 The 10-Phase Roadmap

### ✅ Phase 1 — Authentication & Layout
- [x] Login page with role-based redirect.
- [x] Middleware protection for all routes.
- [x] Sidebar and Navbar components.
- [x] Dashboard shells for Employee, Manager, and Admin.

### ✅ Phase 2 — Employee Goal Creation
- [x] GoalForm with all 6 fields and UoM logic.
- [x] WeightageBar with live 100% validation.
- [x] My Goals page (Create/Edit/Submit).
- [x] Employee Dashboard stats.

### ✅ Phase 3 — Manager Approval
- [x] Manager Dashboard with team overview.
- [x] Team Goals review list.
- [x] Individual Goal Review page (Approve/Return/Edit).
- [x] **Verified**: Audit Log implementation for manager edits.

### ✅ Phase 4 — Quarterly Check-ins
- [x] Score Calculator Utility (Fixed date handling for Timeline goals).
- [x] Employee Check-in page (Actual achievement inputs).
- [x] Manager Check-in Review page (Planned vs. Actual table).
- [x] Window Enforcement (Logic to open/close Q1-Q4 windows).

### 🕒 Phase 5 — Admin Core (Next)
- [ ] Cycle Management (Open/Close windows manually).
- [ ] User Management (Create/Assign users).
- [ ] Admin Dashboard (Big picture stats & activity feed).
- [ ] Shared Goals flow (Push KPI to team).

### 🕒 Phase 6 — Reports & Audit
- [ ] Achievement Report (Filtered table).
- [ ] CSV/Excel Export (SheetJS).
- [ ] Audit Trail Page (Post-lock change log).

### 🕒 Phase 7 — Analytics Module (Bonus)
- [ ] Bar, Line, and Pie charts using Recharts.

### 🕒 Phase 8 — Escalation Module (Bonus)
- [ ] Threshold editing and Escalation log.

### 🕒 Phase 9 — Polish & Bug Fix
- [ ] Add loading skeleton states to all pages.
- [ ] Implement **Caching Strategy** (Thrust areas, Cycle dates, Goal lists).
- [ ] Add error states and mobile responsiveness audit.
- [ ] Consistent black & yellow theme audit.

### 🕒 Phase 10 — Demo Prep
- [ ] Final deployment and credentials check.

---

## ⚖️ Core Business Rules (Non-Negotiable)

1.  **Weightage**: Total goal weightage per employee must be **exactly 100%**.
2.  **Constraints**: Min weightage per goal = **10%** | Max goals = **8**.
3.  **Locking**: Goals lock automatically after manager approval.
4.  **Audit**: Every post-lock change must create an `audit_log` entry.
5.  **Windows**: Employees can only update goals/check-ins during **open windows**.
6.  **Scores**: Progress score is calculated by **DB trigger** (Logic in `scoreCalculator.js`).
7.  **Shared Goals**: Recipients cannot edit Title or Target of a shared goal.

---

## 🎨 Design System
- **Accents**: `#FDB813` (Yellow)
- **Primary**: `#000000` (Black)
- **Background**: `#F5F5F5` (Light Grey)
- **Cards**: `#FFFFFF` (White)
