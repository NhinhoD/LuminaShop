<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## ─── GIT WORKFLOW RULES ───

### Branch strategy:
- **main**: production-ready code only
- **Dev**: active development branch
- **feature/xxx**: new features (branch from Dev)
- **fix/xxx**: bug fixes (branch from Dev)

### Daily workflow:
1. **Always branch from Dev** (never from main)
   ```bash
   git checkout Dev
   git checkout -b feature/payment-cod
   ```

2. **Work on feature branch**

3. **Before merging feature → Dev**:
   - Run: `npm run build` (must pass)
   - Run: `npm run lint` (must pass)
   - No `console.log` left in code
   - No "any" TypeScript types
   - No hardcoded test data

4. **Merge feature → Dev**:
   ```bash
   git checkout Dev
   git merge feature/payment-cod
   git push origin Dev
   ```

5. **Before merging Dev → main**:
   - [x] All planned features for this release are done
   - [x] `npm run build` passes
   - [x] `npm run lint` passes (remaining warnings are non-blocking)
   - [x] No debug code or `console.log`s
   - [x] No "any" TypeScript types in `src`
   - [ ] `README.md` is updated
   - [x] `AGENTS.md` is updated with current status
   - [ ] User has reviewed and approved the status

6. **Merging Dev → main (PR Workflow)**:
   - **NEVER** run: `git merge Dev` on your local `main` branch.
   - Instead, push `Dev` to GitHub: `git push origin Dev`
   - Create a **Pull Request** on GitHub (From: `Dev` → To: `main`).
   - Wait for manual review and approval on GitHub.
   - The user will perform the merge on GitHub.

---

## ─── PROJECT STATUS ───

- **Task 1 (Cart)**: ✅ DONE (Zustand store, server actions, persistent state)
- **Task 2 (Checkout)**: ✅ DONE (Form validation, shipping/billing, order creation)
- **Task 3a (COD Payment)**: ✅ DONE (Infrastructure gateway, repository integration)
- **Task 4 (Admin Suite - basic)**: ✅ DONE (Product & Category management, inventory tracking)

### **NEXT STEPS**
- **Task 3b (VNPay / MoMo)**: Integrate electronic payment gateways.
- **Task 4 (Admin Suite - full)**: Implement Order Management and Customer Dashboards.
- **Task 5 (Performance)**: Image optimization and edge caching.
