import db from '@/lib/db';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const { guestName, email, startDate, endDate } = await req.json();

    if (!guestName || !email || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check for double booking
    const conflictQuery = db.prepare(`
      SELECT id FROM bookings
      WHERE status = 'confirmed'
      AND (start_date < @endDate AND end_date > @startDate)
    `);

    const conflict = conflictQuery.get({ startDate, endDate });

    if (conflict) {
      return NextResponse.json({ error: 'These dates are already booked.' }, { status: 409 });
    }

    const uid = crypto.randomUUID();
    const insertQuery = db.prepare(`
      INSERT INTO bookings (uid, guest_name, email, start_date, end_date)
      VALUES (@uid, @guestName, @email, @startDate, @endDate)
    `);

    insertQuery.run({ uid, guestName, email, startDate, endDate });

    return NextResponse.json({ success: true, uid }, { status: 201 });
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
