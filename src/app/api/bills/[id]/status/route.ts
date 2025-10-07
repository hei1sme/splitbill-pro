import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();
    
    // Validate status
    const validStatuses = ['DRAFT', 'ACTIVE', 'COMPLETED', 'SETTLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Update the bill status
    const updatedBill = await prisma.bill.update({
      where: { id },
      data: { 
        status: status as any, // Use the new status values directly
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Bill status updated to ${status}`,
      bill: updatedBill
    });

  } catch (error) {
    console.error("Error updating bill status:", error);
    return NextResponse.json(
      { error: "Failed to update bill status" },
      { status: 500 }
    );
  }
}
