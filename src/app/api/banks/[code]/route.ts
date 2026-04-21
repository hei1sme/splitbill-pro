import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BankUpdateSchema } from '@/lib/validations';

export async function PUT(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code: paramCode } = await params;
    const body = await request.json();
    const validation = BankUpdateSchema.safeParse({ ...body, code: paramCode });

    if (!validation.success) {
      return NextResponse.json({ success: false, error: { message: 'Invalid data', details: validation.error.flatten().fieldErrors } }, { status: 400 });
    }

    const { code, ...dataToUpdate } = validation.data;

    const updatedBank = await prisma.bank.update({
      where: { code },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, data: updatedBank });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: { message: 'An unexpected error occurred.' } }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;

    const bankInUse = await prisma.person.findFirst({
      where: { bankCode: code },
    });

    if (bankInUse) {
      return NextResponse.json({ success: false, error: { message: 'Cannot delete bank. It is currently in use by at least one person.' } }, { status: 409 });
    }

    await prisma.bank.delete({
      where: { code },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: { message: 'An unexpected error occurred.' } }, { status: 500 });
  }
}
