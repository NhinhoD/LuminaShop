# KhoUI — Agent Instructions

<!-- BEGIN:nextjs-agent-rules -->
## ⚠️ IMPORTANT: This is NOT the Next.js you know
This version has breaking changes — APIs, conventions, and file structure
may all differ from your training data.
Read the relevant guide in `node_modules/next/dist/docs/` before writing any code.
Heed all deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## ─── RETURNING WORKFLOW ───

When starting ANY new session, always do this first — no exceptions:

1. Read @AGENTS.md (this file) — current status and all rules
2. Read @README.md — project overview
3. Read @src/server/domain — understand all entities and interfaces
4. Read @src/server/application — understand all use cases
5. Read @src/server/infrastructure/supabase — understand DB layer
6. Read @src/client & @src/server/presentation/actions — understand UI and server actions layer
7. Read @public/stitch_e_commerce_ux_ui_design — UI design references
8. Read @.agents/skills/supabase/ — Supabase & Postgres best practices
9. Read @.agents/skills/stitch/ — Stitch UX/UI design patterns & stitch-skill
10. Read @.agents/skills/gsap/ — GSAP core, timeline, and performance core competencies
11. Read @.agents/skills/design/ — Design taste, brandkit, layout morphing & prompt enhancements
12. Read @.agents/skills/taste/ — Anti-slop frontend taste, motion dials (8/6/4), minimalism, brutalism, soft UI
13. Read @.agents/skills/impeccable/ — Impeccable design harness, critique, distill, polish, harden
14. Read @.agents/skills/imagegen/ — AI UI & mockup image generation (web & mobile)
15. Read @.agents/skills/react-components — React & Tailwind 4 execution rules

After reading, report to user:
- ✅ What is DONE
- 🔄 What is IN PROGRESS
- ⏳ What is the NEXT TASK
- ⚠️ Any issues or bugs found in code

**Wait for user confirmation before writing any code.**

---

## ─── PROJECT CONTEXT ───

**Project:** KhoUI — Modern E-Commerce Platform
**Purpose:** Learning project — exploring modern web technologies
**Repository:** https://github.com/NhinhoD/LuminaShop

#### Tech Stack:
- **Frontend:** Next.js 16 App Router, React 19, TypeScript (strict)
- **Styling:** Tailwind CSS 4, Framer Motion
- **State:** Zustand (cart), Zod (validation)
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Icons:** Lucide React
- **MCP Tools:** MCP Supabase, MCP Stitch, MCP GitHub

### Database Tables:
- `profiles` — user profiles & roles
- `categories` — product & template categories
- `products` — digital products & templates (license tiers, preview URLs)
- `orders` — customer orders
- `order_items` — order line items & digital licenses
- `payments` — payment records (PayOS transactions)
- `site_translations` — dynamic i18n key-value dictionary storage

---

## ─── ARCHITECTURE RULES ───

**Clean Architecture + Next.js 16 Physical Boundaries (Option A)**:
The codebase is cleanly separated into 3 main modules: `src/server`, `src/client`, and `src/shared`.

```
src/
├── server/                      # Server-only execution
│   ├── domain/                  # [Layer 1] Pure Entities & Repository Interfaces
│   ├── application/             # [Layer 2] Pure Business Use Cases
│   ├── infrastructure/          # [Layer 3] Supabase, Payment Gateways, Resend Email
│   ├── presentation/actions/    # [Layer 4] Server Actions ("use server")
│   └── di/                      # Composition Root (container.ts)
├── client/                      # Frontend UI & Client State
│   ├── components/              # UI Components (Storefront, Admin, Common)
│   ├── hooks/                   # Custom React Hooks
│   ├── stores/                  # Zustand Stores (Cart, Toast, Drawer)
│   └── providers/               # Client Context Providers
├── shared/                      # Shared Contracts between Server & Client
│   ├── constants/               # ROUTES, ROLES, pagination defaults
│   ├── validations/             # Zod validation schemas
│   ├── utils/                   # Formatters & helper functions (cn, formatCurrency)
│   └── types/                   # Shared DTOs & Types
└── app/                         # Next.js 16 App Router shell
```

### Layer responsibilities:

