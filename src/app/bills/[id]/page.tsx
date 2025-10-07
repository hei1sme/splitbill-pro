import { PrismaClient } from '@prisma/client/dev';
import { notFound } from 'next/navigation';
import BillDetails from './BillDetailsEnhanced';

const prisma = new PrismaClient();

async function getBill(id: string) {
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
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });
  
  if (!bill) return null;
  
  // Fetch custom participants data if needed
  let customParticipantsData = null;
  if ((bill as any).customParticipants) {
    try {
      const customParticipantIds = JSON.parse((bill as any).customParticipants);
      if (customParticipantIds.length > 0) {
        customParticipantsData = await prisma.person.findMany({
          where: {
            id: { in: customParticipantIds }
          },
          include: {
            bank: true
          }
        });
      }
    } catch (error) {
      console.error('[getBill] Error parsing custom participants:', error);
    }
  }
  
  return {
    ...bill,
    customParticipantsData
  };
}

export default async function BillDetailsPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const bill = await getBill(id);

  if (!bill) {
    notFound();
  }

  return <BillDetails bill={bill} />;
}
