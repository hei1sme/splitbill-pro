const D = require('better-sqlite3');
const db = new D('prisma/dev.db', { readonly: true });

const bills = db.prepare('SELECT id, title, description FROM Bill').all();
let withItems = 0;
let totalItems = 0;

bills.forEach(b => {
  if (!b.description) return;
  try {
    const d = JSON.parse(b.description);
    if (d.items && d.items.length > 0) {
      withItems++;
      totalItems += d.items.length;
      if (withItems <= 2) {
        console.log(`\nBill: "${b.title}"`);
        console.log('  Keys:', Object.keys(d));
        console.log('  Items:', d.items.length);
        console.log('  Sample item:', JSON.stringify(d.items[0], null, 4));
      }
    }
  } catch {
    // not JSON
  }
});

console.log(`\nTotal bills with items in description: ${withItems} / ${bills.length}`);
console.log(`Total items: ${totalItems}`);
db.close();