**`src/server/domain/`** — Core business logic
- Entities, interfaces, enums, Result.ts ONLY
- NO imports from any other layer
- NO external libraries (no supabase, no next, no react)
- Example: `Order`, `IOrderRepository`, `OrderStatus`

**`src/server/application/`** — Use cases
- Business logic and orchestration ONLY
- Only imports from `domain/` and `shared/`
- NO direct DB calls, NO supabase client
- Example: `CreateOrderUseCase`, `ProcessPaymentUseCase`

**`src/server/infrastructure/`** — Data & external services layer
- Implements interfaces from `domain/`
- ONLY layer allowed to import supabase client, payment SDKs, Resend
- Always map `snake_case` DB columns → `camelCase` domain entities
- Example: `SupabaseOrderRepository`, `CODPaymentGateway`, `ResendEmailService`

**`src/server/di/container.ts`** — Composition Root (Dependency Injection)
- The ONLY module that couples layers together by wiring concrete infrastructure into application use cases.
- Exposes factories like `makeGetProductsUseCase()`, `makeCreateOrderUseCase()`.
- Server actions import factories from `@/server/di/container`.

**`src/server/presentation/actions/`** — Server Actions ("use server")
- Server-side controllers orchestrating use cases and responses
- Sanitizes errors with CWE-209 defense before returning to UI
- Example: `createOrderAction`, `processPaymentAction`, `getPaginatedTranslationsAction`

**`src/client/`** — UI Presentation & Client State
- Components, hooks, Zustand stores (`useCartStore`, `useToastStore`), client providers
- Calls application use cases strictly via server actions
- NEVER calls supabase or repositories directly

**`src/shared/`** — Shared Contracts
- Zod schemas, constants, formatters, and types usable by both server and client without leakage.

### Naming conventions:
| Type | Convention | Example |
|------|-----------|---------|
| Entities | PascalCase | `Order`, `CartItem` |
| Interfaces | I + PascalCase | `IOrderRepository` |
| Use cases | PascalCase + UseCase | `CreateOrderUseCase` |
| Repositories | Supabase + PascalCase + Repository | `SupabaseOrderRepository` |
| Gateways | PascalCase + Gateway | `CODPaymentGateway` |
| Server actions | camelCase + Action | `createOrderAction` |
| Zustand stores | use + PascalCase + Store | `useCartStore` |
| Components | PascalCase | `CheckoutForm` |

---

## ─── CODING RULES ───

### Before writing ANY code:
1. Always work on the `Dev` branch.
2. If on `main` → `git checkout Dev` first.
3. Ensure you have the latest code: `git pull origin Dev`.
4. Only then start coding.

**Never commit directly to `main`. Always work and commit on `Dev`.**

### Code quality rules:
- **NEVER use `any` TypeScript type** — use proper interfaces or `unknown` with type guards
- **NEVER leave `console.log`** in `src/` — remove before committing
- **NEVER hardcode test data** — no test names, phone numbers, or IDs in `src/`
- **NEVER hardcode UI text strings** — all storefront and admin texts must use `useI18n()` and exist in both central dictionaries: `src/i18n/dictionaries/vi.ts` and `src/i18n/dictionaries/en.ts`
- **ALWAYS export metadata for new pages** — every page in `src/app/` must export static `metadata` or dynamic `generateMetadata` with title, description, and canonical/openGraph tags
- **ALWAYS handle errors** — use try/catch in use cases and server actions
- **ALWAYS validate input** — use Zod schemas for all form and external data
- **ALWAYS type function return values** explicitly
- Use domain enums everywhere (e.g. `OrderStatus.PENDING` not `'pending'`)

### When building a new feature, always follow this order:
1. Domain entity + interface
2. Application use case
3. Infrastructure repository
4. Supabase migration via MCP Supabase
5. Server action
6. UI component (reference Stitch design)

### 🌪️ GSAP & Framer Motion Animation Rules
- **Performance First**: Always read `@.agents/skills/gsap/gsap-performance` before writing scroll-driven animations. Use `will-change` CSS properties judicially and kill/cleanup active timelines in React `useEffect` unmount hooks to prevent memory leaks.
- **Micro-interactions**: Utilize GSAP QuickTo for mouse-follow effects and Framer Motion layoutId for seamless fluid layout morphing between listing and detail frames.

