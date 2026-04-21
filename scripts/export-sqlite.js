const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../prisma/dev.db');
const db = new Database(dbPath, { readonly: true });

const result = { banks: [], people: [], groups: [], bills: [] };

result.banks = db.prepare('SELECT * FROM Bank').all();
result.people = db.prepare('SELECT * FROM Person').all();

const groups = db.prepare('SELECT * FROM "Group"').all();
const groupMembers = db.prepare('SELECT * FROM GroupMember').all();
result.groups = groups.map(g => ({
  ...g,
  members: groupMembers.filter(m => m.groupId === g.id).map(m => ({ personId: m.personId }))
}));

const bills = db.prepare('SELECT * FROM Bill').all();

result.bills = bills.map(b => {
  let participants = [];
  let items = [];

  if (b.description) {
    try {
      const parsed = JSON.parse(b.description);
      if (parsed.participants) participants = parsed.participants;
      if (parsed.items) {
        items = parsed.items.map((item, idx) => ({
          id: item.id,
          name: item.name || `Item ${idx + 1}`,
          fee: Number(item.fee || 0),
          splitMethod: item.splitMethod || 'EQUAL',
          type: item.type || 'NORMAL',
          order: item.order ?? idx,
          shares: (item.shares || []).map(s => ({
            participantId: s.participantId,
            amount: Number(s.amount || 0),
            include: s.include !== false,
            locked: s.locked || false,
            paid: s.paid || false,
          }))
        }));
      }
    } catch { /* not JSON */ }
  }

  return {
    id: b.id,
    title: b.title,
    date: b.date,
    status: b.status || 'COMPLETED',
    payerId: b.payerId,
    participants: participants.map(p => ({
      id: p.id || p.personId,
      personId: p.id || p.personId,
    })),
    items
  };
});

db.close();

const outPath = path.join(__dirname, 'migration-data.json');
fs.writeFileSync(outPath, JSON.stringify(result, null, 2));

const totalItems = result.bills.reduce((sum, b) => sum + b.items.length, 0);
const totalShares = result.bills.reduce((sum, b) => sum + b.items.reduce((s, i) => s + i.shares.length, 0), 0);

console.log('✅ Export complete:');
console.log('   Banks  :', result.banks.length);
console.log('   People :', result.people.length);
console.log('   Groups :', result.groups.length);
console.log('   Bills  :', result.bills.length);
console.log('   Items  :', totalItems);
console.log('   Shares :', totalShares);
console.log('\n📁 Saved to:', outPath);
