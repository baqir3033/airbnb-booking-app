import pool, { initDb } from '@/lib/db';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req) {
  try {
    await initDb();
    const { propertyId, guestName, email, startDate, endDate, paymentMethod } = await req.json();

    if (!propertyId || !guestName || !email || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Check for conflicts for this specific property
    const conflictQuery = `
      SELECT id FROM bookings
      WHERE property_id = $1
      AND status = 'confirmed'
      AND (start_date < $2 AND end_date > $3)
    `;

    const conflictResult = await pool.query(conflictQuery, [propertyId, endDate, startDate]);

    if (conflictResult.rows.length > 0) {
      return NextResponse.json({ error: 'These dates are already booked.' }, { status: 409 });
    }

    // 2. SIMULATE TEST PAYMENT (Phase 4)
    console.log(`Processing test payment for ${guestName} via ${paymentMethod || 'Mock Card'}...`);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing delay

    // 3. Create Booking
    const uid = crypto.randomUUID();
    const insertQuery = `
      INSERT INTO bookings (uid, property_id, guest_name, email, start_date, end_date)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    await pool.query(insertQuery, [uid, propertyId, guestName, email, startDate, endDate]);

    return NextResponse.json({ success: true, uid }, { status: 201 });
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
