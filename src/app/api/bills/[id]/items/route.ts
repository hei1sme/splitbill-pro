import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const BillItemCreateSchema = z.object({
  description: z.string().min(1),
  amount: z.number().nullable()
});

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

    const item = await prisma.item.create({
      data: {
        name: description,
        fee: amount,
        billId: id,
        type: 'NORMAL',
        order: 0,
        splitMethod: 'EQUAL'
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
