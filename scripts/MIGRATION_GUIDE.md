# SplitBill Pro — Data Migration Guide

## Prerequisites

1. You need your **Supabase DB password** (set during project creation)
2. Update `.env.local` — replace `[YOUR-PASSWORD]` on both `DATABASE_URL` and `DIRECT_URL`

---

## Step 1: Push the Schema to Supabase

```bash
# Push the unified schema to your Supabase database
npx prisma migrate deploy
```

If you haven't created migrations yet:
```bash
npx prisma migrate dev --name initial_unified_schema
```

---

## Step 2: Export Local SQLite Data to JSON

Run this in a new terminal (needs sqlite3 installed, or use the Node script below):

**Option A — using Node.js** (recommended):
```bash
npx ts-node scripts/export-local-data.ts
```

**Option B — using sqlite3 CLI**:
```bash
sqlite3 prisma/dev.db -json "SELECT * FROM Bank;" > /tmp/banks.json
sqlite3 prisma/dev.db -json "SELECT * FROM Person;" > /tmp/people.json
# ... etc. then combine into scripts/migration-data.json
```

The `migration-data.json` file format expected by the migration script:
```json
{
  "banks": [...],
  "people": [...],
  "groups": [{ "id": "...", "name": "...", "members": [{ "personId": "..." }] }],
  "bills": [{ "id": "...", "title": "...", "payerId": "...", ... }]
}
```

---

## Step 3: Dry Run

```bash
DRY_RUN=true npx ts-node scripts/migrate-data.ts
```

Review the output counts. If they look right, proceed.

---

## Step 4: Live Migration

Set your `MIGRATION_USER_ID` to the UUID of your Supabase auth user:

```bash
MIGRATION_USER_ID="your-supabase-user-uuid" npx ts-node scripts/migrate-data.ts
```

---

## Step 5: Verify

```bash
npx prisma studio
```

Check that all Bills, People, Groups, and Items are visible.

---

## After Migration

1. Enable Google OAuth in your Supabase Dashboard → Authentication → Providers
2. Add your Vercel deployment URL to Supabase → Authentication → URL Configuration
3. Set all env vars in Vercel Dashboard → Settings → Environment Variables
