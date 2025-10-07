import type { Bill, BillItem, Person } from ".prisma/client-dev";

export type BillWithItems = Bill & {
  items: BillItem[];
  payer: Person;
};
