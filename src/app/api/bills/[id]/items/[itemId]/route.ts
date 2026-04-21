import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const BillItemUpdateSchema = z.object({
  description: z.string().min(1).optional(),
  amount: z.number().optional()
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string, itemId: string }> }) {
  try {
    const { id, itemId } = await params;
    const body = await request.json();
    const validation = BillItemUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid data', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const existingItem = await prisma.item.findFirst({
      where: { id: itemId, billId: id },
    });

    if (!existingItem) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (validation.data.description !== undefined) updateData.name = validation.data.description;
    if (validation.data.amount !== undefined) updateData.fee = validation.data.amount;

    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: updateData,
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string, itemId: string }> }) {
  try {
    const { id, itemId } = await params;
    const existingItem = await prisma.item.findFirst({
      where: { id: itemId, billId: id },
    });

    if (!existingItem) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 });
    }

    await prisma.item.delete({
      where: { id: itemId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
