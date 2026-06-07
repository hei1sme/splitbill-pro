import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import BillDetails from './BillDetailsEnhanced';

async function getBill(id: string) {
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
          bank: true
        }
      },
      items: {
        include: {
          shares: {
            include: {
              participant: {
                include: {
                  person: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });
  
  if (!bill) return null;
  return bill;
}

/** Convert all Prisma Decimal fields to plain numbers so they can cross the Server→Client boundary */
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

export default async function BillDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bill = await getBill(id);

  if (!bill) {
    notFound();
  }

  return <BillDetails bill={serializeBill(bill)} />;
}
