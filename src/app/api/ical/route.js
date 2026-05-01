import pool, { initDb } from '@/lib/db';
import ical from 'ical-generator';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initDb();
    const calendar = ical({ name: 'VillaLuxe Availability' });

    const result = await pool.query(`SELECT * FROM bookings WHERE status = 'confirmed'`);

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
        'Content-Disposition': 'attachment; filename="calendar.ics"',
      },
    });
  } catch (error) {
    console.error('iCal generation error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
