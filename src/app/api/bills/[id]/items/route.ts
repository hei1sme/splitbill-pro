import { PrismaClient } from '@prisma/client/dev';
import { NextResponse } from 'next/server';
import { BillItemCreateSchema } from '@/lib/validations';

const prisma = new PrismaClient();

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = BillItemCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid data', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { description, amount } = validation.data;

    if (amount === null) {
        return NextResponse.json({ message: 'Amount is required' }, { status: 400 });
    }

    const billItem = await prisma.billItem.create({
      data: {
        description,
        amount,
        billId: id,
      },
    });

    return NextResponse.json(billItem, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
