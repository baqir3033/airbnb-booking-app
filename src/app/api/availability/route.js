import pool, { initDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get('propertyId');

    if (!propertyId) {
      return NextResponse.json({ error: 'Missing propertyId' }, { status: 400 });
    }

    await initDb();
    const result = await pool.query(
      `SELECT start_date, end_date FROM bookings WHERE property_id = $1 AND status = 'confirmed'`,
      [propertyId]
    );
    return NextResponse.json({ bookings: result.rows }, { status: 200 });
  } catch (error) {
    console.error('Availability error:', error);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}
