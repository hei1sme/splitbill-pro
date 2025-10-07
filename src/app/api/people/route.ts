import { PrismaClient } from '../../../../node_modules/.prisma/client-dev';
import { NextResponse } from 'next/server';
import { PersonCreateSchema } from '@/lib/validations';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const bankCode = searchParams.get('bankCode');
  const active = searchParams.get('active');

  const where: any = {};
  if (search) {
    where.OR = [
      { displayName: { contains: search } },
      { accountNumber: { contains: search } },
      { accountHolder: { contains: search } },
    ];
  }
  if (bankCode) {
    where.bankCode = bankCode;
  }
  if (active) {
    where.active = active === 'true';
  }

  try {
    const people = await prisma.person.findMany({
      where,
      include: {
        bank: true,
      },
      orderBy: {
        displayName: 'asc',
      }
    });
    return NextResponse.json({ success: true, data: people });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: { message: 'An unexpected error occurred.' } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = PersonCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: { message: 'Invalid data', details: validation.error.flatten().fieldErrors } }, { status: 400 });
    }

    const { displayName } = validation.data;

    const existingPerson = await prisma.person.findUnique({ where: { displayName } });
    if (existingPerson) {
      return NextResponse.json({ success: false, error: { message: 'Person with this display name already exists.' } }, { status: 409 });
    }

    const newPerson = await prisma.person.create({
      data: validation.data,
    });

    return NextResponse.json({ success: true, data: newPerson }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: { message: 'An unexpected error occurred.' } }, { status: 500 });
  }
}
