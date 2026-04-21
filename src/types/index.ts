import type { Bill, Item, Person, BillParticipant, ItemShare } from "@prisma/client";

export type BillWithItems = Bill & {
  items: Item[];
  payer: Person;
};

export type BillWithDetails = Bill & {
  items: (Item & { shares: ItemShare[] })[];
  payer: Person;
  participants: (BillParticipant & { person: Person })[];
};
