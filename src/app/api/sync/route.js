import pool, { initDb } from '@/lib/db';
import icalParser from 'node-ical';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    await initDb();
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'Missing iCal URL' }, { status: 400 });

    const events = await icalParser.async.fromURL(url);
    
    let imported = 0;
    
    const insertQuery = `
      INSERT INTO bookings (uid, guest_name, email, start_date, end_date, status)
      VALUES ($1, $2, $3, $4, $5, 'confirmed')
      ON CONFLICT (uid) DO NOTHING
    `;

    const parsedEvents = [];
    for (const k in events) {
      if (events.hasOwnProperty(k)) {
        const ev = events[k];
        if (ev.type === 'VEVENT') {
          parsedEvents.push({
            uid: ev.uid || crypto.randomUUID(),
            guestName: ev.summary || 'Airbnb Booking',
            email: 'airbnb@example.com',
            startDate: ev.start.toISOString().split('T')[0],
            endDate: ev.end.toISOString().split('T')[0],
          });
        }
      }
    }

    for (const ev of parsedEvents) {
      const result = await pool.query(insertQuery, [ev.uid, ev.guestName, ev.email, ev.startDate, ev.endDate]);
      if (result.rowCount > 0) imported++;
    }

    return NextResponse.json({ success: true, imported }, { status: 200 });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Failed to sync calendar' }, { status: 500 });
  }
}
