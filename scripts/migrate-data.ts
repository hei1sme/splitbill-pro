/**
 * Data Migration Script: Local SQLite → Supabase PostgreSQL
 *
 * This script reads exported JSON data from the local dev.db and writes
 * it into the unified Supabase schema.
 *
 * Usage:
 *   1. Export your local dev.db to JSON (see instructions below)
 *   2. Set DATABASE_URL in .env.local to point at Supabase
 *   3. Run: npx ts-node --project tsconfig.json scripts/migrate-data.ts
 *
 * To export local SQLite data:
 *   npx prisma db pull --schema=prisma/schema.dev.prisma  (if you still have it)
 *   OR use: sqlite3 prisma/dev.db .dump > dev-dump.sql
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const DRY_RUN = process.env.DRY_RUN === 'true';
const DEFAULT_USER_ID = process.env.MIGRATION_USER_ID || 'migration-placeholder-user';

const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

interface LegacyDataExport {
  banks?: LegacyBank[];
  people?: LegacyPerson[];
  groups?: LegacyGroup[];
  bills?: LegacyBill[];
}

interface LegacyBank {
  id: string;
  code: string;
  name: string;
  logoUrl?: string;
  type?: string;
}

interface LegacyPerson {
  id: string;
  displayName: string;
  bankCode?: string;
  accountNumber?: string;
  accountHolder?: string;
  qrUrl?: string;
  active?: boolean;
}

interface LegacyGroup {
  id: string;
  name: string;
  members?: Array<{ personId: string }>;
}

interface LegacyBill {
  id: string;
  title: string;
  date: string;
  description?: string;
  status?: string;
  payerId?: string;
  groupId?: string;
  // Legacy fields
  items?: LegacyItem[];
  participants?: LegacyParticipant[];
}

interface LegacyItem {
  id?: string;
  name?: string;
  description?: string;
  fee?: number;
  amount?: number;
  type?: string;
  order?: number;
  splitMethod?: string;
  shares?: LegacyShare[];
}

interface LegacyParticipant {
  id: string;
  displayName?: string;
  personId?: string;
}

interface LegacyShare {
  participantId?: string;
  personId?: string;
  amount?: number;
}

async function migrate() {
  console.log(`\n🚀 SplitBill Pro Data Migration`);
  console.log(`Mode: ${DRY_RUN ? '🔵 DRY RUN (no writes)' : '🔴 LIVE WRITE to Supabase'}\n`);

  // Load data export file
  const dataFilePath = path.join(process.cwd(), 'scripts', 'migration-data.json');
  if (!fs.existsSync(dataFilePath)) {
    console.error(`❌ Migration data file not found: ${dataFilePath}`);
    console.error(`   Create it by exporting your local SQLite data to JSON format.`);
    console.error(`   See scripts/MIGRATION_GUIDE.md for instructions.`);
    process.exit(1);
  }

  const rawData: LegacyDataExport = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
  const stats = { banks: 0, people: 0, groups: 0, bills: 0, items: 0, shares: 0 };

  // ── 1. Banks ──────────────────────────────────────────────────────────────
  if (rawData.banks?.length) {
    console.log(`📦 Migrating ${rawData.banks.length} banks…`);
    for (const bank of rawData.banks) {
      if (!DRY_RUN) {
        await prisma.bank.upsert({
          where: { code: bank.code },
          update: { name: bank.name, logoUrl: bank.logoUrl },
          create: {
            code: bank.code,
            name: bank.name,
            logoUrl: bank.logoUrl,
            type: (bank.type as 'BANK' | 'EWALLET') ?? 'BANK',
          },
        });
      }
      stats.banks++;
    }
    console.log(`   ✓ ${stats.banks} banks`);
  }

  // ── 2. People ─────────────────────────────────────────────────────────────
  if (rawData.people?.length) {
    console.log(`📦 Migrating ${rawData.people.length} people…`);
    for (const person of rawData.people) {
      if (!DRY_RUN) {
        await prisma.person.upsert({
          where: { id: person.id },
          update: {},
          create: {
            id: person.id,
            userId: DEFAULT_USER_ID,
            displayName: person.displayName,
            bankCode: person.bankCode || null,
            accountNumber: person.accountNumber || null,
            accountHolder: person.accountHolder || null,
            qrUrl: person.qrUrl || null,
            active: Boolean(person.active ?? true),
          },
        });
      }
      stats.people++;
    }
    console.log(`   ✓ ${stats.people} people`);
  }

  // ── 3. Groups ─────────────────────────────────────────────────────────────
  if (rawData.groups?.length) {
    console.log(`📦 Migrating ${rawData.groups.length} groups…`);
    for (const group of rawData.groups) {
      if (!DRY_RUN) {
        await prisma.group.upsert({
          where: { id: group.id },
          update: {},
          create: {
            id: group.id,
            userId: DEFAULT_USER_ID,
            name: group.name,
            members: {
              create: (group.members ?? []).map((m) => ({
                person: { connect: { id: m.personId } },
              })),
            },
          },
        });
      }
      stats.groups++;
    }
    console.log(`   ✓ ${stats.groups} groups`);
  }

  // ── 4. Bills ──────────────────────────────────────────────────────────────
  if (rawData.bills?.length) {
    console.log(`📦 Migrating ${rawData.bills.length} bills…`);
    for (const bill of rawData.bills) {
      // Determine participants
      let participants: LegacyParticipant[] = bill.participants ?? [];

      // Try to parse JSON from description field (legacy format)
      if (!participants.length && bill.description) {
        try {
          const parsed = JSON.parse(bill.description);
          if (parsed.participants) participants = parsed.participants;
        } catch {
          // Not JSON — just a text description, ignore
        }
      }

      // Fallback: use group members
      if (!participants.length && bill.groupId) {
        const group = rawData.groups?.find((g) => g.id === bill.groupId);
        if (group?.members) {
          participants = group.members.map((m) => ({ id: m.personId, personId: m.personId }));
        }
      }

      if (!bill.payerId) {
        console.warn(`   ⚠️  Bill "${bill.title}" has no payerId — skipping`);
        continue;
      }

      // Determine items
      let items: LegacyItem[] = bill.items ?? [];
      if (!items.length && bill.description) {
        try {
          const parsed = JSON.parse(bill.description);
          if (parsed.items) items = parsed.items;
        } catch {
          // ignore
        }
      }

      if (!DRY_RUN) {
        // Create bill with participants
        await prisma.bill.upsert({
          where: { id: bill.id },
          update: {},
          create: {
            id: bill.id,
            userId: DEFAULT_USER_ID,
            title: bill.title,
            date: new Date(bill.date),
            status: (bill.status as 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'SETTLED') ?? 'COMPLETED',
            payerId: bill.payerId,
            participants: {
              create: participants
                .filter((p) => p.personId || p.id)
                .map((p, idx) => ({
                  person: { connect: { id: p.personId || p.id } },
                  isPayer: (p.personId || p.id) === bill.payerId,
                  order: idx,
                })),
            },
          },
        });

        // Create items and shares
        for (let i = 0; i < items.length; i++) {
          const legItem = items[i];
          const itemName = legItem.name || legItem.description || `Item ${i + 1}`;
          const itemFee = legItem.fee ?? legItem.amount ?? 0;

          const createdItem = await prisma.item.create({
            data: {
              billId: bill.id,
              name: itemName,
              fee: itemFee,
              type: (legItem.type as 'NORMAL' | 'CARRY_OVER' | 'SPECIAL') ?? 'NORMAL',
              order: legItem.order ?? i,
              splitMethod: (legItem.splitMethod as 'EQUAL' | 'PERCENT' | 'CUSTOM') ?? 'EQUAL',
            },
          });
          stats.items++;

          // Create shares
          const shares = legItem.shares ?? [];
          for (const share of shares) {
            const targetPersonId = share.participantId || share.personId;
            if (!targetPersonId) continue;

            const billParticipant = await prisma.billParticipant.findFirst({
              where: { billId: bill.id, personId: targetPersonId },
            });

            if (billParticipant) {
              await prisma.itemShare.upsert({
                where: {
                  itemId_participantId: {
                    itemId: createdItem.id,
                    participantId: billParticipant.id,
                  },
                },
                update: {},
                create: {
                  itemId: createdItem.id,
                  participantId: billParticipant.id,
                  amount: share.amount ?? 0,
                },
              });
              stats.shares++;
            }
          }
        }
      }

      stats.bills++;
    }
    console.log(`   ✓ ${stats.bills} bills, ${stats.items} items, ${stats.shares} shares`);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`\n✅ Migration ${DRY_RUN ? '(dry run) ' : ''}complete!`);
  console.log(`   Banks     : ${stats.banks}`);
  console.log(`   People    : ${stats.people}`);
  console.log(`   Groups    : ${stats.groups}`);
  console.log(`   Bills     : ${stats.bills}`);
  console.log(`   Items     : ${stats.items}`);
  console.log(`   Shares    : ${stats.shares}`);

  if (DRY_RUN) {
    console.log(`\n💡 Run without DRY_RUN=true to write to database.`);
  }
}

migrate()
  .catch((e) => {
    console.error('\n❌ Migration failed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