---

## ─── 🚫 ANTI-SCOPE CREEP & PRODUCT BOUNDARIES ───

Agent must strictly operate within the defined task scope and never self-expand the product:
- **No Unrequested Packages**: NEVER run `npm install` or add dependencies without explicit user confirmation.
- **No Unrequested Features**: Do not add extra pages, modals, payment gateways, or integrations simply because they "seem useful".
- **No Unilateral Schema Changes**: Do not alter Supabase tables, migrations, or database columns without prior approval.
- **No Unilateral Business Logic Changes**: Do not alter pricing formulas, order status flows, or licensing structures without explicit instruction.
- **Rule for Suggestions**: If you identify a missing capability, bug risk, or potential improvement:
  * Mark it in code if necessary: `// TODO: Requires user confirmation before implementation`
  * Propose it clearly in your response to the user.
  * **DO NOT** implement it unilaterally.

---

## ─── 🛡️ SECURITY & DATA INTEGRITY GUARDRAILS ───

### 1. Secret & Credential Protection:
- **NEVER log raw secrets or tokens**: PayOS API/Checksum keys, Resend API keys, Supabase Service Role keys, session cookies, JWTs, or passwords must never appear in `console.log`, server logs, or error responses.
- **NEVER log or expose raw customer PII**: Passwords, OTP codes, and raw payment credentials must be redacted or sanitized.
- **Strict Environment Variable Separation**: Distinguish strictly between `NEXT_PUBLIC_*` (exposed to the browser) and server-only variables (`SITE_URL`, `PAYOS_*`, `RESEND_*`, `SUPABASE_SERVICE_ROLE_KEY`). NEVER prefix secrets or server-side configurations with `NEXT_PUBLIC_`.
- **CWE-209 Defense in Server Actions**: All Server Actions (`src/server/presentation/actions/`) must sanitize internal error messages before returning to the UI. Never expose raw SQL errors, Supabase internal error codes, or stack traces to the client.

### 2. Mock vs Production Data Integrity (Anti-Fake Success):
- **Strictly No Fake Success**: NEVER return a fake success response in `ProcessPaymentUseCase`, `HandlePayOSWebhook`, `ResendEmailService`, or order fulfillment if the real external provider or database transaction failed.
- **No Production Backdoors**: Simulation backdoors, test bypasses, or mock data paths must NEVER be merged into production or bypass payment verification.
- **Mock Data Isolation**: Any mock data used for unit testing or UI prototyping must remain strictly isolated in test files or demo frames and clearly tagged `[MOCK_DATA]`.

---

## ─── 🤖 AI & LLM PIPELINE RULES ───

For the Autonomous AI Template Pipeline or any LLM-driven features in KhoUI:
- **Clean Architecture Compliance**: LLM SDK calls must NEVER be made directly inside UI components or application use cases. All AI interactions must implement a pure domain interface (e.g., `IAIService`, `ITemplateGenerator`) located in `src/server/domain/` with concrete implementations wired in `src/server/infrastructure/ai/`.
- **No Hardcoded Models**: Never hardcode model IDs (e.g. `'gemini-2.5-pro'`, `'gpt-4o'`) in business logic. Always use environment variables or centralized configuration aliases.
- **Prompt Sanitization**: Ensure no raw credentials, private customer data, or internal system secrets are injected into LLM prompts.
- **Resilience & Timeouts**: Every AI call must have a timeout, error handling, retry limits, and safe fallback handling without crashing the main application.

---

## ─── ❓ DISAMBIGUATION PROTOCOL (WHEN UNSURE) ───

If a requirement is ambiguous, has conflicting interpretations, or involves major architectural/business trade-offs, **STOP and ask the user** instead of guessing.

Always structure the question using this standardized 3-part format:
```text
Cần xác nhận: [Vấn đề kỹ thuật / nghiệp vụ cần quyết định]
Các lựa chọn:
  - Lựa chọn A: [Mô tả + Ưu điểm / Nhược điểm]
  - Lựa chọn B: [Mô tả + Ưu điểm / Nhược điểm]
Khuyến nghị: [Phương án đề xuất và lý do cụ thể]
```

---

## ─── MCP TOOLS ───

