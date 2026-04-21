import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const ShareCreateSchema = z.object({
  personId: z.string(),
  amount: z.number()
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params;
    const body = await request.json();
    const validation = ShareCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid data', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { personId, amount } = validation.data;

    // We must find the BillParticipant for this personId in this bill
    const participant = await prisma.billParticipant.findFirst({
        where: { billId: id, personId }
    });

    if (!participant) {
        return NextResponse.json({ message: 'Person is not a participant in this bill' }, { status: 400 });
    }

    const share = await prisma.itemShare.create({
      data: {
        itemId,
        participantId: participant.id,
        amount,
      },
    });

    return NextResponse.json(share, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string; itemId: string }> }
  ) {
    try {
      const { itemId } = await params;
      const url = new URL(request.url);
      const splitId = url.searchParams.get('splitId');

      if (!splitId) {
          return NextResponse.json({ message: 'Share ID is required' }, { status: 400 });
      }

      await prisma.itemShare.delete({
        where: { id: splitId, itemId },
      });
  
      return new NextResponse(null, { status: 204 });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
  }
