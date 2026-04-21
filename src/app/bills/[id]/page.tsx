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
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });
  
  if (!bill) return null;

  return bill;
}

export default async function BillDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bill = await getBill(id);

  if (!bill) {
    notFound();
  }

  return <BillDetails bill={bill} />;
}
