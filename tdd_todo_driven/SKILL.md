---
name: tdd-todo-driven-development
description: Instructs the AI to implement a project step-by-step by strictly following the TDD.md (Technical Design Document) and TODO.md (task list + execution log) files located in the project root. Use this skill whenever you are asked to build, implement, or continue working on a project that has both TDD.md and TODO.md files.
---

# TDD + TODO Driven Development Skill

## Overview

This skill defines a strict, repeatable workflow for implementing a project based on two source-of-truth files:

- **`TDD.md`** — The Technical Design Document. Contains the full architecture, tech stack, folder structure, feature specifications, socket events, dependencies, color palette, and all implementation details.
- **`TODO.md`** — The task list and execution log. Contains all tasks grouped by phase, each with a status marker, and a chronological execution log table at the bottom.

---

## Core Workflow (Repeat Until All Tasks Are Done)

Follow this exact loop for every task:

```
1. READ TODO.md
   → Find the first task with status [ ] (Pending)
   → Note the task ID (e.g., "1.3"), phase, and description

2. READ the relevant section of TDD.md
   → Look up the spec, file path, interfaces, events, or code snippets
     related to the current task

3. IMPLEMENT the task
   → Create or modify the file(s) described in the task
   → Follow the exact file paths, types, and patterns from TDD.md
   → Use Yarn for all package manager commands (never npm)
   → Use TypeScript for all source files (.ts / .tsx)
   → Always run commands to verify no errors (e.g., yarn tsc --noEmit)

4. UPDATE TODO.md
   → Change the task status from [ ] to [x]
   → If blocked, change to [!] and write a note

5. APPEND to the Execution Log table in TODO.md
   → Add a new row: | # | Timestamp | Phase | Action taken | ✅ Done |

6. REPORT to the user
   → Briefly state what was completed
   → Show the next pending task
   → Ask if they want to continue or pause

7. REPEAT from step 1
```

---

## Status Markers

| Marker | Meaning |
|--------|---------|
| `[ ]` | Pending — not started |
| `[~]` | In Progress — currently being worked on |
| `[x]` | Done — completed successfully |
| `[!]` | Blocked — error or requires user input |

---

## Rules & Constraints

1. **Never skip tasks** — always complete them in order unless a task is explicitly marked `[!]` blocked.
2. **One task at a time** — complete and verify one task before moving to the next.
3. **Always use Yarn** — use `yarn`, `yarn add`, `yarn add -D`, `yarn dlx`, never `npm install` or `npx`.
4. **Always use TypeScript** — all source files must be `.ts` or `.tsx`. No `.js` or `.jsx`.
5. **Follow TDD.md exactly** — file paths, type names, interface shapes, socket event names must match TDD.md.
6. **Update TODO.md immediately** — after every completed task, update the status marker and execution log before moving on.
7. **Verify before marking done** — run `yarn tsc --noEmit` (or equivalent) to check for type errors before marking a task `[x]`.
8. **Use `crypto.randomUUID()`** — never install the `uuid` package. Use Node.js built-in `crypto.randomUUID()`.
9. **Report progress** — after each task, tell the user what was done and what comes next.

---

## Key Project Details (from TDD.md)

- **Package Manager**: Yarn
- **Language**: TypeScript (strict)
- **Backend**: Node.js + Express + `socketio-kit/server` on port **4000**
- **Frontend**: React + Vite + `socketio-kit/client` + shadcn/ui + Tailwind CSS v4 on port **5173**
- **Auth**: JWT + Google OAuth (via Passport.js)
- **Storage**: In-memory only (no database)
- **Font**: Inter (Google Fonts)
- **Color Accent**: Violet `#7c3aed` + Emerald `#10b981`
- **ID Generation**: `crypto.randomUUID()` (Node.js built-in)
- **shadcn/ui install**: `yarn dlx shadcn@latest add <component>`

---

## File Locations

```
<project-root>/
├── TDD.md       ← Technical Design Document (read-only reference)
├── TODO.md      ← Task list + execution log (read + write)
├── server/      ← Backend TypeScript source
└── client/      ← Frontend React + TypeScript source
```

---

## When to Use This Skill

Activate this skill whenever the user says any of the following:
- "Proceed"
- "Start implementing"
- "Continue"
- "Next task"
- "Start building"
- "Execute the plan"
- Or any variation indicating they want you to start or resume implementation

---

## Example Task Execution

**Given this TODO.md entry:**
```
- [ ] **1.3** Create `server/src/types/index.ts` — all shared interfaces (User, Message, Group, Room)
```

**AI should:**
1. Open `TDD.md` → find the types/interfaces section
2. Create `server/src/types/index.ts` with the correct TypeScript interfaces
3. Update `TODO.md`: `- [x] **1.3** Create server/src/types/index.ts`
4. Append to execution log: `| 3 | 2026-08-01 | 1 | Created server/src/types/index.ts with User, Message, Group, Room interfaces | ✅ Done |`
5. Report to user and show next task (1.4)
