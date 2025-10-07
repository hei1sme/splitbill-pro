import { PrismaClient, BankType } from '../node_modules/.prisma/client-dev';
const prisma = new PrismaClient();

const vietnameseBanks = [
  { code: "VCB", name: "Vietcombank", type: "BANK" as BankType, logoUrl: "/banks/vcb.svg" },
  { code: "ACB", name: "ACB", type: "BANK" as BankType, logoUrl: "/banks/acb.svg" },
  { code: "TCB", name: "Techcombank", type: "BANK" as BankType, logoUrl: "/banks/tcb.svg" },
  { code: "VTB", name: "Vietinbank", type: "BANK" as BankType, logoUrl: "/banks/vtb.svg" },
  { code: "BIDV", name: "BIDV", type: "BANK" as BankType, logoUrl: "/banks/bidv.svg" },
  { code: "MOMO", name: "MoMo", type: "EWALLET" as BankType, logoUrl: "/banks/momo.svg" },
  { code: "ZALOPAY", name: "ZaloPay", type: "EWALLET" as BankType, logoUrl: "/banks/zalopay.svg" },
  { code: "VIB", name: "VIB", type: "BANK" as BankType, logoUrl: "/banks/vib.svg" },
  { code: "MB", name: "MB Bank", type: "BANK" as BankType, logoUrl: "/banks/mb.svg" },
  { code: "TPB", name: "TPBank", type: "BANK" as BankType, logoUrl: "/banks/tpb.svg" },
  { code: "VPB", name: "VPBank", type: "BANK" as BankType, logoUrl: "/banks/vpb.svg" },
  { code: "STB", name: "Sacombank", type: "BANK" as BankType, logoUrl: "/banks/stb.svg" },
  { code: "HDB", name: "HDBank", type: "BANK" as BankType, logoUrl: "/banks/hdb.svg" },
  { code: "OCB", name: "OCB", type: "BANK" as BankType, logoUrl: "/banks/ocb.svg" },
  { code: "MSB", name: "MSB", type: "BANK" as BankType, logoUrl: "/banks/msb.svg" },
  { code: "SHB", name: "SHB", type: "BANK" as BankType, logoUrl: "/banks/shb.svg" },
];

async function main() {
  console.log(`Start seeding ...`);
  for (const bank of vietnameseBanks) {
    const createdBank = await prisma.bank.create({
      data: bank,
    });
    console.log(`Created bank with code: ${createdBank.code}`);
  }
  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
