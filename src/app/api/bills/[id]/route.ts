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
        items: {
          include: {
            splits: {
              include: {
                person: true,
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
    
    // Check if this is edit mode and use appropriate schema
    let validatedData;
    if (json.isEditMode) {
      try {
        validatedData = BillEditSchema.parse(json);
        console.log("[BILL_PUT] Edit schema validation successful");
      } catch (editError) {
        console.log("[BILL_PUT] Edit schema failed:", editError);
        throw editError;
      }
    } else {
      // Try enhanced schema first, fallback to basic schema for creation mode
      try {
        validatedData = BillUpdateEnhancedSchema.parse(json);
        console.log("[BILL_PUT] Enhanced schema validation successful");
      } catch (enhancedError) {
        console.log("[BILL_PUT] Enhanced schema failed:", enhancedError);
        try {
          validatedData = BillUpdateSchema.parse(json);
          console.log("[BILL_PUT] Basic schema validation successful");
        } catch (basicError) {
          console.log("[BILL_PUT] Basic schema also failed:", basicError);
          throw basicError;
        }
      }
    }

    // Extract only the fields that exist in the database schema
    const updateData: any = {};
    
    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.date !== undefined) updateData.date = validatedData.date;
    if (validatedData.payerId !== undefined) updateData.payerId = validatedData.payerId;
    
    // Handle fields that only exist in non-edit schemas
    if (!json.isEditMode) {
      if ('groupId' in validatedData && validatedData.groupId !== undefined) updateData.groupId = validatedData.groupId;
      if ('status' in validatedData && validatedData.status !== undefined) updateData.status = validatedData.status;
      
      // Handle enhanced fields
      if ('participantMode' in validatedData && validatedData.participantMode !== undefined) {
        updateData.participantMode = validatedData.participantMode;
      }
      
      if ('selectedPeople' in validatedData && validatedData.selectedPeople !== undefined) {
        // Store selected people as JSON in customParticipants field
        updateData.customParticipants = JSON.stringify(validatedData.selectedPeople);
      }
    }

    const updatedBill = await prisma.bill.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedBill);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log("[BILL_PUT] Validation error:", JSON.stringify(error.issues, null, 2));
      return new NextResponse(JSON.stringify({ 
        message: "Validation failed", 
        errors: error.issues 
      }), { status: 422 });
    }
    console.error("[BILL_PUT] Unexpected error:", error);
    return new NextResponse(JSON.stringify({ 
      message: error instanceof Error ? error.message : "Internal Server Error" 
    }), { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.$transaction(async (tx) => {
      await tx.billSplit.deleteMany({
        where: {
          billItem: {
            billId: id,
          },
        },
      });

      await tx.billItem.deleteMany({
        where: {
          billId: id,
        },
      });

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
