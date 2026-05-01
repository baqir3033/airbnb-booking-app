import pool, { initDb } from '@/lib/db';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req) {
  try {
    await initDb();
    const { guestName, email, startDate, endDate } = await req.json();

    if (!guestName || !email || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const conflictQuery = `
      SELECT id FROM bookings
      WHERE status = 'confirmed'
      AND (start_date < $1 AND end_date > $2)
    `;

    const conflictResult = await pool.query(conflictQuery, [endDate, startDate]);

    if (conflictResult.rows.length > 0) {
      return NextResponse.json({ error: 'These dates are already booked.' }, { status: 409 });
    }

    const uid = crypto.randomUUID();
    const insertQuery = `
      INSERT INTO bookings (uid, guest_name, email, start_date, end_date)
      VALUES ($1, $2, $3, $4, $5)
    `;

    await pool.query(insertQuery, [uid, guestName, email, startDate, endDate]);

    return NextResponse.json({ success: true, uid }, { status: 201 });
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
