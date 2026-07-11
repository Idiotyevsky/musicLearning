# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

弦上乐理 (String Theory) — an interactive guitar music theory learning website for Chinese-speaking beginners. Built as a single-page React app deployed on Cloudflare Workers with static assets and a D1 database.

## Commands

```bash
npm install              # Node.js 20+
npm run dev              # Vite dev server at http://localhost:5173
npm run build            # TypeScript check + Vite production build → dist/
npm run preview          # Preview production build locally
npm test                 # Run Vitest unit tests (theory engine)
npm run test:watch       # Vitest in watch mode
npm run test:e2e         # Playwright e2e tests (requires build + preview first)
npm run validate:content # Validate lesson/exercise/source data integrity
npm run deploy           # Build + wrangler deploy to Cloudflare
```

`vite.config.ts` doubles as Vitest config — tests live in `tests/`, test environment is `node`.

## Architecture

### Core layers

| Layer | Path | Role |
|-------|------|------|
| Theory engine | `src/theory/index.ts` | Deterministic music theory: note spelling, scale/chord generation, interval calculation, fretboard mapping, diatonic analysis, transposition. Pure TypeScript, no network or randomness. |
| Content catalog | `src/data/catalog.ts` | Structured definitions: 5 modules, 15 lessons, 60+ exercises, 5 song cases. Lessons have sections (explanation/example/fretboard/exercise), quizzes with answers, prerequisites. |
| Knowledge base | `src/data/knowledge.ts` | Auditable source registry (16 sources), knowledge nodes with claims mapped to lessons. Each published lesson must link to at least one `reviewed` knowledge node. |
| Learning state | `src/state/LearningContext.tsx` | React Context storing completed lessons, quiz attempts, bookmarks, last-lesson position. Persisted to `localStorage` under key `string-theory-learning`. Mastery is weighted by recent attempts (last 20). |
| Fretboard component | `src/components/Fretboard.tsx` | Interactive SVG/CSS fretboard with note/degree/interval label modes, click-to-play Web Audio synthesis. |
| Worker API | `src/worker/index.ts` | Hono server on Cloudflare Workers. Endpoints: `/api/health`, `/api/modules`, `/api/lessons/:slug`, `/api/progress` (POST), `/api/projects` (GET/POST). D1-backed. SPA fallback for non-API routes via `ASSETS` binding. |
| UI | `src/App.tsx` | All routes and page components in a single file. Uses react-router-dom v7 with `<Routes>`. Pages: home, courses (module/lesson navigation), practice (quiz with mistake review), lab (fretboard/scale/chord/interval/progression/circle explorers), songs (5 original cases with analysis and transposition), transcription workbench (local audio import, waveform, chord timeline), tools (metronome, capo calculator, chord transposer), learning dashboard, admin content preview. |
| Styles | `src/styles.css` | All CSS in one file using CSS custom properties (warm white, dark green, wood brown palette). Responsive with mobile bottom nav. |

### Data flow

```
knowledgeSources → knowledgeNodes (claims) → lessons (sections + quiz)
                                                    ↓
                                            catalog.ts defines what to teach
                                                    ↓
                                            theory/index.ts verifies music facts
                                                    ↓
                                            validate-content.mjs checks integrity
```

### Content validation (`scripts/validate-content.mjs`)

Transpiles TypeScript source files at runtime (using the `typescript` package), then checks: duplicate IDs/slugs, module references, prerequisite chains, section counts, quiz answer bounds, source URL validity, knowledge node coverage for published lessons, and basic music theory facts (C/F/G major scales, common chord spellings).

### Database schema (`migrations/0001_initial.sql`)

D1 tables: `course_modules`, `lessons`, `lesson_prerequisites`, `exercises`, `exercise_attempts`, `learning_progress`, `bookmarks`, `song_cases`, `transcription_projects`, `chord_events`, `content_versions`. MVP runs in guest mode without D1 — the API layer is a forward-compatibility shim for future login/sync.

### Key design decisions

- **No route-based code splitting** — all pages are in `App.tsx`. Add new routes by adding a `<Route>` in the `<Routes>` block and a corresponding page function in the same file.
- **Theory engine is pure and deterministic** — no AI, no network calls. Note spelling respects diatonic letter sequences (each scale degree gets a unique letter), with enharmonic preference based on the tonic's flat/sharp context.
- **LocalStorage is the only persistence in MVP** — learning progress, bookmarks, transcription projects. Audio files are decoded locally via Web Audio API and never uploaded.
- **Content is TypeScript, not Markdown** — lessons are typed objects in `catalog.ts` with structured fields. This enables compile-time checking and runtime validation.
- **The `modules` array defines the learning path order** — lessons link to modules via `moduleId`. Prerequisites between lessons are explicit (`prerequisite` field).
- **No authentication system exists yet** — the admin page at `/admin` is a read-only local preview.

## Workflow Orchestration

### 1. Plan Node Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately - don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One tack per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes - don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests - then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimat Impact**: Changes should only touch what's necessary. Avoid introducing bugs.