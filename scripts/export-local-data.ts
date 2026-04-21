/**
 * Export local SQLite data to migration-data.json
 * Run: npx ts-node scripts/export-local-data.ts
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// Connect to local SQLite (you'll need to temporarily swap DATABASE_URL to SQLite)
// OR just use the SQLite client directly
const prisma = new PrismaClient();

async function exportData() {
  console.log('Exporting local data...');
  
  const [banks, people, groups, bills] = await Promise.all([
    prisma.bank.findMany(),
    prisma.person.findMany(),
    prisma.group.findMany({
      include: { members: true }
    }),
    prisma.bill.findMany({
      include: {
        participants: {
          include: { person: true }
        },
        items: {
          include: { shares: true }
        }
      }
    })
  ]);

  const exportData = {
    banks,
    people,
    groups: groups.map(g => ({
      ...g,
      members: g.members.map(m => ({ personId: m.personId }))
    })),
    bills: bills.map(b => ({
      ...b,
      participants: b.participants.map(p => ({
        id: p.personId,
        personId: p.personId,
        isPayer: p.isPayer
      })),
      items: b.items.map(i => ({
        ...i,
        fee: Number(i.fee),
        shares: i.shares.map(s => ({
          participantId: s.participantId,
          amount: Number(s.amount)
        }))
      }))
    }))
  };

  const outPath = path.join(process.cwd(), 'scripts', 'migration-data.json');
  fs.writeFileSync(outPath, JSON.stringify(exportData, null, 2));

  console.log(`✅ Exported:`);
  console.log(`   Banks    : ${banks.length}`);
  console.log(`   People   : ${people.length}`);
  console.log(`   Groups   : ${groups.length}`);
  console.log(`   Bills    : ${bills.length}`);
  console.log(`\n📁 Saved to: ${outPath}`);
}

exportData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
