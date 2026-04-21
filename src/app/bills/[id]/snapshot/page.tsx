import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import SnapshotView from './SnapshotView';


async function getBill(id: string) {
  noStore();
  const bill = await prisma.bill.findUnique({
    where: { id },
    include: {
      participants: {
        include: {
          person: {
            include: {
              bank: true,
            },
          },
        },
      },
      payer: {
        include: {
          bank: true,
        },
      },
      items: {
        include: {
          shares: {
            include: {
              participant: {
                include: {
                  person: {
                    include: {
                      bank: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });
  return bill;
}

export default async function SnapshotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bill = await getBill(id);

  if (!bill) {
    notFound();
  }

  return <SnapshotView bill={bill} />;
}
