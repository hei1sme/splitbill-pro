import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    // Get existing bill participants to map personId to BillParticipant id
    const existingParticipants = await prisma.billParticipant.findMany({
      where: { billId: id }
    });

    // Helper to find correct participant ID
    const getParticipantId = (frontEndId: string) => {
      // The frontend might be sending Person.id or BillParticipant.id
      // Let's try to match by personId first, then fallback to id
      const match = existingParticipants.find(p => p.personId === frontEndId || p.id === frontEndId);
      if (match) return match.id;
      return null;
    };

    await prisma.$transaction(async (tx) => {
      // 1. Delete existing items (this cascades to shares)
      await tx.item.deleteMany({
        where: { billId: id }
      });

      // 2. Recreate items and shares
      for (const item of data.items) {
        // Create the item
        const createdItem = await tx.item.create({
          data: {
            billId: id,
            name: item.name,
            fee: Number(item.fee) || 0,
            type: item.type || "NORMAL",
            order: item.order || 0,
            splitMethod: item.splitMethod || "EQUAL",
          }
        });

        // Ensure we have valid shares
        if (item.shares && Array.isArray(item.shares)) {
          const validShares = item.shares
            .filter((s: any) => s.include && getParticipantId(s.participantId))
            .map((s: any) => ({
              itemId: createdItem.id,
              participantId: getParticipantId(s.participantId)!,
              amount: Number(s.amount) || 0,
              locked: Boolean(s.locked),
              paid: Boolean(s.paid),
            }));

          if (validShares.length > 0) {
            await tx.itemShare.createMany({
              data: validShares
            });
          }
        }
      }

      // 3. Update the description with settings only, clear JSON backup
      await tx.bill.update({
        where: { id },
        data: {
          description: data.settings ? JSON.stringify({ settings: data.settings }) : null
        }
      });
    });

    return NextResponse.json({ 
      success: true, 
      message: "Bill data saved to database successfully",
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
