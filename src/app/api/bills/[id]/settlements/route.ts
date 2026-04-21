import { NextResponse } from "next/server";

// NOTE: A dedicated Payment/Settlement model is not yet in the schema.
// This route is stubbed out to prevent build errors.
// When the Payment model is added to schema.prisma, implement using prisma.payment.*

export async function POST() {
  return NextResponse.json({ error: "Settlements feature coming soon" }, { status: 501 });
}

export async function GET() {
  return NextResponse.json([]);
}
