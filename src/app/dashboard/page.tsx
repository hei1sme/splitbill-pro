import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import DashboardClient from '@/app/dashboard/DashboardClient';
import { unstable_noStore as noStore } from 'next/cache';
import { redirect } from 'next/navigation';

async function getDashboardData(userId: string) {
  noStore();

  const [bills, recentBills, groups, peopleCount] = await Promise.all([
    prisma.bill.findMany({
      where: { userId },
      include: {
        items: true,
        payer: true,
        participants: { include: { person: true } },
        _count: {
          select: { items: true },
        },
      },
      orderBy: { date: 'desc' },
    }),

    prisma.bill.findMany({
      where: { userId },
      take: 10,
      include: {
        payer: true,
        items: true,
      },
      orderBy: { updatedAt: 'desc' },
    }),

    prisma.group.findMany({
      where: { userId },
      include: {
        _count: {
          select: { members: true },
        },
      },
    }),

    prisma.person.count({
      where: { userId },
    }),
  ]);

  return { bills, recentBills, groups, peopleCount };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const data = await getDashboardData(user.id);

  return <DashboardClient data={data} />;
}
