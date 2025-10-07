import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SettlementCreateSchema } from "@/lib/validations";

export async function POST(
  request: Request,
  { params }: { params: { billId: string } }
) {
  try {
    const json = await request.json();
    const body = SettlementCreateSchema.parse(json);

    // Verify the bill exists
    const bill = await prisma.bill.findUnique({
      where: { id: params.billId },
    });

    if (!bill) {
      return new NextResponse("Bill not found", { status: 404 });
    }

    const settlement = await prisma.settlement.create({
      data: {
        billId: params.billId,
        payerId: body.payerId,
        payeeId: body.payeeId,
        amount: body.amount,
        status: body.status,
      },
      include: {
        payer: true,
        payee: true,
      },
    });

    return NextResponse.json(settlement, { status: 201 });
  } catch (error) {
    console.error("[SETTLEMENT_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { billId: string } }
) {
  try {
    const settlements = await prisma.settlement.findMany({
      where: {
        billId: params.billId,
      },
      include: {
        payer: true,
        payee: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(settlements);
  } catch (error) {
    console.error("[SETTLEMENTS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
