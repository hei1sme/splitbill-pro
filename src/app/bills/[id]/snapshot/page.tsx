import { PrismaClient } from '@prisma/client/dev';
import { notFound } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import SnapshotView from './SnapshotView';

const prisma = new PrismaClient();

async function getBill(id: string) {
  noStore();
  const bill = await prisma.bill.findUnique({
    where: { id },
    include: {
      group: {
        include: {
          members: {
            include: {
              person: {
                include: {
                  bank: true
                }
              }
            }
          }
        }
      },
      payer: {
        include: {
          bank: true
        }
      },
      items: {
        include: {
          splits: {
            include: {
              person: {
                include: {
                  bank: true
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
  return bill;
}

export default async function SnapshotPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const bill = await getBill(id);

  if (!bill) {
    notFound();
  }

  return <SnapshotView bill={bill} />;
}
