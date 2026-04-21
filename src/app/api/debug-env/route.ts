import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.DATABASE_URL ?? 'NOT SET';
  
  // Mask password for security
  const masked = url.replace(/:([^@]+)@/, ':***@');
  
  return NextResponse.json({
    DATABASE_URL: masked,
    DIRECT_URL: (process.env.DIRECT_URL ?? 'NOT SET').replace(/:([^@]+)@/, ':***@'),
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
  });
}
