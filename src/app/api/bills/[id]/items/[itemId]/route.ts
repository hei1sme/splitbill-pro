import { PrismaClient } from '@prisma/client/dev';
import { NextResponse } from 'next/server';
import { BillItemUpdateSchema } from '@/lib/validations';

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: Promise<{ id: string, itemId: string }> }) {
  try {
    const { id, itemId } = await params;
    const body = await request.json();
    const validation = BillItemUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid data', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const billItem = await prisma.billItem.findUnique({
      where: { id: itemId, billId: id },
    });

    if (!billItem) {
      return NextResponse.json({ message: 'Bill item not found' }, { status: 404 });
    }

    const updatedBillItem = await prisma.billItem.update({
      where: { id: itemId },
      data: validation.data,
    });

    return NextResponse.json(updatedBillItem);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string, itemId: string }> }) {
  try {
    const { id, itemId } = await params;
    const billItem = await prisma.billItem.findUnique({
      where: { id: itemId, billId: id },
    });

    if (!billItem) {
      return NextResponse.json({ message: 'Bill item not found' }, { status: 404 });
    }

    await prisma.billItem.delete({
      where: { id: itemId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