### MCP GitHub (connected):
- Use to create Pull Requests — **NEVER use `git merge` locally for Dev→main**
- When creating PR always include:
  - **Title:** reflects actual changes (e.g. `feat: Task 4 - Order Management`)
  - **Body:** full checklist table + summary of all changes
  - **Base:** `main` | **Compare:** `Dev`
- After creating PR → send the PR URL to user and wait for approval
- Use for: creating PRs, reading PR status, creating Issues for bugs

### MCP Supabase (connected):
- Use for ALL database migrations and schema changes
- Always verify RLS policies after any table changes
- Never modify production data directly without user approval
- Use for: creating tables, adding columns, writing RLS policies, creating indexes

### MCP Stitch (connected):
- Always reference existing designs before building any UI
- Design files location: `@public/stitch_e_commerce_ux_ui_design`
- Implement pixel-perfect using Tailwind CSS 4 + Framer Motion
- Available designs:
  - `homepage/screen.png`
  - `product_listing/screen.png`
  - `product_detail/screen.png`
  - `shopping_cart/screen.png`
  - `checkout/screen.png`
  - `login/screen.png`
  - `registration/screen.png`
  - `user_profile/screen.png`
  - `admin_dashboard/screen.png`
  - `product_management/screen.png`
  - `order_management/screen.png`

---

## ─── GIT WORKFLOW RULES ───

### Branch strategy:
- main: production-ready only, merge via GitHub PR
- Dev: active development, write all code here

### ⛔ STRICT COMMIT & PUSH POLICY (CRITICAL):
- **NEVER run `git commit` or `git push` automatically.**
- Agent must **ONLY commit or push when the USER explicitly requests or confirms it** (e.g., "please commit", "commit code now", "push to remote", etc.).
- Even during automated loops, `/goal` sessions, or PR review checklists, do NOT create commits unless the user explicitly gave the command.

### Daily workflow:

Step 1 — Always work on Dev branch:
git checkout Dev
git pull origin Dev

Step 2 — Write and edit code directly on Dev branch

Step 3 — Run validation (lint & build) to verify quality:
npm run lint
npm run build

Step 4 — Commit & Push (ONLY when explicitly requested by user):
git add .
git commit -m "type: description"
git push origin Dev

Step 4 — Before merging Dev → main (full review):
Run ALL checks in order:
a) npx tsc --noEmit → must show 0 errors
b) npm test → must pass all tests (62/62)
c) npm run lint → must show 0 errors, 0 warnings
d) npm run build → must PASS
e) grep -r "console.log" src/ → must return empty
f) grep -r ": any" src/ → must return empty
g) git diff main..Dev → review all changes

Report results in this table:
| Check | Status | Notes |
|-------|--------|-------|
| npx tsc --noEmit | ✅/❌ | 0 TypeScript errors |
| npm test | ✅/❌ | All tests passing |
| npm run lint | ✅/❌ | 0 errors, 0 warnings |
| npm run build | ✅/❌ | All routes compiled successfully |
| No console.logs | ✅/⚠️ | 0 results in src/ |
| No "any" types | ✅/❌ | 0 results in src/ |
| Clean architecture | ✅/❌ | 3 physical boundaries (server, client, shared) |
| Scope compliance | ✅/❌ | No unrequested packages or features added |
| Anti-fake success | ✅/❌ | No mocked successes in payment, webhook, or email |
| Secret protection | ✅/❌ | No raw secrets, keys, or PII in logs/prompts |
| i18n dictionaries | ✅/❌ | vi.ts & en.ts synchronized if new text added |
| No hardcoded data | ✅/❌ | |
| AGENTS.md updated | ✅/❌ | Status and task list updated |
| README.md updated | ✅/❌ | Updated if architecture/docs changed |

Step 5 — Create PR (ONLY after all checks pass):
- Use MCP GitHub to create Pull Request
- NEVER run git merge Dev on local main
- PR: From Dev → To main
- Title: reflects actual changes
- Body: include full checklist table + summary
- Send PR URL to user and wait for approval
- User merges on GitHub manually

---

## ─── REVIEW & FIX RULES ───

