import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BillSplitCreateSchema } from "@/lib/validations";

export async function POST(
  request: Request,
  { params }: { params: { billId: string; itemId: string } }
) {
  try {
    const json = await request.json();
    const body = BillSplitCreateSchema.parse(json);

    // Verify the bill item exists and belongs to the bill
    const billItem = await prisma.billItem.findFirst({
      where: {
        id: params.itemId,
        billId: params.billId,
      },
    });

    if (!billItem) {
      return new NextResponse("Bill item not found", { status: 404 });
    }

    const split = await prisma.billSplit.create({
      data: {
        billItemId: params.itemId,
        personId: body.personId,
        amount: body.amount,
        splitMode: body.splitMode,
      },
      include: {
        person: true,
      },
    });

    return NextResponse.json(split, { status: 201 });
  } catch (error) {
    console.error("[BILL_SPLIT_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { billId: string; itemId: string } }
) {
  try {
    const splits = await prisma.billSplit.findMany({
      where: {
        billItemId: params.itemId,
        billItem: {
          billId: params.billId,
        },
      },
      include: {
        person: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(splits);
  } catch (error) {
    console.error("[BILL_SPLITS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
