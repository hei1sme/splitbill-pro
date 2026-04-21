import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GroupCreateSchema } from '@/lib/validations';

export async function GET() {
  try {
    const groups = await prisma.group.findMany({
      include: {
        members: {
          include: {
            person: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      }
    });

    // Transform the data to match what the frontend expects
    const transformedGroups = groups.map(group => ({
      ...group,
      people: group.members.map(member => member.person)
    }));

    return NextResponse.json(transformedGroups);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = GroupCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: { message: 'Invalid data', details: validation.error.flatten().fieldErrors } }, { status: 400 });
    }

    const { name, personIds } = validation.data;

    // Hardcoded default user ID for now until Auth is fully integrated
    const userId = "default-org-user-id";

    // Find first instead of findUnique because unique is compound
    const existingGroup = await prisma.group.findFirst({ where: { name, userId } });
    if (existingGroup) {
      return NextResponse.json({ success: false, error: { message: 'Group with this name already exists.' } }, { status: 409 });
    }

    const newGroup = await prisma.group.create({
      data: {
        name,
        userId,
        members: {
          create: personIds.map((personId) => ({
            person: { connect: { id: personId } },
          })),
        },
      },
      include: {
        members: {
            include: {
                person: true
            }
        }
      }
    });

    return NextResponse.json({ success: true, data: newGroup }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: { message: 'An unexpected error occurred.' } }, { status: 500 });
  }
}
