import pool, { initDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initDb();
    const result = await pool.query(`SELECT start_date, end_date FROM bookings WHERE status = 'confirmed'`);
    return NextResponse.json({ bookings: result.rows }, { status: 200 });
  } catch (error) {
    console.error('Availability error:', error);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}
