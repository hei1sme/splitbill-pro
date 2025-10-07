import { PrismaClient } from '@prisma/client/dev';
import DashboardClient from '@/app/dashboard/DashboardClient';
import { unstable_noStore as noStore } from 'next/cache';

const prisma = new PrismaClient();

async function getDashboardData() {
  noStore();
  
  const [bills, recentBills, groups, people] = await Promise.all([
    // All bills with basic stats
    prisma.bill.findMany({
      include: {
        items: true,
        group: true,
        payer: true,
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    }),
    
    // Recent bills for activity feed
    prisma.bill.findMany({
      take: 10,
      include: {
        group: true,
        payer: true,
        items: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    }),
    
    // Groups with member counts
    prisma.group.findMany({
      include: {
        _count: {
          select: {
            members: true,
            bills: true,
          },
        },
      },
    }),
    
    // Total people count
    prisma.person.count(),
  ]);

  return {
    bills,
    recentBills,
    groups,
    peopleCount: people,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return <DashboardClient data={data} />;
}
