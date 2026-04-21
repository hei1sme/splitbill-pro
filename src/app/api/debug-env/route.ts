import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const url = process.env.DATABASE_URL ?? 'NOT SET';
  const masked = url.replace(/:([^@]+)@/, ':***@');

  // Test actual DB connection
  let dbStatus = 'untested';
  let dbError = null;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected ✅';
  } catch (e) {
    dbStatus = 'failed ❌';
    dbError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json({
    DATABASE_URL: masked,
    DIRECT_URL: (process.env.DIRECT_URL ?? 'NOT SET').replace(/:([^@]+)@/, ':***@'),
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
    db_connection: dbStatus,
    db_error: dbError,
  });
}
