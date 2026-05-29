# LuminaShop — Agent Instructions

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
3. Read @src/domain — understand all entities and interfaces
4. Read @src/application — understand all use cases
5. Read @src/infrastructure/supabase — understand DB layer
6. Read @src/presentation — understand UI layer
7. Read @public/stitch_e_commerce_ux_ui_design — UI design references
8. Read @.agents/skills/supabase/ — Supabase & Postgres best practices
9. Read @.agents/skills/stitch/ — Stitch UX/UI design patterns
10. Read @.agents/skills/gsap/ — GSAP core, timeline, and performance core competencies
11. Read @.agents/skills/design/ — Design taste, layout morphing & prompt enhancements
12. Read @.agents/skills/react-components — React & Tailwind 4 execution rules

After reading, report to user:
- ✅ What is DONE
- 🔄 What is IN PROGRESS
- ⏳ What is the NEXT TASK
- ⚠️ Any issues or bugs found in code

**Wait for user confirmation before writing any code.**

---

## ─── PROJECT CONTEXT ───

**Project:** LuminaShop — Modern E-Commerce Platform
**Purpose:** Learning project — exploring modern web technologies
**Repository:** https://github.com/NhinhoD/LuminaShop

### Tech Stack:
- **Frontend:** Next.js 15 App Router, React 19, TypeScript (strict)
- **Styling:** Tailwind CSS 4, Framer Motion
- **State:** Zustand (cart), Zod (validation)
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Icons:** Lucide React
- **MCP Tools:** MCP Supabase, MCP Stitch, MCP GitHub

### Database Tables:
- `profiles` — user profiles
- `categories` — product categories
- `products` — products (stock: int4)
- `product_variants` — variants (stock_quantity: int4)
- `inventory_items` — stock tracking (synced via triggers)
- `carts` + `cart_items` — shopping cart
- `orders` + `order_items` — orders
- `payments` — payment records

---

## ─── ARCHITECTURE RULES ───

**Clean Architecture — strict layer boundaries. Never violate these.**

```
domain/ → application/ → infrastructure/ → presentation/
```

### Layer responsibilities:

**`src/domain/`** — Core business logic
- Entities, interfaces, enums ONLY
- NO imports from any other layer
- NO external libraries (no supabase, no next, no react)
- Example: `Order`, `IOrderRepository`, `OrderStatus`

**`src/application/`** — Use cases
- Business logic and orchestration ONLY
- Only imports from `domain/`
- NO direct DB calls, NO supabase client
- Example: `CreateOrderUseCase`, `ProcessPaymentUseCase`

**`src/infrastructure/supabase/`** — Data layer
- Implements interfaces from `domain/`
- ONLY layer allowed to import supabase client
- Always map `snake_case` DB columns → `camelCase` domain entities
- Example: `SupabaseOrderRepository`, `CODPaymentGateway`

**`src/presentation/`** — UI layer
- Components, server actions, hooks, Zustand stores
- Calls application use cases via server actions
- NEVER calls supabase directly
- NEVER imports from `infrastructure/`
- Example: `createOrderAction`, `useCartStore`, `CheckoutForm`

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

### Daily workflow:

Step 1 — Always work on Dev branch:
git checkout Dev
git pull origin Dev

Step 2 — Write code directly on Dev branch

Step 3 — Commit regularly:
git add .
git commit -m "type: description"
git push origin Dev

Step 4 — Before merging Dev → main (full review):
Run ALL checks in order:
a) npm run build → must PASS
b) npm run lint → must show 0 errors
c) grep -r "console.log" src/ → must return empty
d) grep -r ": any" src/ → must return empty
e) git diff main..Dev → review all changes

Report results in this table:
| Check | Status | Notes |
|-------|--------|-------|
| npm run build | ✅/❌ | |
| npm run lint | ✅/❌ | |
| No console.logs | ✅/⚠️ | |
| No "any" types | ✅/❌ | |
| Clean architecture | ✅/❌ | |
| No hardcoded data | ✅/❌ | |
| AGENTS.md updated | ✅/❌ | |
| README.md updated | ✅/❌ | |

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

### ✅ Completed:
- **Task 1 (Cart):** Zustand store, server actions, persistent state
- **Task 2 (Checkout):** Multi-step form, Zod validation, order creation
- **Task 3a (COD Payment):** CODPaymentGateway, payment flow, success/failure pages
- **Task 4 (Admin Suite & Customer Dashboard):** Full order management, status tracking, and profile history
- **Task 1b (Atomic Inventory):** Atomic stock deduction via SQL RPC, race-condition prevention
- **Inventory Sync:** Auto-sync products.stock from variants via DB triggers
- **Type Safety:** 100% — 0 `any` types in `src/`, 0 build/lint errors
- **Git Workflow:** PR-based workflow enforced
- **All Skills:** Consolidated in `.agents/skills/`
- **MCP GitHub:** Connected and configured
- **Cart Bug Fixes**: Corrected cart negative quantity decrement limit and added variant checks to QuickAddButton.

### 🔄 In Progress:
- **Task 5 (UX/UI Evolution):** Overhauling the storefront visual experience using Tailwind CSS 4, Framer Motion layoutId morphing, and advanced GSAP ScrollTrigger orchestration based on new MCP Stitch prototypes.

### ⏳ Next Tasks (recommended order):
1. **Task 3b** — Real-money payment integration (VietQR / PayOS Integration)
2. **Task 5b** — Backend/Edge caching performance optimization

### ⚠️ Known Issues:
- None currently

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
- **Idempotent Order Logic**: Ensure order creation processes are safely wrapped in `try/catch/finally` blocks. Release any loading states and clear active carts immediately upon receiving a successful Order ID to prevent duplicate submissions.
- **Enterprise Static Gate**: Before opening a Pull Request, the agent MUST programmatically verify that NO `console.log` or explicit `: any` types exist in the `src/` directory. If found, they must be stripped or refactored into descriptive TypeScript interfaces automatically.
- **Automatic Rollback Policy**: If a feature integration causes fatal compilation breaks that cannot be healed within 5 attempts, the agent must execute `git checkout -- .` on the affected files to preserve codebase stability and prevent corrupted states on the `Dev` branch.