import { prisma } from '@/lib/prisma';
import DashboardClient from '@/app/dashboard/DashboardClient';
import { unstable_noStore as noStore } from 'next/cache';

async function getDashboardData() {
  noStore();
  
  const [bills, recentBills, groups, people] = await Promise.all([
    // All bills with basic stats
    prisma.bill.findMany({
      include: {
        items: true,
        payer: true,
        participants: { include: { person: true } },
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
