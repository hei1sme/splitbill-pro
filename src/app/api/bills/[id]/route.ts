import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { BillUpdateSchema, BillUpdateEnhancedSchema, BillEditSchema } from "@/lib/validations";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bill = await prisma.bill.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            person: true,
          },
        },
        payer: true,
        items: {
          include: {
            shares: {
              include: {
                participant: {
                   include: { person: true }
                }
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!bill) {
      return new NextResponse("Bill not found", { status: 404 });
    }

    return NextResponse.json(bill);
  } catch (error) {
    console.error("[BILL_GET_BY_ID]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const json = await request.json();
    console.log("[BILL_PUT] Received data:", JSON.stringify(json, null, 2));
    
    let validatedData;
    if (json.isEditMode) {
      validatedData = BillEditSchema.parse(json);
    } else {
      try {
        validatedData = BillUpdateEnhancedSchema.parse(json);
      } catch (enhancedError) {
        validatedData = BillUpdateSchema.parse(json);
      }
    }

    const updateData: any = {};
    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.date !== undefined) updateData.date = validatedData.date;
    if (validatedData.payerId !== undefined) updateData.payerId = validatedData.payerId;
    if (!json.isEditMode && 'status' in validatedData && validatedData.status !== undefined) {
      updateData.status = validatedData.status;
    }

    // Changing participants after creation isn't handled here directly unless we want to rebuild BillParticipants.
    // For now we just update the Bill root properties.

    const updatedBill = await prisma.bill.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedBill);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ message: "Validation failed", errors: error.issues }), { status: 422 });
    }
    console.error("[BILL_PUT]", error);
    return new NextResponse(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.$transaction(async (tx) => {
      // Cascade delete handles item shares and items automatically since onDelete: Cascade
      await tx.bill.delete({
        where: { id },
      });
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[BILL_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
