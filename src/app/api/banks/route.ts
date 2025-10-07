import { PrismaClient } from '../../../../node_modules/.prisma/client-dev';
import { NextResponse } from 'next/server';
import { BankCreateSchema } from '@/lib/validations';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const banks = await prisma.bank.findMany({
      include: {
        _count: {
          select: { people: true },
        },
      },
      orderBy: {
        name: 'asc',
      }
    });
    return NextResponse.json({ success: true, data: banks });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: { message: 'An unexpected error occurred.' } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = BankCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: { message: 'Invalid data', details: validation.error.flatten().fieldErrors } }, { status: 400 });
    }

    const { code, name, type, logoUrl } = validation.data;

    const existingBank = await prisma.bank.findUnique({ where: { code } });
    if (existingBank) {
      return NextResponse.json({ success: false, error: { message: 'Bank with this code already exists.' } }, { status: 409 });
    }

    const newBank = await prisma.bank.create({
      data: {
        code,
        name,
        type,
        logoUrl,
      },
    });

    return NextResponse.json({ success: true, data: newBank }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: { message: 'An unexpected error occurred.' } }, { status: 500 });
  }
}
