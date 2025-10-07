import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    // For now, we'll store the data in a temporary format
    // In a real application, you'd want to properly save items and splits to the database
    
    // Update the bill with the current data
    await prisma.bill.update({
      where: { id },
      data: {
        // Store the current state as JSON in description or a new field
        description: JSON.stringify({
          participants: data.participants,
          items: data.items,
          settings: data.settings,
          lastSaved: new Date()
        })
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Bill data saved successfully",
      savedAt: new Date()
    });

  } catch (error) {
    console.error("Error saving bill data:", error);
    return NextResponse.json(
      { error: "Failed to save bill data" },
      { status: 500 }
    );
  }
}
