import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PersonUpdateSchema } from '@/lib/validations';
import { createClient } from '@/lib/supabase/server';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
    const userId = user.id;

    const body = await request.json();
    const validation = PersonUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: { message: 'Invalid data', details: validation.error.flatten().fieldErrors } }, { status: 400 });
    }
    
    // Check for unique display name if it's being changed
    if (validation.data.displayName) {
        const existingPerson = await prisma.person.findFirst({ where: { displayName: validation.data.displayName, userId, NOT: { id } } });
        if (existingPerson) {
          return NextResponse.json({ success: false, error: { message: 'Person with this display name already exists.' } }, { status: 409 });
        }
    }

    const updatedPerson = await prisma.person.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json({ success: true, data: updatedPerson });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: { message: 'An unexpected error occurred.' } }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Check if the person is part of any bills
    const billParticipant = await prisma.billParticipant.findFirst({
        where: { personId: id }
    });

    if (billParticipant) {
        return NextResponse.json({ success: false, error: { message: 'Cannot delete person. They are part of one or more bills.' } }, { status: 409 });
    }

    // Delete group memberships first
    await prisma.groupMember.deleteMany({
        where: { personId: id }
    });

    await prisma.person.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: { message: 'An unexpected error occurred.' } }, { status: 500 });
  }
}
