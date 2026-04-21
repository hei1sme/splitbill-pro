import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { BillCreateSchema, BillFormEnhancedSchema } from "@/lib/validations";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const bills = await prisma.bill.findMany({
      where: {
        userId: user.id,
        ...(status && { status: status as any }),
      },
      include: {
        payer: true,
        participants: {
          include: {
            person: true,
          }
        },
        items: true,
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    console.log("[BILLS_POST] Received data:", JSON.stringify(json, null, 2));

    let body: any;
    let isEnhanced = false;

    try {
      body = BillFormEnhancedSchema.parse(json);
      isEnhanced = true;
    } catch {
      body = BillCreateSchema.parse(json);
    }

    let participantIds: string[] = [];

    // Resolve Participants
    if (isEnhanced && body.participantMode) {
      if (body.participantMode === "MANUAL") {
        participantIds = body.selectedPeople || [];
      } else if (body.participantMode === "MIXED") {
        const existingGroup = await prisma.group.findUnique({
          where: { id: body.groupId },
          include: { members: true },
        });
        const existingMemberIds = existingGroup ? existingGroup.members.map(m => m.personId) : [];
        const additionalPeople = (body.selectedPeople || []).filter(
          (personId: string) => !existingMemberIds.includes(personId)
        );
        participantIds = [...existingMemberIds, ...additionalPeople];
      } else if (body.participantMode === "GROUP") {
        const existingGroup = await prisma.group.findUnique({
          where: { id: body.groupId },
          include: { members: true },
        });
        if (existingGroup) {
          participantIds = existingGroup.members.map(m => m.personId);
        }
      }
    } else if (body.groupId) {
      const existingGroup = await prisma.group.findUnique({
        where: { id: body.groupId },
        include: { members: true },
      });
      if (existingGroup) {
        participantIds = existingGroup.members.map(m => m.personId);
      }
    }

    // Ensure payer is in participants
    if (!participantIds.includes(body.payerId)) {
      participantIds.push(body.payerId);
    }

    const bill = await prisma.bill.create({
      data: {
        userId: user.id,
        title: body.title,
        description: body.description,
        date: body.date,
        payerId: body.payerId,
        status: body.status,
        participants: {
          create: participantIds.map((personId, index) => ({
            personId: personId,
            isPayer: personId === body.payerId,
            order: index
          }))
        }
      },
      include: {
        participants: {
          include: { person: true }
        },
        payer: true,
      },
    });

    return NextResponse.json(bill, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });
    }
    console.error("[BILLS_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
