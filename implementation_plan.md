# SplitBill Pro — Full Audit, UI Overhaul & Cloud Migration Plan

## Executive Summary

After a deep scan of every file in the codebase, I've identified **critical structural issues** that must be resolved before any production deployment. The project has significant technical debt from rapid feature iteration, including a **schema split-brain problem**, **dead code bloat**, **missing authentication**, and a **data persistence anti-pattern** that stores bill state as JSON in the `description` field.

This plan is structured into 5 phases, ordered by dependency priority.

---

## Audit Findings

### 🔴 Critical Issues

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 1 | **Dev/prod schemas are completely different** — Dev uses SQLite with `Bill.description`, `BillItem`, `BillSplit`, `Settlement` models. Prod uses PostgreSQL with `BillParticipant`, `Item`, `ItemShare` — different names, different structures, different enums | [schema.dev.prisma](file:///c:/Users/Le%20Nguyen%20Gia%20Hung/everything/Code/major-project/splitbill-pro/prisma/schema.dev.prisma) vs [schema.prod.prisma](file:///c:/Users/Le%20Nguyen%20Gia%20Hung/everything/Code/major-project/splitbill-pro/prisma/schema.prod.prisma) | **Showstopper** — code references dev schema types everywhere; prod schema is orphaned |
| 2 | **Bill data stored as JSON in `description` field** — The `/api/bills/[id]/save` route serializes `participants`, `items`, and `settings` into `bill.description` instead of using relational tables | [save/route.ts](file:///c:/Users/Le%20Nguyen%20Gia%20Hung/everything/Code/major-project/splitbill-pro/src/app/api/bills/%5Bid%5D/save/route.ts) | Data integrity risk, unqueryable, unmigratable |
| 3 | **Multiple PrismaClient instantiations** — Some API routes import from `@/lib/prisma` (singleton), others do `new PrismaClient()` inline, causing connection pool exhaustion | [people/route.ts](file:///c:/Users/Le%20Nguyen%20Gia%20Hung/everything/Code/major-project/splitbill-pro/src/app/api/people/route.ts), [groups/route.ts](file:///c:/Users/Le%20Nguyen%20Gia%20Hung/everything/Code/major-project/splitbill-pro/src/app/api/groups/route.ts), [banks/route.ts](file:///c:/Users/Le%20Nguyen%20Gia%20Hung/everything/Code/major-project/splitbill-pro/src/app/api/banks/route.ts) | Connection pool exhaustion on Supabase (max ~20 connections) |
| 4 | **No authentication** — every API route is publicly accessible; no user scoping on any query | All API routes | Any user can see/modify all data |
| 5 | **ESLint & TypeScript checks disabled in build** — `ignoreDuringBuilds: true` masks real type errors | [next.config.ts](file:///c:/Users/Le%20Nguyen%20Gia%20Hung/everything/Code/major-project/splitbill-pro/next.config.ts) | Hiding bugs |

### 🟡 Significant Issues

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 6 | **Zustand listed as dependency but never used** — `zustand@5.0.8` is installed but zero imports exist | [package.json](file:///c:/Users/Le%20Nguyen%20Gia%20Hung/everything/Code/major-project/splitbill-pro/package.json) | Bundle bloat |
| 7 | **BillDetailsEnhanced.tsx is 3,511 lines / 180KB** — A single God component managing participants, items, splits, settings, exports, snapshots, modals, status, payment info, and more | [BillDetailsEnhanced.tsx](file:///c:/Users/Le%20Nguyen%20Gia%20Hung/everything/Code/major-project/splitbill-pro/src/app/bills/%5Bid%5D/BillDetailsEnhanced.tsx) | Unmaintainable |
| 8 | **Massive dead-code surface** — Demo pages (`/demo`, `/modern-demo`, `/test`), showcase components, AI, analytics, banking, enterprise, i18n, mobile, and payments components appear unused | Multiple directories | Bundle bloat, confusion |
| 9 | **Inconsistent API response shapes** — Banks/People return `{ success, data }`, Groups return raw array, Bills return raw array | All API routes | Frontend has to guess and handle both |
| 10 | **Calculate endpoint assumes simple even split only** — `bill.group.members` is accessed without null-check; doesn't handle MANUAL/MIXED participant modes | [calculate/route.ts](file:///c:/Users/Le%20Nguyen%20Gia%20Hung/everything/Code/major-project/splitbill-pro/src/app/api/bills/%5Bid%5D/calculate/route.ts#L32) | Crash if `bill.group` is null (MANUAL mode) |
| 11 | **Heavy gradient/glassmorphism CSS** — `bg-gradient-to-*`, `blur-[140px]`, `shadow-[0_45px_...]`, `backdrop-blur-3xl` throughout layout, sidebar, page hero, and globals | [layout.tsx](file:///c:/Users/Le%20Nguyen%20Gia%20Hung/everything/Code/major-project/splitbill-pro/src/app/layout.tsx), [globals.css](file:///c:/Users/Le%20Nguyen%20Gia%20Hung/everything/Code/major-project/splitbill-pro/src/app/globals.css), [Sidebar.tsx](file:///c:/Users/Le%20Nguyen%20Gia%20Hung/everything/Code/major-project/splitbill-pro/src/components/layout/Sidebar.tsx), [PageHero.tsx](file:///c:/Users/Le%20Nguyen%20Gia%20Hung/everything/Code/major-project/splitbill-pro/src/components/layout/PageHero.tsx) | Performance; doesn't match enterprise aesthetic |
| 12 | **Notifications are client-only in-memory** — `useSmartNotifications` keeps state in `useState`, not persisted anywhere | [NotificationCenter.tsx](file:///c:/Users/Le%20Nguyen%20Gia%20Hung/everything/Code/major-project/splitbill-pro/src/components/notifications/NotificationCenter.tsx) | Notifications lost on refresh |

---

## User Review Required

> [!IMPORTANT]
> **Schema Decision**: The dev schema (SQLite) and prod schema (PostgreSQL) have **completely divergent models**. The entire running codebase currently targets the dev schema. I propose we **unify on the prod schema design** (which is cleaner: `BillParticipant`, `Item`, `ItemShare`) as the single canonical schema pointing to Supabase PostgreSQL, and migrate all API routes and components to match. This means the current dev SQLite data would need to be **ETL-migrated** (extracted, transformed, and loaded) into the new structure. **Do you agree with this direction, or do you prefer to keep the dev schema structure?**

> [!WARNING]
> **Data Loss Risk**: The current `description` field stores bill split/participant state as serialized JSON. When we unify schemas, this data will need to be extracted and written into proper relational tables (`Item`, `ItemShare`, `BillParticipant`). I will write a migration script for this, but **some edge-case JSON data may be malformed**. I recommend we do a dry-run migration against a copy of your database first.

> [!IMPORTANT]
> **Supabase Credentials Needed**: To proceed with Phase 3 (Auth) and Phase 4 (DB Migration), I need:
> 1. Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
> 2. Your Supabase `anon` key and `service_role` key
> 3. Your Supabase database connection string (from Supabase Dashboard → Settings → Database → Connection string → URI)

---

## Proposed Changes

### Phase 1: Codebase Cleanup & Schema Unification

The foundation — fix the schema split-brain, consolidate Prisma, and remove dead code.

---

#### [DELETE] `schema.dev.prisma`
#### [DELETE] `schema.prod.prisma`
#### [NEW] `schema.prisma`

Unify into a single `prisma/schema.prisma` targeting PostgreSQL via `env("DATABASE_URL")`. Adopt the cleaner prod schema structure (`BillParticipant`, `Item`, `ItemShare`) with one addition: a `userId` field on `Bill`, `Person`, and `Group` models for auth scoping.

#### [MODIFY] [prisma.ts](file:///c:/Users/Le%20Nguyen%20Gia%20Hung/everything/Code/major-project/splitbill-pro/src/lib/prisma.ts)

Switch import from `@prisma/client/dev` to standard `@prisma/client`. Remove the custom output paths from the schema. All API routes will import from this single `@/lib/prisma` module.

#### [MODIFY] All API routes

- Replace all `new PrismaClient()` instantiations with `import { prisma } from "@/lib/prisma"`
- Standardize response shape: `{ success: boolean, data?: T, error?: { message: string } }`
- Add null-checks for `bill.group` in calculate endpoint
- Fix the save endpoint to write into proper `Item` / `ItemShare` tables instead of JSON-in-description

#### [MODIFY] [package.json](file:///c:/Users/Le%20Nguyen%20Gia%20Hung/everything/Code/major-project/splitbill-pro/package.json)

- Remove `zustand` (unused)
- Remove duplicate scripts (`db:gen:dev`, `db:gen:prod`, etc.) → simplify to `db:generate`, `db:migrate`, `db:seed`, `db:studio`
- Add `@supabase/supabase-js` and `@supabase/ssr` dependencies

#### [DELETE] Dead code directories

- `src/app/demo/`
- `src/app/modern-demo/`
- `src/app/test/`
- `src/app/bill/` (duplicate of `src/app/bills/`)
- `src/components/showcase/`
- `src/components/ai/`
- `src/components/analytics/`
- `src/components/banking/`
- `src/components/enterprise/`
- `src/components/i18n/`
- `src/components/mobile/`
- `src/components/payments/`

#### [MODIFY] [validations.ts](file:///c:/Users/Le%20Nguyen%20Gia%20Hung/everything/Code/major-project/splitbill-pro/src/lib/validations.ts)

- Update schemas to match unified Prisma models (e.g., `SplitMode` → `SplitMethod`, `BillItem` → `Item`)
- Remove `BillFormEnhancedSchema` and `BillSplitSchema` (replaced by `ItemShare` model)
- Add auth-related validation schemas

#### [MODIFY] [types/index.ts](file:///c:/Users/Le%20Nguyen%20Gia%20Hung/everything/Code/major-project/splitbill-pro/src/types/index.ts)

Update type definitions to reference the unified Prisma client, not `.prisma/client-dev`.

---

### Phase 2: UI/UX Enterprise Overhaul

Strip all gradients and glassmorphism. Replace with a clean, high-contrast, professional dark theme.

---

#### [MODIFY] [globals.css](file:///c:/Users/Le%20Nguyen%20Gia%20Hung/everything/Code/major-project/splitbill-pro/src/app/globals.css)

- Remove all `radial-gradient` background effects from `body`
- Remove `.glass-panel`, `.frosted-card`, `.neon-pill` component classes
- Replace with clean neutral dark tokens: `--background: 0 0% 7%` (near-black), `--card: 0 0% 10%`, `--border: 0 0% 18%`
- Enterprise-grade design system: flat surfaces, subtle 1px borders, no blur/glow

#### [MODIFY] [layout.tsx](file:///c:/Users/Le%20Nguyen%20Gia%20Hung/everything/Code/major-project/splitbill-pro/src/app/layout.tsx)

- Remove the three large blur orbs from the main content area
- Replace with clean `bg-background text-foreground` 
- Add conditional layout: show Sidebar only when authenticated

#### [MODIFY] [Sidebar.tsx](file:///c:/Users/Le%20Nguyen%20Gia%20Hung/everything/Code/major-project/splitbill-pro/src/components/layout/Sidebar.tsx)

- Remove gradient background, blur orbs, and neon shadow effects
- Clean dark sidebar with `bg-card border-r border-border`
- Simplify nav items: remove "hint" labels, remove `shadow-[0_20px_60px_...]`
- Replace gradient "New Bill" button with solid primary button
- Add user avatar + sign-out at the bottom

#### [MODIFY] [PageHero.tsx](file:///c:/Users/Le%20Nguyen%20Gia%20Hung/everything/Code/major-project/splitbill-pro/src/components/layout/PageHero.tsx)

- Remove blur orbs, gradient accents, and `shadow-[0_45px...]`
- Replace with flat card: `bg-card border border-border rounded-xl p-6`
- Clean typography: regular weight headings, no uppercase tracking on eyebrows

#### [MODIFY] All page components

Update `bills/page.tsx`, `people/page.tsx`, `groups/page.tsx`, `dashboard/DashboardClient.tsx` and all dashboard sub-components to:
- Remove `frosted-card`, `glass-panel` usage
- Replace with `bg-card border border-border rounded-lg`
- Remove decorative gradient buttons; use solid `bg-primary` or `bg-secondary`
- Consistent card patterns with subtle hover states

#### [MODIFY] All shadcn/ui components

Audit and update `card.tsx`, `button.tsx`, `badge.tsx`, `dialog.tsx`, `tabs.tsx` etc. to ensure they use clean CSS variables without inline gradient overrides.

---

### Phase 3: Supabase Authentication

Add login/register flows with Supabase Auth. Gate all routes behind authentication.

---

#### [NEW] `src/lib/supabase/client.ts`

Browser-side Supabase client using `createBrowserClient` from `@supabase/ssr`.

#### [NEW] `src/lib/supabase/server.ts`

Server-side Supabase client using `createServerClient` from `@supabase/ssr` for use in Server Components and API routes.

#### [NEW] `src/lib/supabase/middleware.ts`

Session refresh logic extracted for the Next.js middleware.

#### [NEW] `src/middleware.ts`

Next.js middleware to:
- Refresh Supabase auth session on every request
- Redirect unauthenticated users to `/auth/login`
- Allow `/auth/*` routes without session

#### [NEW] `src/app/auth/login/page.tsx`

Clean login page with email/password and optional OAuth (Google, GitHub).

#### [NEW] `src/app/auth/register/page.tsx`

Registration page with email/password.

#### [NEW] `src/app/auth/callback/route.ts`

OAuth callback handler for Supabase auth code exchange.

#### [NEW] `src/app/(authenticated)/layout.tsx`

Route group layout that wraps the Sidebar and validates session. All protected pages move under this group.

#### [MODIFY] All API routes

Add `getUser()` check at the top of every API handler. Filter all database queries by `userId` to scope data per user.

#### [MODIFY] Prisma schema

Add `userId String` field (indexed) to `Person`, `Group`, and `Bill` models. This ensures complete data isolation between users.

---

### Phase 4: Database Migration (Local → Supabase)

---

#### [MODIFY] `prisma/schema.prisma`

Point `datasource.url` to `env("DATABASE_URL")` — works for both local dev (direct connection) and production (Supabase pooled connection via `?pgbouncer=true`).

#### [NEW] `scripts/migrate-data.ts`

A standalone migration script that:
1. Reads the local SQLite `dev.db` using a separate SQLite PrismaClient
2. Transforms data from dev schema (Bill, BillItem, BillSplit, Settlement) → prod schema (Bill, Item, ItemShare, BillParticipant)
3. Extracts JSON blobs from `description` field and writes them into proper relational tables
4. Assigns a default `userId` to all migrated records (the first authenticated user)
5. Writes to Supabase PostgreSQL via a separate PostgreSQL PrismaClient
6. Logs all operations and validates counts

#### Step-by-step data transfer strategy:
1. **Backup** — `cp prisma/dev.db prisma/dev.db.backup`
2. **Provision** — Run `npx prisma migrate deploy` against Supabase to create tables
3. **Dry run** — Run migration script with `DRY_RUN=true` to validate transformations
4. **Execute** — Run migration script against Supabase
5. **Verify** — Compare record counts and spot-check critical records

#### [MODIFY] `.env.example`

Add Supabase-specific variables:
```
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

### Phase 5: Vercel Deployment Preparation

---

#### [MODIFY] [next.config.ts](file:///c:/Users/Le%20Nguyen%20Gia%20Hung/everything/Code/major-project/splitbill-pro/next.config.ts)

- Remove `ignoreDuringBuilds: true` for both ESLint and TypeScript (after fixing all type errors in earlier phases)
- Tighten `images.remotePatterns` to only allow your Supabase storage domain
- Remove `removeConsole` (Vercel has its own log management)

#### [MODIFY] [package.json](file:///c:/Users/Le%20Nguyen%20Gia%20Hung/everything/Code/major-project/splitbill-pro/package.json)

Add `postinstall` script: `"postinstall": "prisma generate"` (required for Vercel builds).

#### [NEW] `.env.local.example`

Template with all required Vercel environment variables documented.

#### [NEW] `vercel.json` (optional)

Build settings if needed (region selection, function timeout, etc.).

---

## Open Questions

> [!IMPORTANT]
> 1. **Schema direction**: Should we adopt the prod schema structure (cleaner `BillParticipant`/`Item`/`ItemShare`) or keep the dev schema structure? I strongly recommend the prod schema.
> 2. **Supabase credentials**: Please share your Supabase project URL, anon key, service role key, and database connection strings so I can configure the env files.
> 3. **OAuth providers**: Do you want Google/GitHub OAuth on the login page, or just email/password for now?
> 4. **Data migration scope**: Is all the data in your local SQLite production-critical, or is some of it test data that can be discarded?
> 5. **Dead code**: I identified ~15 unused component directories and 3 demo pages. Can I delete them all, or are any of them planned for future use?

---

## Verification Plan

### Automated Tests
- Run `npx prisma validate` to verify unified schema
- Run `npx prisma migrate deploy --dry-run` against Supabase 
- Run `npm run build` with strict TypeScript checks re-enabled
- Run the data migration script in dry-run mode
- Test all API routes with `curl`/Postman to verify auth gating and response shapes

### Manual Verification
- Test full flow: Register → Login → Create Person → Create Group → Create Bill → Add Items → Split → Settle
- Verify visual UI across all pages matches enterprise aesthetic (no gradients, no blur orbs)
- Verify data isolation: create a second user and confirm they cannot see User 1's data
- Test Vercel deployment with `vercel --prod` preview
