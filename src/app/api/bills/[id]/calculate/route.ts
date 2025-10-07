import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Get the bill with all its items and group members
    const bill = await prisma.bill.findUnique({
      where: { id },
      include: {
        items: true,
        group: {
          include: {
            members: {
              include: {
                person: true,
              },
            },
          },
        },
        payer: true,
      },
    });

    if (!bill) {
      return new NextResponse("Bill not found", { status: 404 });
    }

    const groupMembers = bill.group.members.map(member => member.person);
    const totalAmount = bill.items.reduce((sum, item) => sum + item.amount, 0);
    const splitAmount = totalAmount / groupMembers.length;

    // Calculate what each person owes
    const balances = groupMembers.map(person => ({
      personId: person.id,
      name: person.displayName,
      owes: person.id === bill.payerId ? 0 : splitAmount,
      paid: person.id === bill.payerId ? totalAmount : 0,
      balance: person.id === bill.payerId ? totalAmount - splitAmount : -splitAmount,
    }));

    // Generate settlement recommendations
    const settlements = [];
    const debtors = balances.filter(b => b.balance < 0);
    const creditors = balances.filter(b => b.balance > 0);

    for (const debtor of debtors) {
      for (const creditor of creditors) {
        if (debtor.balance < 0 && creditor.balance > 0) {
          const amount = Math.min(Math.abs(debtor.balance), creditor.balance);
          settlements.push({
            payerId: debtor.personId,
            payerName: debtor.name,
            payeeId: creditor.personId,
            payeeName: creditor.name,
            amount: amount,
          });
          debtor.balance += amount;
          creditor.balance -= amount;
        }
      }
    }

    return NextResponse.json({
      bill,
      balances,
      settlements,
      totalAmount,
      splitAmount,
    });
  } catch (error) {
    console.error("[BILL_CALCULATE_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
