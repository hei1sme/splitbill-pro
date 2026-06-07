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

/** Convert Prisma Decimal fields to plain numbers for Client Component boundary */
function serializeBill(bill: NonNullable<Awaited<ReturnType<typeof getBill>>>) {
  return {
    ...bill,
    items: bill.items.map(item => ({
      ...item,
      fee: item.fee !== null ? Number(item.fee) : null,
      shares: item.shares.map(share => ({
        ...share,
        amount: Number(share.amount),
      })),
    })),
  };
}

export default async function SnapshotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bill = await getBill(id);

  if (!bill) {
    notFound();
  }

  return <SnapshotView bill={serializeBill(bill)} />;
}
