import pool, { initDb } from '@/lib/db';
import ical from 'ical-generator';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get('propertyId');

    if (!propertyId) {
      return new NextResponse('Missing propertyId', { status: 400 });
    }

    await initDb();
    const calendar = ical({ name: 'Property Availability' });

    const result = await pool.query(
      `SELECT * FROM bookings WHERE property_id = $1 AND status = 'confirmed'`,
      [propertyId]
    );

    result.rows.forEach(booking => {
      calendar.createEvent({
        start: new Date(booking.start_date),
        end: new Date(booking.end_date),
        summary: 'Booked',
        description: `Booking ID: ${booking.id}`,
        uid: booking.uid,
      });
    });

    return new NextResponse(calendar.toString(), {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="property-${propertyId}.ics"`,
      },
    });
  } catch (error) {
    console.error('iCal generation error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
