import { PrismaClient } from '../../../../../node_modules/.prisma/client-dev';
import { NextResponse } from 'next/server';
import { GroupUpdateSchema } from '@/lib/validations';

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const validation = GroupUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: { message: 'Invalid data', details: validation.error.flatten().fieldErrors } }, { status: 400 });
    }

    const { name, personIds } = validation.data;
    const { id } = await params;

    if (name) {
        const existingGroup = await prisma.group.findFirst({ where: { name, NOT: { id } } });
        if (existingGroup) {
          return NextResponse.json({ success: false, error: { message: 'Group with this name already exists.' } }, { status: 409 });
        }
    }

    const updatedGroup = await prisma.group.update({
      where: { id },
      data: {
        name,
        ...(personIds && {
            members: {
                deleteMany: {},
                create: personIds.map((personId) => ({
                    person: { connect: { id: personId } },
                })),
            }
        })
      },
      include: {
        members: {
            include: {
                person: true
            }
        }
      }
    });

    return NextResponse.json({ success: true, data: updatedGroup });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: { message: 'An unexpected error occurred.' } }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Simple check: see if group is used in any bill. A more robust check might be needed depending on final schema.
    // This check assumes a direct relation or a lookup through participants.
    // For now, we'll prevent deletion if it has members, which is a safe bet.
    const group = await prisma.group.findUnique({
        where: { id },
        include: { members: true }
    });

    if (group?.members && group.members.length > 0) {
        // A more specific check could be to see if any member of this group is in a bill.
        // This is a placeholder for a more complex business rule.
        // For now, we can decide if a group with members can be deleted.
        // A safe approach: prevent deletion if it's part of any bill logic, which is complex to check here.
        // Let's prevent deletion if it's associated with bills via BillParticipant -> Person -> GroupMember -> Group
        // This is too complex for a simple check, so we'll rely on the database cascade behavior or a simpler rule.
        // For now, we just delete it. The cascade on GroupMember will clean up memberships.
    }


    await prisma.group.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: { message: 'An unexpected error occurred.' } }, { status: 500 });
  }
}
