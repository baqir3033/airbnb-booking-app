import db from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const bookings = db.prepare(`SELECT start_date, end_date FROM bookings WHERE status = 'confirmed'`).all();
    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error) {
    console.error('Availability error:', error);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}
