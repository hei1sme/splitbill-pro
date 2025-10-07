import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { BillCreateSchema, BillFormEnhancedSchema } from "@/lib/validations";

// Enhanced bill creation schema that accepts both formats
const BillCreateEnhancedSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.coerce.date(),
  groupId: z.string().min(1, "Group is required"),
  payerId: z.string().cuid("Invalid payer ID").min(1, "Payer is required"),
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "SETTLED"]).default("DRAFT"),
  // Enhanced fields (optional for backward compatibility)
  participantMode: z.enum(["GROUP", "MANUAL", "MIXED"]).optional(),
  selectedPeople: z.array(z.string()).optional(),
  quickAddNames: z.array(z.string()).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const groupId = searchParams.get("groupId");

    const bills = await prisma.bill.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(groupId && { groupId }),
      },
      include: {
        group: true,
        payer: true,
        items: true, // Include actual items, not just count
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(bills);
  } catch (error) {
    console.error("[BILLS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    console.log("[BILLS_POST] Received data:", JSON.stringify(json, null, 2));
    
    // Try enhanced schema first, fallback to basic
    let body: any;
    let isEnhanced = false;
    
    try {
      body = BillCreateEnhancedSchema.parse(json);
      isEnhanced = true;
      console.log("[BILLS_POST] Using enhanced schema");
    } catch {
      body = BillCreateSchema.parse(json);
      console.log("[BILLS_POST] Using basic schema");
    }
    
    console.log("[BILLS_POST] Parsed data:", JSON.stringify(body, null, 2));

    // Prepare bill data based on participant mode
    let billData: any = {
      title: body.title,
      description: body.description,
      date: body.date,
      payerId: body.payerId,
      status: body.status,
    };

    if (isEnhanced && body.participantMode) {
      console.log("[BILLS_POST] Processing enhanced participant mode:", body.participantMode);
      
      // Add enhanced fields
      billData.participantMode = body.participantMode;
      
      if (body.participantMode === "MANUAL") {
        // MANUAL mode: No group, store selected people in customParticipants
        billData.groupId = null;
        billData.customParticipants = JSON.stringify(body.selectedPeople || []);
        console.log("[BILLS_POST] MANUAL mode - storing custom participants:", body.selectedPeople);
        
      } else if (body.participantMode === "MIXED") {
        // MIXED mode: Keep original group, store additional people only
        billData.groupId = body.groupId;
        
        // Get existing group members to filter out duplicates
        const existingGroup = await prisma.group.findUnique({
          where: { id: body.groupId },
          include: { members: true },
        });
        
        if (existingGroup) {
          // Filter out people already in the group
          const existingMemberIds = existingGroup.members.map(m => m.personId);
          const additionalPeople = (body.selectedPeople || []).filter(
            (personId: string) => !existingMemberIds.includes(personId)
          );
          
          billData.customParticipants = JSON.stringify(additionalPeople);
          console.log("[BILLS_POST] MIXED mode - existing group members:", existingMemberIds);
          console.log("[BILLS_POST] MIXED mode - all selected people:", body.selectedPeople);
          console.log("[BILLS_POST] MIXED mode - additional participants only:", additionalPeople);
        } else {
          // Fallback if group not found
          billData.customParticipants = JSON.stringify(body.selectedPeople || []);
          console.log("[BILLS_POST] MIXED mode - group not found, storing all selected:", body.selectedPeople);
        }
        
      } else if (body.participantMode === "GROUP") {
        // GROUP mode: Standard group usage
        billData.groupId = body.groupId;
        billData.customParticipants = null;
        console.log("[BILLS_POST] GROUP mode - standard group usage");
      }
    } else {
      // Basic mode: Standard group usage
      billData.groupId = body.groupId;
    }

    const bill = await prisma.bill.create({
      data: billData,
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
      },
    });

    console.log("[BILLS_POST] Created bill successfully");
    console.log("[BILLS_POST] Participant mode:", (bill as any).participantMode);
    console.log("[BILLS_POST] Group members:", bill.group?.members?.length || 0);
    console.log("[BILLS_POST] Custom participants:", (bill as any).customParticipants);
    
    return NextResponse.json(bill, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });
    }
    console.error("[BILLS_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
