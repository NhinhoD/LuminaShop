# KhoUI — Core Agent Instructions

<!-- BEGIN:nextjs-agent-rules -->
## ⚠️ IMPORTANT: This is NOT the Next.js you know
This version has breaking changes — APIs, conventions, and file structure
may all differ from your training data.
Read the relevant guide in `node_modules/next/dist/docs/` before writing any code.
Heed all deprecation notices.
<!-- END:nextjs-agent-rules -->

## 1. Product Identity
KhoUI is a premium UX/UI website template marketplace for free and paid digital frontend templates.
- See `PRODUCT.md` for product truth.
- See `docs/STATUS.md` for current implementation status.

## 2. Returning Workflow
When starting ANY new session, always read these two files first:
1. `AGENTS.md` (this file)
2. `PRODUCT.md`

Then read additional documentation ONLY when relevant:
- `docs/ARCHITECTURE.md` → architecture/layering/DI
- `docs/STATUS.md` → current project status
- `DESIGN.md` → UI/UX/design-system work
- `.agents/skills/*` → only when the task requires the corresponding skill. Do NOT read the entire source code or all skills by default.

## 3. Architecture Overview & Dependency Direction
```text
src/
├── server/   # domain/ -> application/ -> infrastructure/ & presentation/actions/ -> di/
├── client/   # components/, hooks/, stores/
├── shared/   # constants/, validations/, types/
└── app/      # Next.js 16 App Router

Dependency Direction:
Domain
  ↓
Application
  ↓
Presentation / Server Actions

Infrastructure implements contracts/interfaces used by inner layers.

Client Flow:
Client
  ↓
Server Actions
  ↓
Application
  ↓
Domain
```
- **Domain**: Pure business rules. Zero dependencies on other layers or frameworks.
- **Application**: Coordinates use cases. May depend on `domain` and appropriate contracts in `shared`.
- **Infrastructure**: Implements interfaces/contracts and contains external integrations (Supabase, payment gateways, Resend).
- **Presentation / Server Actions**: Server entry points orchestrating application use cases.
- **Client boundary**: Communicates with server strictly through permitted Server Actions. MUST NOT directly import server-only modules, server-only Supabase clients, infrastructure, repositories, or payment gateways. Browser components may use the browser-safe Supabase helper (`@/client/lib/supabase.ts`) for client-side authentication listeners and realtime subscriptions. Server-rendered layout wrappers under `src/client` (e.g., `Navbar.tsx`) may use the server DI container before rendering client children, while client components (e.g., `NavbarClient.tsx`) remain subject to client boundary rules.
- **Shared boundary**: Only contains contracts safe for both server and client.
- **DI boundary**: `src/server/di/container.ts` is the Composition Root wiring concrete implementations into application use cases.

## 4. Git Safety & Change Ownership
- **Never** commit directly to `main`. `Dev` is the normal development branch.
- **Never** push or commit automatically. ONLY do so when explicitly instructed by the user.
- **Never** switch branches automatically if doing so may disrupt user work. Ask first.
- **Change Ownership**: Never overwrite, delete, revert, or discard user-authored changes. Preserve unrelated existing changes and modify only the required scope. Never use destructive Git commands (`git checkout -- .`, `git reset --hard`, `git clean -fd`) to clean up implementation problems.

## 5. Scope Control
- **NO unrequested** `npm install`, features, dependencies, or unilateral database schema / business logic changes.
- If you find improvements outside scope: Do not implement them. Report them as recommendations.

## 6. Security, Data Integrity & Anti-Fake-Success
- **Security**: Never log API keys, tokens, passwords, or Supabase service-role keys. Respect `NEXT_PUBLIC_*` separation. Sanitize Server Action errors (CWE-209). Never expose stack traces or SQL errors to clients.
- **Anti-Fake-Success**: Never fake successful payment verification, webhook processing, email fulfillment, or database operations. If an external provider or DB actually fails, return/report the actual failure state.

## 7. Circuit Breaker
If a compile, test, lint, or build problem cannot be resolved after 5 consecutive focused fix attempts:
1. STOP modifying code.
2. Do NOT automatically rollback or use destructive git commands.
3. Report the exact error, what was attempted, and which files modified.
4. Ask the user whether to continue, revert, or investigate manually.

## 8. Essential Coding Rules
- No explicit `any` types.
- Validate external/form input.
- Handle errors explicitly and preserve domain/application error semantics. Use try/catch only when necessary for recovery, translation, logging, cleanup, or boundary sanitization; avoid redundant try/catch blocks.
- Explicit return types where required.
- No debug logging left in production source.
- No hardcoded UI strings: Always use `useI18n()` and update dictionaries (`src/i18n/dictionaries/`).
- Page metadata: Always export static/dynamic `metadata` for new pages in `src/app/`.

## 9. Validation & Failure Reporting
Quality gate: `npx tsc --noEmit`, `npm test`, `npm run lint`, `npm run build`.
Static sanity checks: no `console.log`, no explicit `any`, no architecture violations, no secrets exposed.
- All tests must pass.
- **Always report the actual result** of validation (PASS, FAIL, PARTIAL, NOT RUN).
- If checks fail: report the failure, attempt reasonable fixes within scope, and stop if it cannot be safely resolved. Never hide failures.

## 10. PR Review Checklist
When requested to create a PR, include this table:

| Check | Status |
|-------|--------|
| TypeScript | PASS/FAIL |
| Tests | PASS/FAIL |
| Lint | PASS/FAIL |
| Build | PASS/FAIL |
| No console.log | PASS/FAIL |
| No explicit any | PASS/FAIL |
| Architecture | PASS/FAIL |
| Scope compliance | PASS/FAIL |
| Security | PASS/FAIL |
| Anti-fake-success| PASS/FAIL |