When running PR review checklist:
- If `build` fails → fix immediately, re-run build
- If `lint` fails → fix ALL errors (warnings are acceptable)
- If `console.log` found → remove all of them
- If `any` types found → replace with proper TypeScript types
- If architecture violation found → refactor to correct layer
- **Do NOT report failures without attempting to fix first**
- **Only report to user when ALL checks PASS**
- Exception: if fix requires a business logic decision → ask user first

### After CodeRabbit autofix pushes a commit:
- Always run: `npm run build`
- If build fails → fix the errors CodeRabbit introduced
- Never merge if Vercel deployment fails


---

## ─── COMMIT CONVENTIONS ───

**Format:** `type: short description`

| Type | When to use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Code restructure, no feature change |
| `style` | Formatting, no logic change |
| `test` | Adding or updating tests |
| `chore` | Build process, dependencies |
| `perf` | Performance improvement |

**Examples:**
```
feat: add VNPay payment gateway
fix: resolve insufficient stock error in checkout
docs: update AGENTS.md with PR workflow rules
refactor: migrate cart from Context to Zustand
chore: install supabase agent skills
```

---

## ─── PROJECT STATUS ───

### 🎯 FINALIZED BUSINESS PIVOT:
- KhoUI is officially configured as a **Premium UX/UI Website Template Marketplace**. The platform hosts, previews, and licenses high-fidelity frontend templates (Free & Paid digital source codes) equipped with GSAP, Tailwind 4, and Framer Motion.

### ✅ Completed:
- **Task 1 (Cart & Checkout framework)**: Baseline architecture built.
- **Task 5 (UI Evolution)**: Successfully migrated the storefront into an elegant, high-contrast editorial look inspired by the Sarab Spec, configured via local assets.
- **Digital Product Refactoring**: Transitioned core entities (`Product`, `Order`) from physical inventory tracking to digital download licensing models.
- **Autonomous AI Template Pipeline**: Engineered native zippers, AI design blueprints (with GSAP scroll triggers and interactive mouse followers), server-side storage handlers, and admin auto-population dashboard interfaces.
- **Centralized Shared Translation & Localization Architecture (i18n)**:
  - Centralized single-source-of-truth dictionaries in `src/i18n/dictionaries/vi.ts` and `src/i18n/dictionaries/en.ts`. Modifying any string in the central dictionary automatically updates all components across the entire codebase without searching or editing individual files.
  - Built Live Admin Translation Management (`/admin/translations`) with namespace filters, search, inline editing, and a "Sync Dictionary" feature to bulk-upsert all static keys directly into Supabase `site_translations`.
  - Built React Context `I18nProvider` & `useI18n()` hook, wrapping the root layout for instant client & server reactivity with zero hydration mismatches.
  - Localized 100% of storefront and transaction flows: Navbar, Topbar, Footer, Homepage (Hero, Advantages, Categories, Showcase, Journey, Newsletter), Shop Catalog (filters, search, sorts), Product Detail (reviews, instant download badges, accordions, licensing tiers), Cart page & CartDrawer, 3-Step Checkout with localized Zod validation messages, Auth (Login, Registration, OTP), Order Outcomes (Success, Failed), Demo Fullscreen Preview, 404 Page, and User Profile / Purchased Template Downloads.
  - Added full locale support to currency and date formatters (`formatCurrency`, `formatDate`).
