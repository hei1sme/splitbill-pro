import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SettlementCreateSchema } from "@/lib/validations";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const json = await request.json();
    const body = SettlementCreateSchema.parse(json);

    // Verify the bill exists
    const bill = await prisma.bill.findUnique({
      where: { id },
    });

    if (!bill) {
      return new NextResponse("Bill not found", { status: 404 });
    }

    const settlement = await prisma.settlement.create({
      data: {
        billId: id,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const settlements = await prisma.settlement.findMany({
      where: {
        billId: id,
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