- **Security Remediation & OWASP Hardening**:
  - Engineered centralized [`authGuards.ts`](src/server/presentation/actions/authGuards.ts) with `assertAdmin()` and `assertAuthenticated()`, securing all admin mutation actions.
  - Eliminated simulation backdoors in order flow and enforced strict input verification.
  - Hardened `/api/preview` SSRF vector with protocol, hostname, and path whitelisting.
  - Configured HTTP security headers (`nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) in `next.config.ts`.
  - Hardened database RLS policies to restrict storage manipulation and prevent unauthorized order updates.
- **Admin Suite & Dynamic Layout Evolution**:
  - Implemented modern collapsible admin sidebar (`AdminSidebar.tsx`) with smooth GSAP/CSS transitions and zero layout shifts.
  - Added Admin Customers (`/admin/customers`) and Settings (`/admin/settings`) views.
  - Fully bound Admin layout and navigation labels to dynamic `site_translations` dictionaries.
- **Interactive Demo Frame Polish**:
  - Built high-fidelity responsive preview frame (`DemoPreviewFrame.tsx`) with device mode toggles (desktop, tablet, mobile).
- **Automated Digital License & Order Email Fulfillment Engine**:
  - Engineered pure domain service interface [`IEmailService.ts`](src/server/domain/services/IEmailService.ts).
  - Built production infrastructure [`ResendEmailService.ts`](src/server/infrastructure/email/ResendEmailService.ts) using Resend SDK with safe development fallbacks.
  - Designed branded responsive HTML/plaintext email template [`orderConfirmationTemplate.ts`](src/server/infrastructure/email/templates/orderConfirmationTemplate.ts) delivering order invoice, unique license keys, and direct source code download links.
  - Implemented application use case [`SendOrderConfirmationEmailUseCase.ts`](src/server/application/use-cases/orders/SendOrderConfirmationEmail.ts).
  - Wired automated fulfillment triggering upon PayOS webhook confirmation, client payment verification, and admin manual payment approval, plus added on-demand resend action `resendOrderEmailAction`.
- **Clean Architecture Physical Separation (Option A)**:
  - Reorganized codebase into 3 strict physical boundaries: `src/server` (Backend: domain, application, infrastructure, presentation/actions, di), `src/client` (Frontend UI: components, hooks, stores), and `src/shared` (Contracts: constants, validations, utils, types).
  - Removed all legacy shims and updated 179 files across the project to canonical `@/server/*`, `@/client/*`, and `@/shared/*` import paths.
  - 100% Quality Gates verified: 0 TypeScript errors, 62/62 tests passing, 0 ESLint warnings, 0 `console.log`, 0 `: any`, and Next.js 16.2.4 Turbopack build passing all 32 routes.

### 🔄 In Progress:
- None currently.

### ⏳ Next Tasks (recommended order):
- Configure Custom SMTP in Supabase Dashboard with user's Resend credentials to unlock high-capacity Auth OTP sending.

### ⚠️ Known Issues:
- None currently.
---

## ─── PR REVIEW PROMPT ───

> Use this prompt whenever ready to merge Dev → main:

```
Read @AGENTS.md then run the full PR review checklist for Dev → main merge.
Report the checklist table. Fix all issues automatically.
When all checks pass, use MCP GitHub to create the Pull Request
and send me the URL.
```

---

## 🤖 Harness & Autonomous Execution Rules

- **Automated Validation**: Always run `npm run lint` and `npm run build` automatically after any code modifications to ensure visual and structural integrity.
- **Self-Healing Loop**: If compiler or linter errors arise, analyze the terminal logs directly and refactor files iteratively until 0 errors are achieved. Do not stop to prompt the user mid-loop.
- **Strict Architecture Boundaries**: Strictly respect the 4-layer boundaries (Clean Architecture). Do not employ runtime workarounds (such as dynamic `require` or runtime import bypasses) to bypass import restrictions from the Presentation/Application layers into the Infrastructure layer.
- **Anti-Scope Creep in Autonomous Loops**: Never install new npm dependencies, create unrequested pages, or alter database schemas during autonomous runs. If an enhancement is identified, record it with `// TODO:` and report it in the response summary.
- **Truthful Execution & Anti-Fake Success**: Never mock or falsify production results, webhook outcomes, or quality gates. Every test, lint, build, and payment check must be genuine.
- **Idempotent Order Logic**: Ensure order creation processes are safely wrapped in `try/catch/finally` blocks. Release any loading states and clear active carts immediately upon receiving a successful Order ID to prevent duplicate submissions.
- **Enterprise Static Gate**: Before opening a Pull Request, the agent MUST programmatically verify that NO `console.log` or explicit `: any` types exist in the `src/` directory. If found, they must be stripped or refactored into descriptive TypeScript interfaces automatically.
- **Strict No-Auto-Commit**: The agent MUST NEVER execute `git commit` or `git push` autonomously. Commits and pushes may only be performed upon direct and explicit instruction from the user.
- **Automatic Rollback Policy**: If a feature integration causes fatal compilation breaks that cannot be healed within 5 attempts, the agent must execute `git checkout -- .` on the affected files to preserve codebase stability and prevent corrupted states on the `Dev` branch.